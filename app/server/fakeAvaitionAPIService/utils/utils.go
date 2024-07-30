package utils

import (
	"bytes"
	"context"
	"encoding/json"
	"math/rand"
	"net/http"
	"server/fakeAvaitionAPIService/database"
	"server/fakeAvaitionAPIService/logger"
	"server/fakeAvaitionAPIService/models"
	"server/fakeAvaitionAPIService/seed"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	updateTicker     *time.Ticker
	updateStopChan   chan struct{}
	updateWg         sync.WaitGroup
	updateMutex      sync.Mutex
	isUpdating       bool
	autoStopTimer    *time.Timer
	predefinedValues = map[string][]interface{}{
		"status":         {"Cancelled", "Delayed"},
		"departure_gate": {"A9", "B15", "C16", "A16", "C8", "B16", "B1", "C11", "A10"},
		"arrival_gate":   {"B14", "D11", "F12", "F13", "K13", "D13", "D19", "F1"},
	}
)

type NotificationPayload struct {
	FoundFlight    models.SubscribeUsers  `json:"found_flight"`
	Reason         map[string]interface{} `json:"reason"`
	SelectedFlight models.Flight          `json:"selected_flight"`
	Timestamp      time.Time              `json:"timestamp"`
}

func SeedDatabase() error {
	flights, err := seed.GetFlightData()
	if err != nil {
		return err
	}

	collection := database.GetCollection("aviation_db", "flights")

	for _, flight := range flights {
		logger.ServerLogger.Println(flight)
		_, err := collection.InsertOne(context.Background(), flight)
		if err != nil {
			logger.ServerLogger.Printf("[ERROR] Failed to insert flight %s: %v", flight.FlightID, err)
			return err
		}
	}

	logger.ServerLogger.Println("[INFO] Database seeded successfully")
	return nil
}

func GetRandomElement(arr []interface{}) interface{} {
	return arr[rand.Intn(len(arr))]
}

func GetRandomProperty(props []string) string {
	return props[rand.Intn(len(props))]
}

func sendNotification(foundFlight models.SubscribeUsers, selectedFlight models.Flight, reason map[string]interface{}) error {
	payload := NotificationPayload{
		FoundFlight:    foundFlight,
		SelectedFlight: selectedFlight,
		Reason:         reason,
		Timestamp:      time.Now(),
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		logger.ServerLogger.Println("failed to marshal payload")
		return nil
	}

	resp, err := http.Post("http://localhost:5000/api/send-notification", "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		logger.ServerLogger.Printf("failed to send POST request: %v", err)
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		logger.ServerLogger.Printf("received non-OK response: %s", resp.Status)
		return nil
	}

	return nil
}

func UpdateRandomFlight() {
	var subscribed_users []models.SubscribeUsers
	collection := database.GetCollection("aviation_db", "flights")
	subscribed_collection := database.GetCollection("aviation_db", "subscribed_users")
	var results []models.Flight

	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		logger.ServerLogger.Printf("[ERROR] fetching flights: %v", err)
		return
	}
	defer cursor.Close(context.Background())
	if err = cursor.All(context.Background(), &results); err != nil {
		logger.ServerLogger.Printf("[ERROR] decoding flights: %v", err)
		return
	}
	if len(results) == 0 {
		logger.ServerLogger.Println("[ERROR] No flights found")
		return
	}

	selectedFlight := results[rand.Intn(len(results))]
	properties := []string{"status", "departure_gate", "arrival_gate"}
	selectedProperty := GetRandomProperty(properties)
	var newValue interface{}
	foundNewValue := false
	for !foundNewValue {
		newValue = GetRandomElement(predefinedValues[selectedProperty])
		switch selectedProperty {
		case "status":
			if newValue != selectedFlight.Status {
				foundNewValue = true
			}
		case "departure_gate":
			if newValue != selectedFlight.DepartureGate {
				foundNewValue = true
			}
		case "arrival_gate":
			if newValue != selectedFlight.ArrivalGate {
				foundNewValue = true
			}
		}
	}

	subscribed_cursor, subscribed_err := subscribed_collection.Find(context.Background(), bson.M{})
	if subscribed_err != nil {
		logger.ServerLogger.Printf("[ERROR] fetching subscribed users: %v", subscribed_err)
		return
	}
	defer subscribed_cursor.Close(context.Background())
	if err = subscribed_cursor.All(context.Background(), &subscribed_users); err != nil {
		return
	}

	// Adjust the reason based on selectedProperty
	var reason map[string]interface{}
	if selectedProperty == "status" && newValue == "On Time" {
		reason = map[string]interface{}{"reason": "on_time"}
	} else if selectedProperty == "status" && newValue == "Cancelled" {
		reason = map[string]interface{}{"reason": "cancelled"}
	} else if selectedProperty == "status" && newValue == "Delayed" {
		reason = map[string]interface{}{"reason": "delayed"}
	} else if selectedProperty == "departure_gate" || selectedProperty == "arrival_gate" {
		reason = map[string]interface{}{"reason": "gate_changed"}
	} else {
		reason = map[string]interface{}{selectedProperty: newValue}
	}

	for _, flight := range subscribed_users {
		if flight.FlightID == selectedFlight.FlightID {
			sendNotification(flight, selectedFlight, reason)
			break
		}
	}

	update := bson.M{
		"$set": bson.M{selectedProperty: newValue},
	}
	filter := bson.M{"_id": selectedFlight.ID}
	_, err = collection.UpdateOne(context.Background(), filter, update, options.Update().SetUpsert(false))
	if err != nil {
		logger.ServerLogger.Printf("[ERROR] updating flight: %v", err)
		return
	}
	logger.ServerLogger.Printf("[INFO] Updated flight %v: %s = %v", selectedFlight.ID.Hex(), selectedProperty, newValue)
}

func UpdateFlightStatusPeriodically(deltaTime time.Duration) {
	updateMutex.Lock()
	defer updateMutex.Unlock()

	if isUpdating {
		return
	}

	if updateTicker != nil {
		updateTicker.Stop()
	}
	updateTicker = time.NewTicker(deltaTime)
	updateStopChan = make(chan struct{})
	isUpdating = true

	// stop update after 8 hours if it didn't stop manually
	autoStopTimer = time.AfterFunc(8*time.Hour, func() {
		StopUpdateProcess()
	})

	updateWg.Add(1)
	go func() {
		defer updateWg.Done()
		for {
			select {
			case <-updateTicker.C:
				UpdateRandomFlight()
			case <-updateStopChan:
				return
			}
		}
	}()

}

func StopUpdateProcess() {
	updateMutex.Lock()
	defer updateMutex.Unlock()

	if !isUpdating {
		return
	}

	if updateStopChan != nil {
		close(updateStopChan)
	}
	if updateTicker != nil {
		updateTicker.Stop()
	}
	if autoStopTimer != nil {
		autoStopTimer.Stop()
	}
	updateWg.Wait()
	updateStopChan = nil
	updateTicker = nil
	autoStopTimer = nil
	isUpdating = false
}

func IsUpdating() bool {
	updateMutex.Lock()
	defer updateMutex.Unlock()
	return isUpdating
}
