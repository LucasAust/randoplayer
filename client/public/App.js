// client/src/App.js

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL;

function App() {
  const [socket, setSocket] = useState(null);

  // Room/join state
  const [pinInput, setPinInput] = useState('');
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);

  // Round assignment state
  const [assignment, setAssignment] = useState(null);
  const [roundInfo, setRoundInfo] = useState(null);

  // Only host sees Start/Next buttons when appropriate
  const [canStartOrNext, setCanStartOrNext] = useState(false);

  // Initialize socket connection once (on mount)
  useEffect(() => {
    if (!SOCKET_SERVER_URL) {
      console.error('REACT_APP_SOCKET_URL is not defined');
      return;
    }

    const s = io(SOCKET_SERVER_URL, {
      transports: ['websocket']
    });

    setSocket(s);

    s.on('joined', ({ pin, isHost }) => {
      setJoined(true);
      setIsHost(isHost);
    });

    s.on('player_update', ({ count }) => {
      setPlayerCount(count);
    });

    s.on('make_host', () => {
      // If old host left, new host is chosen
      setIsHost(true);
      setCanStartOrNext(false);
    });

    s.on('round_assignment', ({ league, year, yourPlayer }) => {
      setAssignment(yourPlayer);
      setRoundInfo({ league, year });
      // After receiving assignment, host must wait to press Next
      setCanStartOrNext(false);
    });

    s.on('enable_next_round', () => {
      // Host is permitted to press Next Round
      setCanStartOrNext(true);
    });

    s.on('room_full', () => {
      alert('Room is full (max 10 players). Please try a different PIN.');
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // Handler: Join Room
  const joinRoom = () => {
    if (!pinInput.trim()) return;
    socket.emit('join_room', { pin: pinInput.trim() });
  };

  // Handler: Host clicks "Start Game"
  const startGame = () => {
    if (socket && pinInput.trim()) {
      socket.emit('start_game', { pin: pinInput.trim() });
    }
  };

  // Handler: Host clicks "Next Round"
  const nextRound = () => {
    if (socket && pinInput.trim()) {
      socket.emit('next_round', { pin: pinInput.trim() });
    }
  };

  if (!joined) {
    // Show Join Room screen
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

  // After joined
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
