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

	"github.com/gin-contrib/cors"
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
		logger.ServerLogger.Fatalf("[ERROR] connecting to MongoDB: %s", err)
	}

	m.router = gin.New()

	gin.DefaultWriter = logger.GinLogWriter
	gin.DefaultErrorWriter = logger.GinLogWriter

	m.router.Use(gin.LoggerWithWriter(logger.GinLogWriter), gin.RecoveryWithWriter(logger.GinLogWriter))
	m.router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"PUT", "PATCH", "GET", "POST", "DELETE"},
		AllowHeaders:     []string{"Origin"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

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
		log.Fatalf("[ERROR] initializing server: %s", err)
	}

	m.router.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "[DEBUG] Hello, World!")
	})

	m.router.GET("/initdb", handlers.SeedDatabaseHandler)

	m.router.GET("/flights", handlers.FetchAllFlights)

	m.router.GET("/update_flight_status", handlers.UpdateStatus)

	m.router.GET("/fetch_flight", handlers.FetchFlight)

	m.router.POST("/subscribe_to_flight", handlers.SubscribeToFlight)

	go func() {
		logger.ServerLogger.Println("[INFO] Starting server on port", *bindAddress)

		if err := m.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.ServerLogger.Fatalf("[ERROR] starting server: %s", err)
		}
	}()

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	signal.Notify(c, os.Kill)

	sig := <-c
	logger.ServerLogger.Println("[INFO] Got signal:", sig)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := m.server.Shutdown(ctx); err != nil {
		logger.ServerLogger.Fatalf("[INFO] Server forced to shutdown: %s", err)
	}

	logger.ServerLogger.Println("[INFO] Server exiting")
}
