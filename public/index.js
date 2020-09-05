const squares = Array.from(document.querySelectorAll(".square"));

const id = prompt("Your id");

const socket = io("http://localhost:5000");
let winCombos;
let state = {};

socket.emit("id", id);

socket.on("winCombos", (data) => {
  winCombos = data;
});

socket.on("state", (data) => {
  state = data;
});

socket.on("turn", (turn) => {
  state.turn = turn;
});

squares.forEach((square) => {
  square.addEventListener("click", () => {
    if (state.isWinner || state.turn !== +id) return;

    const squareId = square.id;

    if (document.getElementById(`${squareId}`).innerHTML === "") {
      socket.emit("squareClicked", squareId);
    }
  });
});

socket.on("squareClicked", (data) => {
  document.getElementById(data.squareId).innerHTML =
    data.turn === 1 ? "X" : "0";
  socket.emit("changeTurn");
});

socket.on("players", (data) => {
  console.log(data);
});

socket.on("turnChanged", (turn) => {
  state.turn = turn;
});

socket.on("winner", (player) => {
  state.isWinner = true;
  setTimeout(() => {
    alert(player + "won");
  }, 10);
});

socket.on("draw", () => {
  setTimeout(() => {
    alert("Draw");
  }, 10);
});
