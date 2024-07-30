# Indigo Case Study

This repository contains a project to develop real-time flight status updates and notifications for passengers. The project is divided into three parts:
1. A React JS client for the user interface.
2. A fake aviation API service written in Go.
3. A notification service written in Node.js.


## Setup Reactjs
1. npm install
2. npm run dev

## Setup Nodejs(Notification Service) microservice
1. install nodejs
2. cd notificationService
3. npm install
4. npm run start

## Setup golang(Fake Avaiation API) microservice
1. install golang
2. cd fakeAvaiationAPIService
3. go run cmd/main.go