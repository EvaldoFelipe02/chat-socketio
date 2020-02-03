const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const clients = {};

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Called whenever a client connects to the socket.
io.on("connection", client => {
  console.log(`New user are connect: ${client.id}`);
});

io.on("connection", client => {
  // Called whenever a client join in the new chat.
  client.on("join", name => {
    console.log(`Joined: ${name}`);
    clients[client.id] = name;

    // Send a notification to the new client who connected in the room.
    client.emit("update", "You are connected.");

    // Send a notification to all connected clients except what is performing the action.
    client.broadcast.emit("update", `${name} has joined the server.`);
  });

  // Called whenever a client sends a new message.
  client.on("send", msg => {
    console.log(`Client: ${clients[client.id]}, Message: ${msg}`);

    // Send a notification to all connected clients except what is performing the action.
    client.broadcast.emit("chat", clients[client.id], msg);
  });

  // Called whenever a client disconnects from chat.
  client.on("disconnect", () => {
    if (clients[client.id] != undefined) {
      console.log(`Client: ${clients[client.id]} are disconnect`);
    }

    // Send a notification to the new client who connected in the room.
    io.emit("update", `${clients[client.id]} has left from the chat.`);

    // Remove the disconnected client from the array.
    delete clients[client.id];
  });
});

http.listen(3000, () => {
  console.log("Listening on localhost:3000");
});
