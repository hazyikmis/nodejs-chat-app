const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form");
//const $messageFormInput = document.querySelector("[name='messageInput']");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messagesDiv = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
//Qs : query-string js library, loaded at chat.html (qs.min.js)
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoScroll = () => {
  // new message element
  const $newMessage = $messagesDiv.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  //console.log(newMessageStyles);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  //console.log(newMessageMargin);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = $messagesDiv.offsetHeight;

  //height of messages container
  const containerHeight = $messagesDiv.scrollHeight;

  //how far I scrolled
  const scrollOffset = $messagesDiv.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messagesDiv.scrollTop = $messagesDiv.scrollHeight;
  }
};

socket.on("message", message => {
  //console.log(message);
  //const html = Mustache.render(messageTemplate, {message: message});
  //const html = Mustache.render(messageTemplate, { message });
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("hh:mm a")
  });
  $messagesDiv.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", url => {
  //console.log(url);
  const html = Mustache.render(locationMessageTemplate, {
    username: url.username,
    url: url.text,
    createdAt: moment(url.createdAt).format("hh:mm a")
  });
  $messagesDiv.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  //console.log(room);
  //console.log(users);
  const html = Mustache.render(sidebarTemplate, { room, users });
  document.querySelector("#sidebar").innerHTML = html;
});

//document.querySelector("#message-form").addEventListener("submit", e => {
$messageForm.addEventListener("submit", e => {
  e.preventDefault();

  //disable dom objects:
  $messageFormButton.setAttribute("disabled", "disabled");

  //const message = document.querySelector("input").value;  // WAY #1
  //const message = document.querySelector("[name='messageInput']").value;  // WAY #2
  const message = e.target.elements.messageInput.value; // WAY#3
  //socket.emit("sendMessage", message);

  //socket.emit("sendMessage", message, message => {
  //  console.log("The message was delivered.", message);
  //});
  socket.emit("sendMessage", message, error => {
    //enable dom objects:
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log("The message was delivered.");
  });
});

//document.querySelector("#send-location").addEventListener("click", () => {
$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }

  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(position => {
    //console.log(position);

    //const message = `Location: ${position.coords.latitude}, ${position.coords.longitude}`;
    //socket.emit("sendMessage", message);
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location shared.");
      }
    );
  });
});

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
