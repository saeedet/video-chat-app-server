import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

//app config
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());

//create server and socket config
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//app routes
app.get("/", (req, res) => {
  res.send("server is running");
});

//socket events
io.on("connection", (socket) => {
  // once connection has occurred emit socketId
  socket.emit("socketid", socket.id);

  // Register a handler for "calluser" event
  socket.on("calluser", ({ userToCall, signalData, from, name }) => {
    // initialize the connection and send the caller info with an emit event
    io.to(userToCall).emit("usercalling", { signal: signalData, from, name });
  });

  // Register a handler for "answercall" event
  socket.on("answercall", (data) => {
    // initialize the connection and send the connection data with an emit event
    io.to(data.to).emit("callaccepted", data.signal);
  });

  // Register a handler for "disconnect" event
  socket.on("disconnect", () => {
    socket.broadcast.emit("callended");
  });
});

//app listenning
httpServer.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});
