import { useState, useEffect } from "react";
import "./App.css";

const socket = new WebSocket("ws://localhost:8080");

function App() {
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [symbol, setSymbol] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string>("X");
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState<number>(10); // Novo estado para o contador de 10 segundos

  useEffect(() => {
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "start":
          setSymbol(data.symbol);
          setBoard(data.board);
          break;
        case "update":
          setBoard(data.board);
          setCurrentPlayer(data.currentPlayer);
          break;
        case "gameOver":
          setMessage(data.winner === "Empate" ? "Empate!" : `Vencedor: ${data.winner}`);
          setGameOver(true);
          startCountdown(); 
          break;
        case "reset":
          setBoard(data.board);
          setCurrentPlayer(data.currentPlayer);
          setMessage("");
          setGameOver(false);
          setCountdown(10); 
          break;
        case "error":
          setMessage(data.message);
          break;
        default:
          break;
      }
    };
  }, []);

  const startCountdown = () => {
    let timer = 10;
    const interval = setInterval(() => {
      if (timer <= 0) {
        clearInterval(interval);
        resetGame(); 
      } else {
        setCountdown(timer--); 
      }
    }, 1000);
  };

  const handleSquareClick = (index: number) => {
    if (gameOver || board[index] !== "" || symbol !== currentPlayer) return;
    socket.send(JSON.stringify({ type: "move", index }));
  };

  const resetGame = () => {
    setMessage("");
    setGameOver(false);
    setCountdown(10); 
    socket.send(JSON.stringify({ type: "reset" }));
  };

  return (
    <div className="container">
      <h1>{message || `Sua vez: ${symbol === currentPlayer ? "Sim" : "Não"}`}</h1>

      {gameOver && (
        <div className="countdown">
          <p>Reiniciando em {countdown} segundos...</p>
        </div>
      )}

      <div className="board">
        {board.map((value, index) => (
          <div
            key={index}
            className="square"
            onClick={() => handleSquareClick(index)}
          >
            {value}
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="button-container">
          <button onClick={resetGame}>Reiniciar Jogo</button>
        </div>
      )}
    </div>
  );
}

export default App;
