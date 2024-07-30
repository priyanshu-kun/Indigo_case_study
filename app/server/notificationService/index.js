const express = require("express");
const mongoose = require("./config/db");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const routes = require("./routes");
 require("./utils/logger")();
 const { init } = require('./utils/admin')
 const { consume } = require('./utils/consumer')

const app = express();

// * Database connection
var db = mongoose.connection;
db.on("error", console.error.bind(console, "[INFO] connection error:"));
db.once("open", function () {
  console.log("[INFO] db connected!");
});

// init kafka
init();
consume();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("short"));

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({
    "msg": "Notification service is live!"
  });
});

app.use("*", (req, res) => {
  res.send("Route not found");
});

let PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`[INFO] Server is running on PORT ${PORT}`));
