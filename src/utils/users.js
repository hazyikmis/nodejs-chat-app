const users = [];

const addUser = ({ id, username, room }) => {
  //Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //Validate the data
  if (!username || !room) {
    return { error: "Username and room are required!" };
  }

  //Check for existing user
  const existingUser = users.find(
    user => user.room === room && user.username === username
  );
  if (existingUser) {
    return { error: "Username is in use!" };
  }

  //Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0]; //removed user being returned
  }
};

const getUser = id => {
  /*
  const userSelected = users.filter(user => user.id === id);
  if (userSelected.length === 0) {
    return undefined;
  }
  return userSelected[0];
*/

  return users.find(user => user.id === id);
};

//The function below is not required by the App. I've written down it to SHOW the difference
//between arr.filter & arr.find: arr.filter returns an array of all objects filtered
//on the other hand, arr.find returns the first object satisfies the criteria - or undefined
const getUserByName = username => {
  username = username.trim().toLowerCase();
  //return users.find(user => user.username === username.trim().toLowerCase());
  return users.filter(user => user.username === username);
};

const getUsersInRoom = room => {
  room = room.trim().toLowerCase();
  return users.filter(user => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};

//Function Testing:
/*
addUser({
  id: 22,
  username: "Andrew",
  room: "South Philly   "
});

addUser({
  id: 12,
  username: "halo",
  room: "South Philly   "
});

addUser({
  id: 55,
  username: "django",
  room: "darkroom"
});

addUser({
  id: 90,
  username: "halo",
  room: "darkroom"
});

console.log(users);

const res = addUser({
  id: 25,
  username: "",
  room: "South Philly   "
});

console.log(res);

const res2 = addUser({
  id: 35,
  username: "andreW",
  room: "South Philly   "
});

console.log(res2);

const removedUser = removeUser(22);
console.log(removedUser);
console.log(users);

const userSelected = getUser(155);
console.log(userSelected);

const userSelected2 = getUser(55);
console.log(userSelected2);

const usersInRoom = getUsersInRoom("south phiLLy");
console.log(usersInRoom);

const usersInRoom2 = getUsersInRoom("white-room");
console.log(usersInRoom2);

const userSelected3 = getUserByName("halo");
console.log(userSelected3);
*/
