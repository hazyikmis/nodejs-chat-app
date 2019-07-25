const http = require("http"); //NO NEED TO INSTALL LIKE NPM PACKAGES BECAUSE IT'S A CORE MODULE (CHECK NODEJS DOCS)
const express = require("express");
const socketio = require("socket.io");

const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const Filter = require("bad-words");
const { generateMessage } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./utils/users");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect("index.html");
});

// server (emit) --> client (receive)  - countUpdated  --acknowledgement --> server
// client (emit) --> server (receive)  - increment     --acknowledgement --> client

io.on("connection", socket => {
  console.log("New WebSocket connection");

  //socket.emit("message", "Welcome to the jungle!");
  // socket.emit("message", {
  //   text: "Welcome to the jungle!",
  //   createdAt: new Date().getTime()
  // });
  //socket.emit("message", generateMessage("Welcome to the jungle!")); //NEED TO BE CALLED AFTER JOINING A ROOM

  //socket.broadcast.emit("message", "A new user has joined!"); //message sent to everybody, except this particular socket....
  //socket.broadcast.emit("message", generateMessage("A new user has joined!")); //message sent to everybody, except this particular socket.... //NEED TO BE CALLED AFTER JOINING A ROOM
  /*
  //sendMessage listener (without acknowledgement)
  socket.on("sendMessage", message => {
    io.emit("message", message);
  });
*/

  //join listener
  //socket.on("join", ({ username, room }, callback) => {
  //const { error, user } = addUser({ id: socket.id, username, room });
  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    //socket.join(room);
    socket.join(user.room);

    socket.emit(
      "message",
      generateMessage("Welcome to the jungle!", "Chat App")
    );

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(`${user.username} user has joined!`, "Chat App")
      ); //message sent to everybody i n the room, except this particular socket....

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();

    //socket.emit, io.emit, socket.broadcast.emit
    //io.to.emit, socket.broadcast.to.emit  //sending only to specific room
  });

  //sendMessage listener (with acknowledgement)
  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }

    const user = getUser(socket.id);

    //io.emit("message", message);
    io.to(user.room).emit("message", generateMessage(message, user.username));
    callback();
  });

  //sendLocation listener
  socket.on("sendLocation", ({ latitude, longitude }, callback) => {
    //const locMessage = `Location: ${latitude}, ${longitude}`;
    const locMessage = `https://google.com/maps?q=${latitude},${longitude}`;
    //io.emit("message", locMessage);
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateMessage(locMessage, user.username)
    );
    callback();
  });

  //disconnect listener
  socket.on("disconnect", () => {
    //io.emit("message", "A user has left!"); //no need to use "socket.broadcast.emit()" because, user already disconnected... cannot receive the message
    const user = removeUser(socket.id);
    if (user) {
      //io.emit("message", generateMessage("A user has left!")); //no need to use "socket.broadcast.emit()" because, user already disconnected... cannot receive the message
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left!`, "Chat App")
      ); //no need to use "socket.broadcast.emit()" because, user already disconnected... cannot receive the message

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => {
  //app.listen(port, () => {
  console.log("Chat App started at port:" + port);
});

//THREE WAYS OF A SERVER EMIT AN EVENT:
// socket.emit()            --> emitting to that particular connection (socket)
// socket.broadcast.emit()  --> emitting to everybody except that particular connection (socket)
// io.emit()                --> emitting to everybody
// socket.broadcast.to.emit()  --> emitting to everybody in the room except that particular connection (socket)
// io.to.emit()                --> emitting to everybody in the room
