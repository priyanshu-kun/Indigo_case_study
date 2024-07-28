package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Flight struct {
	ID                 primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	FlightID           string             `bson:"flight_id" json:"flight_id"`
	Airline            string             `bson:"airline" json:"airline"`
	Status             string             `bson:"status" json:"status"`
	DepartureGate      string             `bson:"departure_gate" json:"departure_gate"`
	ArrivalGate        string             `bson:"arrival_gate" json:"arrival_gate"`
	ScheduledDeparture time.Time          `bson:"scheduled_departure" json:"scheduled_departure"`
	ScheduledArrival   time.Time          `bson:"scheduled_arrival" json:"scheduled_arrival"`
	ActualDeparture    *time.Time         `bson:"actual_departure,omitempty" json:"actual_departure,omitempty"`
	ActualArrival      *time.Time         `bson:"actual_arrival,omitempty" json:"actual_arrival,omitempty"`
}
