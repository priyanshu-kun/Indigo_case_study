package utils

import (
	"context"
	"log"
	"math/rand"
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
			log.Printf("Failed to insert flight %s: %v", flight.FlightID, err)
			return err
		}
	}

	log.Println("Database seeded successfully")
	return nil
}

func GetRandomElement(arr []interface{}) interface{} {
	return arr[rand.Intn(len(arr))]
}

func GetRandomProperty(props []string) string {
	return props[rand.Intn(len(props))]
}

func UpdateRandomFlight() {
	collection := database.GetCollection("aviation_db", "flights")
	var results []models.Flight

	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		logger.ServerLogger.Printf("Error fetching flights: %v", err)
		return
	}
	defer cursor.Close(context.Background())

	if err = cursor.All(context.Background(), &results); err != nil {
		logger.ServerLogger.Printf("Error decoding flights: %v", err)
		return
	}

	if len(results) == 0 {
		logger.ServerLogger.Println("No flights found")
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

	update := bson.M{
		"$set": bson.M{selectedProperty: newValue},
	}

	filter := bson.M{"_id": selectedFlight.ID}
	_, err = collection.UpdateOne(context.Background(), filter, update, options.Update().SetUpsert(false))
	if err != nil {
		logger.ServerLogger.Printf("Error updating flight: %v", err)
		return
	}

	logger.ServerLogger.Printf("Updated flight %v: %s = %v", selectedFlight.ID.Hex(), selectedProperty, newValue)
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
