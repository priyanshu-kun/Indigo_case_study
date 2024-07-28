package logger

import (
	"io"
	"log"
	"os"
	"sync"
)

var (
	ServerLogger *log.Logger
	GinLogWriter io.Writer
)

func InitLogger() error {
	var wg sync.WaitGroup
	errorChan := make(chan error, 2)

	var serverLogFile, ginLogFile *os.File

	wg.Add(2)

	go func() {
		defer wg.Done()
		var err error
		serverLogFile, err = os.OpenFile("logs/server.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err != nil {
			errorChan <- err
			return
		}
		errorChan <- nil
	}()

	go func() {
		defer wg.Done()
		var err error
		ginLogFile, err = os.OpenFile("logs/gin.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err != nil {
			errorChan <- err
			return
		}
		errorChan <- nil
	}()

	wg.Wait()
	close(errorChan)

	for err := range errorChan {
		if err != nil {
			return err
		}
	}

	serverLogWriter := io.MultiWriter(os.Stdout, serverLogFile)
	GinLogWriter = io.MultiWriter(os.Stdout, ginLogFile)

	ServerLogger = log.New(serverLogWriter, "fake aviation api service ", log.LstdFlags)

	return nil
}
