package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"server/fakeAvaitionAPIService/database"
	"server/fakeAvaitionAPIService/handlers"
	"server/fakeAvaitionAPIService/logger"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nicholasjackson/env"
)

var (
	bindAddress = env.String("BIND_ADDRESS", false, ":8080", "Bind address for the server")
	mongoURI    = env.String("MONGO_URI", false, "mongodb://localhost:27017", "MongoDB URI")
)

type Main struct {
	router *gin.Engine
	server *http.Server
}

func (m *Main) initServer() error {
	if err := logger.InitLogger(); err != nil {
		return err
	}

	if err := database.ConnectDB(*mongoURI); err != nil {
		logger.ServerLogger.Fatalf("Error connecting to MongoDB: %s", err)
	}

	m.router = gin.New()

	gin.DefaultWriter = logger.GinLogWriter
	gin.DefaultErrorWriter = logger.GinLogWriter

	m.router.Use(gin.LoggerWithWriter(logger.GinLogWriter), gin.RecoveryWithWriter(logger.GinLogWriter))

	m.server = &http.Server{
		Addr:         *bindAddress,
		Handler:      m.router,
		ErrorLog:     logger.ServerLogger,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	return nil
}

func main() {
	env.Parse()

	m := Main{}

	if err := m.initServer(); err != nil {
		log.Fatalf("Error initializing server: %s", err)
	}

	m.router.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "Hello, World!")
	})

	m.router.GET("/initdb", handlers.SeedDatabaseHandler)

	m.router.GET("/flights", handlers.FetchAllFlights)

	m.router.GET("/update_flight_status", handlers.UpdateStatus)

	m.router.GET("/fetch_flight", handlers.FetchFlight)

	go func() {
		logger.ServerLogger.Println("Starting server on port", *bindAddress)

		if err := m.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.ServerLogger.Fatalf("Error starting server: %s", err)
		}
	}()

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	signal.Notify(c, os.Kill)

	sig := <-c
	logger.ServerLogger.Println("Got signal:", sig)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := m.server.Shutdown(ctx); err != nil {
		logger.ServerLogger.Fatalf("Server forced to shutdown: %s", err)
	}

	logger.ServerLogger.Println("Server exiting")
}
