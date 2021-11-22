const users = [];

// Join user to chat
function newUser(id, username, room) {
  const user = { id, username, room };
  users.push(user);
  return user;
}

// Get current user
function getActiveUser(id) {
  return users.find((user) => user.id === id);
}

// User leaves chat
function exitRoom(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getIndividualRoomUsers(room) {
  const cpUsers = [...new Set(users)];
  let fin = cpUsers.filter((user) => user.room === room && user.username !== undefined);
  // let fin = cpUsers.filter((user) => user.username !== undefined);
  return fin;
}

module.exports = {
  newUser,
  getActiveUser,
  exitRoom,
  getIndividualRoomUsers,
};
