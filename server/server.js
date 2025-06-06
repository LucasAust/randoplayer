// server/server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// In production, replace '*' with your frontend domain (e.g. 'https://my-game-room-frontend.web.app')
app.use(cors({ origin: '*' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*' // allow all origins; in prod lock this down
  }
});

const PORT = process.env.PORT || 4000;

/**
 * In-memory “player database.”
 * In a real production app, replace this with a real database query
 * (e.g. PostgreSQL, MongoDB) to fetch players by league & year.
 */
const playersByLeagueYear = {
  nfl: {
    2020: ['Tom Brady', 'Patrick Mahomes', 'Aaron Rodgers', 'Russell Wilson', 'Derrick Henry'],
    2021: ['Aaron Rodgers', 'Tom Brady', 'Russell Wilson', 'Derrick Henry', 'Josh Allen']
  },
  nba: {
    2020: ['LeBron James', 'Stephen Curry', 'Giannis Antetokounmpo', 'Kevin Durant', 'James Harden'],
    2021: ['LeBron James', 'Giannis Antetokounmpo', 'Stephen Curry', 'Kawhi Leonard', 'Nikola Jokic']
  },
  mlb: {
    2020: ['Mike Trout', 'Mookie Betts', 'Aaron Judge', 'Jacob deGrom', 'Freddie Freeman'],
    2021: ['Mike Trout', 'Mookie Betts', 'Trea Turner', 'Jacob deGrom', 'Juan Soto']
  },
  nhl: {
    2020: ['Alexander Ovechkin', 'Sidney Crosby', 'Connor McDavid', 'Nathan MacKinnon', 'Leon Draisaitl'],
    2021: ['Connor McDavid', 'Leon Draisaitl', 'Nathan MacKinnon', 'Auston Matthews', 'David Pastrnak']
  }
};

/**
 * Helper: random integer in [0, max)
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

/**
 * Helper: pick two distinct items from an array
 */
function pickTwoDistinct(arr) {
  if (arr.length < 2) return null;
  const idx1 = getRandomInt(arr.length);
  let idx2 = getRandomInt(arr.length - 1);
  if (idx2 >= idx1) idx2 += 1;
  return [arr[idx1], arr[idx2]];
}

/**
 * In-memory rooms:
 * rooms = {
 *   [pin: string]: {
 *     hostId: string,             // socket.id of the host
 *     players: Array<{ socketId: string }>
 *   }
 * }
 */
const rooms = {};

io.on('connection', (socket) => {
  console.log(`⚡️ New socket connected: ${socket.id}`);

  // When a client wants to join: { pin }
  socket.on('join_room', ({ pin }) => {
    if (!pin || typeof pin !== 'string') return;

    // If no room exists yet, create it & mark this as host
    if (!rooms[pin]) {
      rooms[pin] = {
        hostId: socket.id,
        players: []
      };
    }

    const room = rooms[pin];

    // If room already has 10 players, reject
    if (room.players.length >= 10) {
      socket.emit('room_full');
      return;
    }

    // Add this socket if not already in the list
    if (!room.players.find((p) => p.socketId === socket.id)) {
      room.players.push({ socketId: socket.id });
    }

    socket.join(pin);

    // Tell this client whether they're the host
    const isHost = room.hostId === socket.id;
    socket.emit('joined', { pin, isHost });

    // Broadcast updated count
    io.in(pin).emit('player_update', { count: room.players.length });
  });

  // Host clicks "Start Game"
  socket.on('start_game', ({ pin }) => {
    const room = rooms[pin];
    if (!room) return;
    if (socket.id !== room.hostId) return; // only host can start

    generateAndSendRound(pin);
    // Tell host they can click “Next Round” later
    socket.emit('enable_next_round');
  });

  // Host clicks "Next Round"
  socket.on('next_round', ({ pin }) => {
    const room = rooms[pin];
    if (!room) return;
    if (socket.id !== room.hostId) return; // only host can advance

    generateAndSendRound(pin);
    socket.emit('enable_next_round');
  });

  // Clean up on disconnect
  socket.on('disconnecting', () => {
    // Remove from any room they’re in
    const myRooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    myRooms.forEach((pin) => {
      const room = rooms[pin];
      if (!room) return;

      // Remove from players array
      room.players = room.players.filter((p) => p.socketId !== socket.id);

      // If they were host, pick a new one
      if (room.hostId === socket.id) {
        if (room.players.length > 0) {
          room.hostId = room.players[0].socketId;
          io.to(room.hostId).emit('make_host');
        }
      }

      // If room is empty, delete it
      if (room.players.length === 0) {
        delete rooms[pin];
      } else {
        // Otherwise, broadcast updated count
        io.in(pin).emit('player_update', { count: room.players.length });
      }
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

/**
 * Core logic: pick random league, year, two distinct players (X, Y),
 * pick one random index among N to get Y; everyone else gets X.
 * Emit 'round_assignment' event to each socket with { league, year, yourPlayer }.
 */
function generateAndSendRound(pin) {
  const room = rooms[pin];
  if (!room) return;

  const playersInRoom = room.players;
  const n = playersInRoom.length;
  if (n === 0) return;

  // 1) Pick a random league
  const leagues = Object.keys(playersByLeagueYear);
  const league = leagues[getRandomInt(leagues.length)];

  // 2) Pick a random year from that league
  const years = Object.keys(playersByLeagueYear[league]);
  const year = years[getRandomInt(years.length)];

  // 3) From that pool (playersByLeagueYear[league][year]), pick two distinct players
  const pool = playersByLeagueYear[league][year];
  const two = pickTwoDistinct(pool);
  if (!two) {
    console.warn(`Not enough players for ${league} ${year}`);
    return;
  }
  const [playerX, playerY] = two;

  // 4) Choose one random index in [0..n-1] to get Y; everyone else gets X
  const idxY = getRandomInt(n);

  // 5) Emit assignment to each socket
  playersInRoom.forEach((p, idx) => {
    const assigned = idx === idxY ? playerY : playerX;
    io.to(p.socketId).emit('round_assignment', {
      league,
      year,
      yourPlayer: assigned
    });
  });
}

server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
