package database

import (
	"context"
	"server/fakeAvaitionAPIService/logger"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client

func ConnectDB(uri string) error {
	var wg sync.WaitGroup
	var connectErr, pingErr error
	errorChan := make(chan error, 2)

	wg.Add(2)

	go func() {
		defer wg.Done()
		var err error
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		clientOptions := options.Client().ApplyURI(uri)
		Client, connectErr = mongo.Connect(ctx, clientOptions)
		if connectErr != nil {
			errorChan <- err
			logger.ServerLogger.Printf("[ERROR] Failed to connect to MongoDB: %v", connectErr)
		}
		errorChan <- nil
	}()

	go func() {
		defer wg.Done()
		time.Sleep(1 * time.Second)

		if connectErr == nil {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()

			pingErr = Client.Ping(ctx, nil)
			if pingErr != nil {
				errorChan <- pingErr
				logger.ServerLogger.Printf("[ERROR] Failed to ping MongoDB: %v", pingErr)
			}
			errorChan <- nil
		}
	}()

	wg.Wait()
	close(errorChan)

	if connectErr != nil {
		return connectErr
	}
	if pingErr != nil {
		return pingErr
	}

	for err := range errorChan {
		if err != nil {
			return err
		}
	}

	logger.ServerLogger.Println("[INFO] Connected to MongoDB")
	return nil
}

func GetCollection(databaseName, collectionName string) *mongo.Collection {
	return Client.Database(databaseName).Collection(collectionName)
}
