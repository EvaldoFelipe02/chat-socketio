// Initialize connection and a verifier that the user has entered his nickname.
$(document).ready(() => {
  const socket = io.connect("http://localhost:3000");
  let ready = false;
  $("#nickname").focus();

  // The server receives information whenever a new user enters the room and informs their nickname.
  $("#submit").submit(e => {
    const time = new Date();
    const name = $("#nickname").val();

    // Get nickname of new client.
    $("#name").html(name);
    ready = true;

    // Closes the nick selection screen and displays the chat screen.
    e.preventDefault();
    $("#nick").fadeOut();
    $("#chat").fadeIn();

    // Show chat after get nickname.
    $("#chat").removeAttr("hidden");

    // Show login information.
    $("#time").html(`First login: ${time.getHours()}:${time.getMinutes()}`);

    // Runs a socket command that informs our server that a new user has just entered the room.
    socket.emit("join", name);
    $("#textarea").focus();
  });

  // Each time the server issues a new update, jQuery adds a new line to the chat with the returned message.
  socket.on("update", msg => {
    if (ready) {
      $(".chat").append(`<li class="info">${msg}</li>`);

      scroll();
    }
  });

  // Send a new message to the server each time the client press enter on the text input.
  $("#textarea").keypress(e => {
    const { hours, minutes } = hourAndMinute();

    if (e.which === 13) {
      const text = $("#textarea").val();
      $("#textarea").val("");

      $(".chat").append(
        `<li class="self"><div class="msg"><span>${$(
          "#nickname"
        ).val()}:</span>    <p>${text}</p><time>${hours}:${minutes}</time></div></li>`
      );
      socket.emit("send", text);

      scroll();
    }
  });

  // Listen all messages from the chat and add on DOM.
  socket.on("chat", (client, msg) => {
    const { hours, minutes } = hourAndMinute();

    if (ready) {
      $(".chat").append(
        `<li class="other"><div class="msg"><span>${client}:</span><p>${msg}</p><time>${hours}:${minutes}</time></div></li>`
      );

      scroll();
    }
  });
});

const hourAndMinute = () => {
  const time = new Date();

  const hours = (time.getHours() < 10 ? "0" : "") + time.getHours();
  const minutes = (time.getMinutes() < 10 ? "0" : "") + time.getMinutes();

  const timeInfo = { hours, minutes };

  return timeInfo;
};

const scroll = () => {
  $("html, body").animate({ scrollTop: document.body.scrollHeight }, "fast");
};
