require("dotenv").config();

var express = require("express");
var path = require("path");

const api = require("./api/routes/index");

const app = express();

require("./api/models/db");

app.use(express.json());

app.use("/api", (req, res, next) => {
  res.header("Cache-Control", "max-age=no-cache");
  res.header("Access-Control-Allow-Origin", "http://localhost:4200");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.use("/api", api);

app.use(express.static(path.join(__dirname, "app", "build")));

app.get("*", (req, res, next) => {
  res.sendFile(path.join(__dirname, "app", "build", "index.html"));
});

app.use((error, req, res, next) => {
  if (error.name == "UnauthorizedError") {
    res.status(401).json({
      message: "Za dostop je potrebna prijava.",
    });
  }
});

app.listen(process.env.PORT || 3000);

console.log("Server started");
