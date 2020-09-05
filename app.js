const http = require("http");
const express = require("express");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo.listen(server);

const winCombos = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [1, 5, 9],
  [2, 5, 8],
  [3, 6, 9],
  [1, 4, 7],
  [3, 5, 7],
  [1, 4, 7],
];
const player1 = {
  squares: [],
};
const player2 = {
  squares: [],
};

const checkWinner = (winCombos, player) => {
  let playerSorted = player.sort();
  let isWinner = false;

  winCombos.forEach((winCombo) => {
    let isCombo = 0;
    playerSorted.forEach((nr) => {
      if (winCombo.includes(nr)) {
        isCombo++;
      }
    });

    if (isCombo === 3) {
      isWinner = true;
    }
  });

  return isWinner;
};

io.on("connection", (socket) => {
  socket.emit("winCombos", winCombos);

  let turn = 1;

  socket.on("id", (data) => {
    data = +data;
    if (data === 1) {
      player1.id = data;
    } else if (data === 2) {
      player2.id = data;
    }

    socket.emit("state", {
      player1,
      player2,
      turn,
    });
  });

  socket.emit("turn", turn);

  socket.on("squareClicked", (squareId) => {
    if (turn === 1) {
      player1.squares.push(+squareId);
      if (checkWinner(winCombos, player1.squares)) {
        isWinner = true;
        io.emit("winner", "Player1");
      }
    } else {
      player2.squares.push(+squareId);
      if (checkWinner(winCombos, player2.squares)) {
        isWinner = true;
        io.emit("winner", "Player2");
      }
    }

    if (player1.squares.length + player2.squares.length === 9 && !isWinner) {
      console.log("draw");
      io.emit("draw");
    }

    io.emit("squareClicked", {
      squareId,
      turn,
    });
  });

  socket.on("changeTurn", () => {
    turn = turn === 1 ? 2 : 1;
    socket.emit("turnChanged", turn);
  });
});

app.use(express.static("public"));

server.listen(5000, () => {
  console.log("App listening on port 5000");
});
