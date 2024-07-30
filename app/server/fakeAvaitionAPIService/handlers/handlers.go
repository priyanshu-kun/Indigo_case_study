package handlers

import (
	"context"
	"net/http"
	"server/fakeAvaitionAPIService/database"
	"server/fakeAvaitionAPIService/logger"
	"server/fakeAvaitionAPIService/models"
	"server/fakeAvaitionAPIService/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

const (
	DATABASE   = "aviation"
	COLLECTION = "flights"
)

type Flight struct {
	FlightID string `json:"flight_id"`
	Email    string `json:"email"`
	Method   string `json:"method"`
}

func SeedDatabaseHandler(c *gin.Context) {
	if err := utils.SeedDatabase(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "[INFO] Database seeded successfully"})
}

func FetchFlight(c *gin.Context) {
	flightId := c.Query("_flight_id")
	flightName := c.Query("_flight_name")
	var result models.Flight

	if flightId == "" && flightName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "[ERROR] Missing _flight_id and _flight_name parameter"})
		return
	}

	collection := database.GetCollection("aviation_db", "flights")

	filter := bson.M{}
	if flightId != "" {
		filter["flight_id"] = flightId
	}
	if flightName != "" {
		filter["airline"] = flightName
	}

	err := collection.FindOne(context.Background(), filter).Decode(&result)
	if err != nil {
		logger.ServerLogger.Printf("[ERROR] fetching flights: %v", err)
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "[ERROR] Flight not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "[ERROR] fetching flight"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"flight_id":          result.FlightID,
		"flight_name":        result.Airline,
		"status":             result.Status,
		"departureGate":      result.DepartureGate,
		"arrivalGate":        result.ArrivalGate,
		"scheduledDeparture": result.ScheduledDeparture,
		"scheduledArrival":   result.ScheduledArrival,
		"actualDeparture":    result.ActualDeparture,
		"actualArrival":      result.ActualArrival,
	})
}
func UpdateStatus(c *gin.Context) {
	enableUpdation := c.Query("_enableUpdation")
	deltaTime := c.Query("_delta_time")

	logger.ServerLogger.Println(enableUpdation, deltaTime)

	if enableUpdation == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "[ERROR] Missing *enableUpdation parameter"})
		return
	}

	enable, err := strconv.ParseBool(enableUpdation)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":          "[ERROR] Invalid value for *enableUpdation. Must be 'true' or 'false'",
			"provided_value": enableUpdation,
		})
		return
	}

	if enable {
		if utils.IsUpdating() {
			c.JSON(http.StatusOK, gin.H{"message": "[INFO] Update process already running"})
			return
		}

		if deltaTime == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "[ERROR] Missing _delta_time parameter"})
			return
		}

		delta, err := time.ParseDuration(deltaTime)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":          "[ERROR] Invalid value for _delta_time. Use a valid duration string (e.g., '5s', '1m', '2h')",
				"provided_value": deltaTime,
			})
			return
		}

		utils.UpdateFlightStatusPeriodically(delta)
		c.JSON(http.StatusOK, gin.H{"message": "[INFO] Update process started"})
	} else {
		if !utils.IsUpdating() {
			c.JSON(http.StatusOK, gin.H{"message": "[INFO] Update process is not running"})
			return
		}
		utils.StopUpdateProcess()
		c.JSON(http.StatusOK, gin.H{"message": "[INFO] Update process stopped"})
	}
}

func SubscribeToFlight(c *gin.Context) {
	var newFlight Flight

	if err := c.ShouldBindJSON(&newFlight); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	collection := database.GetCollection("aviation_db", "subscribed_users")
	_, err := collection.InsertOne(context.Background(), bson.M{"flight_id": newFlight.FlightID, "email": newFlight.Email, "method": newFlight.Method})
	if err != nil {
		logger.ServerLogger.Printf("[ERROR] fetching flights: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "[ERROR] Failed to fetch flights"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": newFlight})

}

func FetchAllFlights(c *gin.Context) {
	collection := database.GetCollection("aviation_db", "flights")
	var results []models.Flight

	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		logger.ServerLogger.Printf("[ERROR] fetching flights: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "[ERROR] Failed to fetch flights"})
		return
	}
	defer cursor.Close(context.Background())

	if err = cursor.All(context.Background(), &results); err != nil {
		logger.ServerLogger.Printf("[ERROR] decoding flights: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "[ERROR] Failed to decode flights"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": results})

}
