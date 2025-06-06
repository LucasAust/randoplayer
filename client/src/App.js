import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

// Read the backend URL from the env var (injected at build time)
const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL;

function App() {
  const [socket, setSocket] = useState(null);

  // Room and player state
  const [pinInput, setPinInput] = useState('');
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);

  // Assignment (per round)
  const [assignment, setAssignment] = useState(null);
  const [roundInfo, setRoundInfo] = useState(null);

  // Only host can click “Start Game” / “Next Round”
  const [canStartOrNext, setCanStartOrNext] = useState(false);

  useEffect(() => {
    if (!SOCKET_SERVER_URL) {
      console.error(
        'REACT_APP_SOCKET_URL is not defined in .env. Frontend cannot connect to backend.'
      );
      return;
    }
    // Initialize socket connection
    const s = io(SOCKET_SERVER_URL, {
      transports: ['websocket']
    });
    setSocket(s);

    // When server confirms you’ve joined
    s.on('joined', ({ pin, isHost }) => {
      setJoined(true);
      setIsHost(isHost);
    });

    // When server broadcasts player count
    s.on('player_update', ({ count }) => {
      setPlayerCount(count);
    });

    // If host disconnected & a new host is chosen
    s.on('make_host', () => {
      setIsHost(true);
      setCanStartOrNext(false);
    });

    // Server sends a round assignment
    s.on('round_assignment', ({ league, year, yourPlayer }) => {
      setAssignment(yourPlayer);
      setRoundInfo({ league, year });
      // After assignment, host must wait for next enable
      setCanStartOrNext(false);
    });

    // Host is told they can press “Next Round”
    s.on('enable_next_round', () => {
      setCanStartOrNext(true);
    });

    // If room is full (>10 players)
    s.on('room_full', () => {
      alert('Room is full (max 10 players). Please try a different PIN.');
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // Handler: Join a room
  const joinRoom = () => {
    if (!pinInput.trim()) return;
    socket.emit('join_room', { pin: pinInput.trim() });
  };

  // Handler: Host starts game
  const startGame = () => {
    if (socket && pinInput.trim()) {
      socket.emit('start_game', { pin: pinInput.trim() });
    }
  };

  // Handler: Host goes to next round
  const nextRound = () => {
    if (socket && pinInput.trim()) {
      socket.emit('next_round', { pin: pinInput.trim() });
    }
  };

  // If not joined, show join form
  if (!joined) {
    return (
      <div className="App">
        <h1>Join a Game Room</h1>
        <input
          type="text"
          placeholder="Enter Game PIN"
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
    );
  }

  // Once joined
  return (
    <div className="App">
      <h1>Game Room: {pinInput}</h1>
      <p>Players in Room: {playerCount}</p>

      {isHost && !assignment && (
        <button onClick={startGame}>Start Game</button>
      )}

      {!isHost && !assignment && (
        <p>Waiting for host to start the game…</p>
      )}

      {assignment && (
        <div className="assignment-container">
          <h2>Round Player Assignment</h2>
          <p>
            <strong>League:</strong> {roundInfo.league.toUpperCase()} &nbsp;|&nbsp;
            <strong>Year:</strong> {roundInfo.year}
          </p>
          <p>
            <strong>Your Player:</strong> {assignment}
          </p>
        </div>
      )}

      {isHost && assignment && canStartOrNext && (
        <button onClick={nextRound}>Next Round</button>
      )}
    </div>
  );
}

export default App;
