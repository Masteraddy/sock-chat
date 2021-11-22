const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

if ("WebSocket" in window) {
  console.log("WebSocket is supported by your Browser!");
} else {
  alert("WebSocket NOT supported by your Browser!");
}

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// console.log(location);

// Let us open a web socket
var ws = new WebSocket(`wss://${location.host}`);

ws.onopen = function () {
  // Web Socket is connected, send data using send()
  ws.send(JSON.stringify({ meta: "joinRoom", data: { username }, room }));

  // ws.send({ meta: "joinRoom", data: { username }, room });
  console.log("Message is sent...");
};

ws.onmessage = function (evt) {
  var dt = JSON.parse(evt.data);
  switch (dt.meta) {
    case "message":
      outputMessage(dt.message);
      // Scroll down
      chatMessages.scrollTop = chatMessages.scrollHeight;
      break;
    case "roomUsers":
      const roomUsers = dt.users.filter((user) => user.room === dt.room);
      outputRoomName(dt.room);
      outputUsers(roomUsers);
      break;
    default:
      break;
  }
};

window.onbeforeunload = () => {
  ws.close();
};

ws.onclose = function () {
  // websocket is closed.
  console.log("Connection is closed...");
};
// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  ws.send(JSON.stringify({ meta: "chatMessage", data: {}, room, message: msg }));

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  const p = document.createElement("p");
  p.classList.add("meta");
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement("p");
  para.classList.add("text");
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector(".chat-messages").appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  console.log({ users });
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
document.getElementById("leave-btn").addEventListener("click", () => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    window.location = "/";
  } else {
  }
});
