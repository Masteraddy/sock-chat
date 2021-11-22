const http = require("http");
const path = require("path");
const WebSocket = require("ws");
const express = require("express");

const app = express();
const server = http.Server(app);

app.use(express.static("public"));

const onSocketConnect = require("./libs/socket3");
const wss = new WebSocket.WebSocketServer({ server });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/hub", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "chat.html"));
});

wss.on("connection", (socket) => onSocketConnect(socket, broadcast));

function broadcast(data, room) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(data));
  });
}

var PORT = process.env.PORT || 3010;

server.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Listening on port ${PORT}`);
});
