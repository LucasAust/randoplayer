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
    2023: [
      "Patrick Mahomes",
      "Justin Jefferson",
      "Nick Bosa",
      "Chris Jones",
      "Travis Kelce",
      "Micah Parsons",
      "Sauce Gardner",
      "Davante Adams",
      "Stefon Diggs",
      "Aaron Donald"
    ], // 
    2022: [
      "Patrick Mahomes",
      "Aaron Donald",
      "Nick Bosa",
      "Micah Parsons",
      "Travis Kelce",
      "Davante Adams",
      "Stefon Diggs",
      "Chris Jones",
      "Aaron Rodgers",
      "Jalen Ramsey"
    ], // 
    2021: [
      "Aaron Donald",
      "Tom Brady",
      "Patrick Mahomes",
      "Russell Wilson",
      "DeAndre Hopkins",
      "Travis Kelce",
      "Davante Adams",
      "Christian McCaffrey",
      "T. J. Watt",
      "Myles Garrett"
    ], // 
    2020: [
      "Aaron Donald",
      "Patrick Mahomes",
      "Lamar Jackson",
      "Chris Jones",
      "Davante Adams",
      "Jalen Ramsey",
      "DeAndre Hopkins",
      "Stefon Diggs",
      "Travis Kelce",
      "Micah Parsons"
    ], // 
    2019: [
      "Patrick Mahomes",
      "Aaron Donald",
      "Russell Wilson",
      "Von Miller",
      "J. J. Watt",
      "Tom Brady",
      "DeAndre Hopkins",
      "Travis Kelce",
      "Davante Adams",
      "Todd Gurley"
    ], // 
    2018: [
      "Aaron Donald",
      "Patrick Mahomes",
      "Russell Wilson",
      "Tom Brady",
      "J. J. Watt",
      "Von Miller",
      "Travis Kelce",
      "DeAndre Hopkins",
      "Davante Adams",
      "Christian McCaffrey"
    ], // 
    2017: [
      "Tom Brady",
      "Aaron Donald",
      "Von Miller",
      "J. J. Watt",
      "Andrew Luck",
      "Aaron Rodgers",
      "Cam Newton",
      "Jimmy Graham",
      "Dez Bryant",
      "Adrian Peterson"
    ], // 
    2016: [
      "Aaron Donald",
      "Tom Brady",
      "J. J. Watt",
      "Luke Kuechly",
      "Rob Gronkowski",
      "Julius Peppers",
      "Le’Veon Bell",
      "Antonio Brown",
      "Von Miller",
      "Marshawn Lynch"
    ], // 
    2015: [
      "J. J. Watt",
      "Aaron Donald",
      "Tom Brady",
      "Von Miller",
      "Rob Gronkowski",
      "Dez Bryant",
      "Richard Sherman",
      "LeSean McCoy",
      "Luke Kuechly",
      "Marshawn Lynch"
    ], // 
    2014: [
      "J. J. Watt",
      "Aaron Donald",
      "Calvin Johnson",
      "Von Miller",
      "Joe Thomas",
      "Richard Sherman",
      "Peyton Manning",
      "Andrew Luck",
      "LeSean McCoy",
      "Colin Kaepernick"
    ], // 
    2013: [
      "Adrian Peterson",
      "Calvin Johnson",
      "J. J. Watt",
      "Peyton Manning",
      "Von Miller",
      "Rob Gronkowski",
      "Julius Pepper",
      "Drew Brees",
      "Joe Thomas",
      "Patrick Willis"
    ], // 
    2012: [
      "Calvin Johnson",
      "Aaron Rodgers",
      "Adrian Peterson",
      "Ray Lewis",
      "DeMarcus Ware",
      "Peyton Manning",
      "Tony Gonzalez",
      "Drew Brees",
      "Marshawn Lynch",
      "Andrew Luck"
    ], // 
    2011: [
      "Drew Brees",
      "Aaron Rodgers",
      "Tom Brady",
      "Peyton Manning",
      "Calvin Johnson",
      "Larry Fitzgerald",
      "Julius Pepper",
      "Von Miller",
      "DeMarcus Ware",
      "Adrian Peterson"
    ], // 
    2010: [
      "Tom Brady",
      "Aaron Rodgers",
      "Drew Brees",
      "Adrian Peterson",
      "Ray Lewis",
      "Calvin Johnson",
      "Peyton Manning",
      "DeMarcus Ware",
      "Darrelle Revis",
      "Philip Rivers"
    ], // 
    2009: [
      "Peyton Manning",
      "Tom Brady",
      "LaDainian Tomlinson",
      "Chad Johnson (Ochocinco)",
      "Larry Fitzgerald",
      "Reggie Wayne",
      "Calvin Johnson",
      "DeMarcus Ware",
      "Reggie Bush",
      "Nick Graham"
    ] // 
  },
  nba: {
    2023: [
      "Luka Dončić",
      "Giannis Antetokounmpo",
      "Nikola Jokić",
      "Jayson Tatum",
      "Ja Morant",
      "Kevin Durant",
      "Jimmy Butler",
      "Trae Young",
      "Shai Gilgeous-Alexander",
      "LeBron James"
    ], // 
    2022: [
      "Nikola Jokić",
      "Giannis Antetokounmpo",
      "Joel Embiid",
      "Jayson Tatum",
      "Luka Dončić",
      "LeBron James",
      "Kevin Durant",
      "Stephen Curry",
      "Kawhi Leonard",
      "Ja Morant"
    ], // 
    2021: [
      "Nikola Jokić",
      "Stephen Curry",
      "Giannis Antetokounmpo",
      "LeBron James",
      "Kevin Durant",
      "Kawhi Leonard",
      "Luka Dončić",
      "Joel Embiid",
      "Damian Lillard",
      "LeBron James"
    ], // 
    2020: [
      "LeBron James",
      "Giannis Antetokounmpo",
      "Luka Dončić",
      "Kevin Durant",
      "Kawhi Leonard",
      "Anthony Davis",
      "Stephen Curry",
      "James Harden",
      "Kyrie Irving",
      "Damian Lillard"
    ], // 
    2019: [
      "LeBron James",
      "Kevin Durant",
      "Giannis Antetokounmpo",
      "Stephen Curry",
      "Kawhi Leonard",
      "James Harden",
      "Anthony Davis",
      "Kyrie Irving",
      "Damian Lillard",
      "Russell Westbrook"
    ], // 
    2018: [
      "LeBron James",
      "Kevin Durant",
      "Stephen Curry",
      "Kawhi Leonard",
      "James Harden",
      "Giannis Antetokounmpo",
      "Anthony Davis",
      "Joel Embiid",
      "John Wall",
      "Russell Westbrook"
    ], // 
    2017: [
      "LeBron James",
      "Stephen Curry",
      "Kevin Durant",
      "Kawhi Leonard",
      "Russell Westbrook",
      "Jimmy Butler",
      "James Harden",
      "Kyrie Irving",
      "Klay Thompson",
      "Draymond Green"
    ], // 
    2016: [
      "LeBron James",
      "Kevin Durant",
      "Stephen Curry",
      "Kawhi Leonard",
      "Russell Westbrook",
      "James Harden",
      "Anthony Davis",
      "Klay Thompson",
      "Kevin Love",
      "DeMarcus Cousins"
    ], // 
    2015: [
      "LeBron James",
      "Kevin Durant",
      "Stephen Curry",
      "Kawhi Leonard",
      "Anthony Davis",
      "James Harden",
      "Russell Westbrook",
      "Chris Paul",
      "Blake Griffin",
      "Derrick Rose"
    ], // 
    2014: [
      "LeBron James",
      "Kevin Durant",
      "Stephen Curry",
      "Kawhi Leonard",
      "Russell Westbrook",
      "James Harden",
      "Chris Paul",
      "Derrick Rose",
      "Carmelo Anthony",
      "Dwight Howard"
    ], // 
    2013: [
      "LeBron James",
      "Kevin Durant",
      "Stephen Curry",
      "Chris Paul",
      "Dwight Howard",
      "Derrick Rose",
      "Dwayne Wade",
      "Kobe Bryant",
      "Carmelo Anthony",
      "Carmelo Anthony"
    ], // 
    2012: [
      "LeBron James",
      "Kevin Durant",
      "Kobe Bryant",
      "Dwight Howard",
      "Chris Paul",
      "Derrick Rose",
      "Tony Parker",
      "Kevin Love",
      "Russell Westbrook",
      "Carmelo Anthony"
    ], // 
    2011: [
      "LeBron James",
      "Kevin Durant",
      "Dwyane Wade",
      "Kobe Bryant",
      "Chris Paul",
      "Dwight Howard",
      "Carmelo Anthony",
      "Derrick Rose",
      "Blake Griffin",
      "Joe Johnson"
    ], // 
    2010: [
      "LeBron James",
      "Kobe Bryant",
      "Kevin Garnett",
      "Dwight Howard",
      "Dwyane Wade",
      "Chris Paul",
      "Kevin Durant",
      "Tim Duncan",
      "Steve Nash",
      "Amar’e Stoudemire"
    ], // 
    2009: [
      "LeBron James",
      "Kobe Bryant",
      "Dwight Howard",
      "Dwyane Wade",
      "Kevin Garnett",
      "Allen Iverson",
      "Dirk Nowitzki",
      "Chris Paul",
      "Pau Gasol",
      "Amar’e Stoudemire"
    ] // 
  },
  mlb: {
    2023: [
      "Aaron Judge",
      "Mookie Betts",
      "Shohei Ohtani",
      "José Ramírez",
      "Victor Robles",
      "Mike Trout",
      "Juan Soto",
      "Ronald Acuña Jr.",
      "Manny Machado",
      "Josh Hader"
    ], // 
    2022: [
      "Aaron Judge",
      "Mookie Betts",
      "Shohei Ohtani",
      "Mike Trout",
      "José Ramírez",
      "Juan Soto",
      "Corey Seager",
      "Manny Machado",
      "Kyle Tucker",
      "Bryce Harper"
    ], // 
    2021: [
      "Mike Trout",
      "Jacob deGrom",
      "Shohei Ohtani",
      "Mookie Betts",
      "Freddie Freeman",
      "Juan Soto",
      "Fernando Tatis Jr.",
      "José Altuve",
      "Manny Machado",
      "Aaron Judge"
    ], // 
    2020: [
      "Mike Trout",
      "Mookie Betts",
      "Christian Yelich",
      "Nolan Arenado",
      "Ronald Acuña Jr.",
      "Christian Yelich",
      "Jacob deGrom",
      "Manny Machado",
      "Juan Soto",
      "Jacob deGrom"
    ], // 
    2019: [
      "Mike Trout",
      "Christian Yelich",
      "Mookie Betts",
      "Nolan Arenado",
      "Ronald Acuña Jr.",
      "José Altuve",
      "Jacob deGrom",
      "Francisco Lindor",
      "Manny Machado",
      "Bryce Harper"
    ], // 
    2018: [
      "Mike Trout",
      "Christian Yelich",
      "Mookie Betts",
      "Nolan Arenado",
      "Aaron Judge",
      "José Altuve",
      "Christian Yelich",
      "Paul Goldschmidt",
      "Francisco Lindor",
      "Bryce Harper"
    ], // 
    2017: [
      "Mike Trout",
      "Mookie Betts",
      "Nolan Arenado",
      "Francisco Lindor",
      "Clayton Kershaw",
      "Bryce Harper",
      "Miguel Cabrera",
      "José Altuve",
      "Freddie Freeman",
      "Paul Goldschmidt"
    ], // 
    2016: [
      "Mike Trout",
      "Clayton Kershaw",
      "Mookie Betts",
      "Nolan Arenado",
      "Bryce Harper",
      "José Altuve",
      "Jon Lester",
      "Mike Trout",
      "Paul Goldschmidt",
      "Madison Bumgarner"
    ], // 
    2015: [
      "Mike Trout",
      "Clayton Kershaw",
      "Mookie Betts",
      "Nolan Arenado",
      "Bryce Harper",
      "Jose Pederson",
      "Miguel Cabrera",
      "Josh Donaldson",
      "Max Scherzer",
      "Paul Goldschmidt"
    ], // 
    2014: [
      "Mike Trout",
      "Mike Trout",
      "Miguel Cabrera",
      "Clayton Kershaw",
      "Robinson Canó",
      "Freddie Freeman",
      "Nolan Arenado",
      "Andrew McCutchen",
      "Joey Votto",
      "Clayton Kershaw"
    ], // 
    2013: [
      "Miguel Cabrera",
      "Mike Trout",
      "Clayton Kershaw",
      "Paul Goldschmidt",
      "Justin Verlander",
      "Yadier Molina",
      "Andrew McCutchen",
      "Robinson Canó",
      "Miguel Cabrera",
      "Jake Arrieta"
    ], // 
    2012: [
      "Miguel Cabrera",
      "Justin Verlander",
      "Buster Posey",
      "Ryan Braun",
      "Prince Fielder",
      "Miguel Cabrera",
      "Clayton Kershaw",
      "Ryan Zimmerman",
      "Joe Mauer",
      "Matt Kemp"
    ], // 
    2011: [
      "Miguel Cabrera",
      "Ryan Braun",
      "Paul Goldschmidt",
      "Robinson Canó",
      "Miguel Cabrera",
      "Clayton Kershaw",
      "Melky Cabrera",
      "Justin Verlander",
      "Joey Votto",
      "Matt Kemp"
    ], // 
    2010: [
      "Albert Pujols",
      "Roy Halladay",
      "Miguel Cabrera",
      "Derek Jeter",
      "Troy Tulowitzki",
      "Joe Mauer",
      "Chase Utley",
      "Ryan Braun",
      "Prince Fielder",
      "Albert Pujols"
    ], // 
    2009: [
      "Albert Pujols",
      "Alex Rodriguez",
      "Derek Jeter",
      "Chase Utley",
      "Miguel Cabrera",
      "Joe Mauer",
      "Ryan Braun",
      "Prince Fielder",
      "Joey Votto",
      "Pujols"
    ] // 
  },
  nhl: {
    2023: [
      "Connor McDavid",
      "Leon Draisaitl",
      "Nathan MacKinnon",
      "Auston Matthews",
      "Igor Shesterkin",
      "Aleksander Barkov",
      "Cale Makar",
      "Nathan MacKinnon",
      "Oliver Ekman-Larsson",
      "Drew Doughty"
    ], // 
    2022: [
      "Connor McDavid",
      "Auston Matthews",
      "Leon Draisaitl",
      "Nathan MacKinnon",
      "Cale Makar",
      "Igor Shesterkin",
      "Sidney Crosby",
      "Aleksander Barkov",
      "David Pastrňák",
      "Steven Stamkos"
    ], // 
    2021: [
      "Connor McDavid",
      "Leon Draisaitl",
      "Auston Matthews",
      "Victor Hedman",
      "Nathan MacKinnon",
      "Andrei Vasilevskiy",
      "Brad Marchand",
      "Drew Doughty",
      "Cale Makar",
      "Braden Holtby"
    ], // 
    2020: [
      "Connor McDavid",
      "Auston Matthews",
      "Leon Draisaitl",
      "Nathan MacKinnon",
      "Mark Stone",
      "Cale Makar",
      "Victor Hedman",
      "Andrei Vasilevskiy",
      "Sidney Crosby",
      "Drew Doughty"
    ], // 
    2019: [
      "Connor McDavid",
      "Auston Matthews",
      "Leon Draisaitl",
      "Nathan MacKinnon",
      "Mark Stone",
      "Brad Marchand",
      "John Carlson",
      "Evgeni Malkin",
      "Patrice Bergeron",
      "Victor Hedman"
    ], // 
    2018: [
      "Connor McDavid",
      "Auston Matthews",
      "Patrick Kane",
      "Evgeni Malkin",
      "Steven Stamkos",
      "Nikita Kucherov",
      "Sidney Crosby",
      "Connor McDavid",
      "Braden Holtby",
      "John Carlson"
    ], // 
    2017: [
      "Connor McDavid",
      "Auston Matthews",
      "Patrick Kane",
      "Evgeni Malkin",
      "Steven Stamkos",
      "Sidney Crosby",
      "Braden Holtby",
      "John Tavares",
      "Drew Doughty",
      "Victor Hedman"
    ], // 
    2016: [
      "Connor McDavid",
      "Auston Matthews",
      "Sidney Crosby",
      "Evgeni Malkin",
      "Steven Stamkos",
      "Patrick Kane",
      "Braden Holtby",
      "John Tavares",
      "Victor Hedman",
      "Carey Price"
    ], // 
    2015: [
      "Sidney Crosby",
      "Joe Thornton",
      "P. K. Subban",
      "Dustin Byfuglien",
      "Jamie Benn",
      "Patrice Bergeron",
      "Zdeno Chára",
      "Drew Doughty",
      "Carey Price",
      "Sidney Crosby"
    ], // 
    2014: [
      "Sidney Crosby",
      "Alex Ovechkin",
      "Evgeni Malkin",
      "Patrick Kane",
      "Jonathan Toews",
      "Steven Stamkos",
      "Braden Holtby",
      "Carey Price",
      "Brent Burns",
      "Zdeno Chára"
    ], // 
    2013: [
      "Sidney Crosby",
      "Alex Ovechkin",
      "Evgeni Malkin",
      "Patrick Kane",
      "Jonathan Toews",
      "Henrik Lundqvist",
      "Steven Stamkos",
      "Drew Doughty",
      "Mike Green",
      "Anze Kopitar"
    ], // 
    2012: [
      "Sidney Crosby",
      "Evgeni Malkin",
      "Alexander Ovechkin",
      "Jonathan Toews",
      "P. K. Subban",
      "Dustin Byfuglien",
      "Steven Stamkos",
      "Sidney Crosby",
      "Carey Price",
      "Nicklas Lidström"
    ], // 
    2011: [
      "Sidney Crosby",
      "Evgeni Malkin",
      "Alex Ovechkin",
      "Jonathan Toews",
      "Patrick Kane",
      "Carey Price",
      "P. K. Subban",
      "Dustin Byfuglien",
      "Ryan Suter",
      "Braden Holtby"
    ], // 
    2010: [
      "Sidney Crosby",
      "Alex Ovechkin",
      "Jarome Iginla",
      "Nicklas Lidström",
      "Evgeni Malkin",
      "Joe Thornton",
      "Steven Stamkos",
      "Carey Price",
      "Ryan Suter",
      "Drew Doughty"
    ], // 
    2009: [
      "Sidney Crosby",
      "Alex Ovechkin",
      "Evgeni Malkin",
      "Joe Thornton",
      "Nicklas Lidström",
      "Zdeno Chára",
      "Patrice Bergeron",
      "Martin St. Louis",
      "Sidney Crosby",
      "Braden Holtby"
    ] // 
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
