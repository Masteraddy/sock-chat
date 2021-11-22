const genID = require("./idgen");
const { getActiveUser, exitRoom, newUser, getIndividualRoomUsers } = require("./userHelper");
const formater = require("./dateFormater");
const rooms = {};

const roomBroadcast = (data, room) => {
  Object.entries(rooms[room]).forEach(([, sock]) => sock.send(JSON.stringify(data)));
};

const leave = (room, uuid) => {
  // not present: do nothing
  if (!rooms[room][uuid]) return;

  // if the one exiting is the last one, destroy the room
  if (Object.keys(rooms[room]).length === 1) delete rooms[room];
  // otherwise simply leave the room
  else delete rooms[room][uuid];
};

const onSocketConnect = (socket, broadcast) => {
  const uuid = genID(); // create here a uuid for this connection
  socket.id = uuid;

  socket.on("message", (buffData) => {
    const dt = JSON.parse(buffData.toString());
    const { message, meta, data, room } = dt;
    const user = newUser(uuid, data.username, room);

    if (meta === "joinRoom") {
      if (!rooms[user.room]) rooms[user.room] = {}; // create the room
      if (!rooms[user.room][uuid]) rooms[user.room][uuid] = socket; // join the room
      let roomMsg = {
        meta: "message",
        room: user.room,
        message: formater("App", `${user.username} has joined the room`),
      };
      roomBroadcast(roomMsg, user.room);

      let currentActiveUser = {
        meta: "roomUsers",
        room: user.room,
        users: getIndividualRoomUsers(user.room),
      };

      roomBroadcast(currentActiveUser, user.room);
    } else if (meta === "chatMessage") {
      const user = getActiveUser(uuid);
      let msg = {
        meta: "message",
        room: user.room,
        message: formater(user.username, message),
      };

      roomBroadcast(msg, user.room);
    } else if (meta === "leave") {
      leave(user.room, uuid);
    } else if (!meta) {
      // send the message to all in the room
      Object.entries(rooms[user.room]).forEach(([, sock]) => sock.send({ message }));
      // roomBroadcast(message);
    }
  });

  socket.on("close", () => {
    const user = exitRoom(uuid);
    if (user) {
      let roomMsg = {
        meta: "message",
        room: user.room,
        message: formater("App", `${user.username} has left the room`),
      };
      roomBroadcast(roomMsg, user.room);
    }
    let currentActiveUser = {
      meta: "roomUsers",
      room: user.room,
      users: getIndividualRoomUsers(user.room),
    };

    roomBroadcast(currentActiveUser, user.room);
    // for each room, remove the closed socket
    Object.keys(rooms).forEach((room) => leave(room, uuid));
  });
};

module.exports = onSocketConnect;
