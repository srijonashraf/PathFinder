const dotenv = require("dotenv");
const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const path = require("path");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set the view engine to EJS
app.set("view engine", "ejs");

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Handle socket.io connections
io.on("connection", (socket) => {
  console.log("Connected");

  // Handle "send-location" event
  socket.on("send-location", (data) => {
    io.emit("receive-location", { id: socket.id, ...data });
  });

  // Handle socket disconnection
  socket.on("disconnect", () => {
    io.emit("user-disconnected", socket.id);
    console.log("User disconnected");
  });
});

// Handle GET request to the root URL
app.get("/", (req, res) => {
  res.render("index");
});

module.exports = { app, server, io };
