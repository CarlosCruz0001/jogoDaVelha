const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });
let players = []; 
let board = Array(9).fill(""); 
let currentPlayer = "X"; 
let gameInProgress = true; 

server.on("connection", (socket) => {
  if (players.length >= 2) {
    socket.send(JSON.stringify({ type: "error", message: "Sala cheia!" }));
    socket.close();
    return;
  }

  const playerSymbol = players.length === 0 ? "X" : "O";
  players.push({ socket, symbol: playerSymbol });

  console.log(`Jogador ${playerSymbol} conectado.`);
  socket.send(
    JSON.stringify({
      type: "start",
      symbol: playerSymbol,
      board,
      currentPlayer,
    })
  );

  broadcast({
    type: "info",
    message: `Jogador ${playerSymbol} entrou no jogo.`,
  });

  socket.on("message", (data) => {
    const message = JSON.parse(data);
    if (message.type === "move") {
      handleMove(playerSymbol, message.index);
    } else if (message.type === "reset") {
      resetGame();
    }
  });

  socket.on("close", () => {
    players = players.filter((player) => player.socket !== socket);
    broadcast({ type: "info", message: `Jogador ${playerSymbol} desconectado.` });
    resetGame();
  });
});

function broadcast(message) {
  players.forEach((player) => player.socket.send(JSON.stringify(message)));
}

function handleMove(symbol, index) {
  if (!gameInProgress) return; 
  if (symbol !== currentPlayer) {
    return sendToPlayer(symbol, {
      type: "error",
      message: "Não é sua vez!",
    });
  }

  if (board[index] !== "") {
    return sendToPlayer(symbol, {
      type: "error",
      message: "Posição inválida!",
    });
  }

  board[index] = symbol;
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  broadcast({ type: "update", board, currentPlayer });

  const winner = checkWinner();
  if (winner) {
    broadcast({ type: "gameOver", winner });
    gameInProgress = false;

    
    setTimeout(() => {
      resetGame();
    }, 10000);
  } else if (!board.includes("")) {
    broadcast({ type: "gameOver", winner: "Empate" });
    gameInProgress = false;

 
    setTimeout(() => {
      resetGame();
    }, 10000);
  }
}

function checkWinner() {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of winningCombinations) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function resetGame() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameInProgress = true;
  broadcast({ type: "reset", board, currentPlayer });
}

function sendToPlayer(symbol, message) {
  const player = players.find((p) => p.symbol === symbol);
  if (player) {
    player.socket.send(JSON.stringify(message));
  }
}

console.log("Servidor WebSocket iniciado na porta 8080.");
