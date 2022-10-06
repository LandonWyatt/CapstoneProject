'use strict';
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const mongoose = require('mongoose');
const uri = "mongodb+srv://Landon:Password@cluster0.ficfd.mongodb.net/capstoneDatabase?retryWrites=true&w=majority";
const port = 3000;

const Deck = require('./model/Deck.js');
const PokerPresenter = require('./presenter/PokerPresenter.js');
const User = require('./presenter/User.js');
const DBModel = require('./model/DBModel.js');

var pokerGame;
var gameInProgress = false, // Check if there is a game in progress
    countdownInProgress = false, // Check if there is a countdown in progress
    inGameUsersReturned = 0, // Keep track of number of players returned from game to start next countdown
    leftOfDealer = -1; // Keeps track of who will post small blind
// List of users' objects
var users = {};
var inGameUsers = {};
// List of users' names
var usersNames = {};
var inGameUsersNames = {};

// Create connection to database
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(err => console.log(`Initial connection error: ${err}`));
const db = mongoose.connection;
db
    .once('open', () => { console.log('Database initial connection complete'); })
    .on('error', (err) => {
        console.log('Connection error');
        console.log(err);
    })
    .on('disconnected', () => { console.log('Disconnected from server'); })
    .on('reconnected', () => { console.log('Reconnected to server'); })
    .on('reconnectFailed', () => { console.log('Failed to reconnect'); });

// Send initial HTML file to the server.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/home.html'));
});

// Send .js files to client
app.get('/home.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(__dirname + '/views/home.js');
});

app.use(express.static('public'));

// Listen for connection of user.
io.on('connection', (socket) => {
    socket.on('userId', (data) => {
        findUser(data).then(result => {
            users[socket.id] = new User(socket, data, io); // save user's object
            console.log(users[socket.id].name + ' has been assigned to ' + socket.id + '.');
            usersNames[socket.id] = users[socket.id].name; // save name in separate list
            // If user is found, create their User object with their chip count
            if (typeof (result) === 'number') {
                // Set users chip count based on what is saved in DB
                users[socket.id].chipCount = result;
            }
            // If not, create them in the DB
            else {
                addUser(data);
            }
            socket.join('waiting');
            // Emit to players who are waiting a list of users they are waiting with and those in a game
            io.to('waiting').emit('showUsers', [inGameUsersNames, usersNames, 0]);
            io.to(socket.id).emit('chipCount', users[socket.id].chipCount);
            // Send player count to players
            io.to('waiting').emit('playerCount', [gameInProgress, Object.keys(users).length]);
            // Check for starting a countdown
            countdownCheck();
        });
    });
    // Listen for user to take next turn.
    socket.on('tookTurn', (data) => {
        console.log(data);
        // Register Player's Turn
        pokerGame.updateUser(data);
        // Continue to next turn
        pokerGame.nextTurn();
    });
    // Listen for client to recognize the game has ended.
    socket.on('gameOverServer', () => {
        // Record that a client has sent a message to server
        inGameUsersReturned++;
        // If all clients have sent a 'game over' message to server
        if (inGameUsersReturned === Object.keys(inGameUsers).length) {
            console.log("Game confirmed over");
            // Add users back to waiting room
            for (var i = 0; i < Object.keys(inGameUsers).length; i++) {
                if (users[Object.keys(inGameUsers)[i]] !== undefined) {
                    // Assign User to 'waiting' room and leave 'inGame' room
                    (users[Object.keys(inGameUsers)[i]].socket).leave('inGame');
                    (users[Object.keys(inGameUsers)[i]].socket).join('waiting');
                    // Add User's name back to list of users' names in 'waiting' room
                    usersNames[Object.keys(inGameUsers)[i]] = inGameUsers[Object.keys(inGameUsers)[i]].name;
                    console.log(users[Object.keys(inGameUsers)[i]].name + ' is returning to waiting room.');
                    // Reset current bet and current status of User
                    users[Object.keys(inGameUsers)[i]].currUserBet = 0;
                    users[Object.keys(inGameUsers)[i]].currStatus = 'NR';
                }
            }
            inGameUsersNames = {};
            inGameUsers = {};
            // Emit to players who are waiting a list of users they are waiting with and those in a game
            io.to('waiting').emit('showUsers', [inGameUsersNames, usersNames, 0]);
            // Set game as not in progress
            gameInProgress = false;
            // Set number of users returned back to 0
            inGameUsersReturned = 0;
            // Check countdown
            countdownCheck();
        }
    });
    // Listen for socket (user) to disconnect and if so delete user information.
    socket.on('disconnect', () => {
        if (users[socket.id] !== undefined) {
            console.log(users[socket.id].name + ' disconnected.');
            if (gameInProgress && socket.id in inGameUsersNames) {
                pokerGame.users[socket.id].currStatus = 'F';
                pokerGame.foldedUsers++;
                pokerGame.readyUsers++;
                inGameUsersReturned++;
                if (pokerGame.currSocket === socket.id) {
                    pokerGame.nextTurn();
                }
            }
            // Update chip count that is saved in database.
            var userData = [socket.id, users[socket.id].chipCount];
            updateUser(userData);
            delete users[socket.id];
            delete usersNames[socket.id];
            delete inGameUsersNames[socket.id];
            // Emit to all players to show who had disconnected
            io.to('waiting').emit('showUsers', [inGameUsersNames, usersNames, 0]);
            io.to('inGame').emit('showUsers', [inGameUsersNames, usersNames, 1]);
            if (Object.keys(inGameUsersNames).length === 1) {
                pokerGame.gameState = 4;
                pokerGame.performGamestate();
            }
            // Update player count in waiting room if a user disconnects if there is no countdown in progress
            if (!countdownInProgress) {
                io.to('waiting').emit('playerCount', [gameInProgress, Object.keys(users).length]);
            }
            
        }
    });
});

/*
 * Finds if a user is in the DB.
 * if so, returns the chip count.
 * @param {string} name - name of user being found in DB.
 */
async function findUser(name) {
    var findName = await DBModel.find({}).where('name').equals(name).exec();
    // If there is no user found in the DB with this name
    if (findName.length === 0) {
        return false;
    }
    // If there is a user found in the DB, return their chipCount
    else {
        return findName[0].chipCount;
    }
}

/*
 * Create user in DB.
 * @param {string} data - name of user being added to DB.
 */
async function addUser(data) {
    await DBModel.create({ name: data, chipCount: 1000 });
    console.log(data + " has been added to the DB.");
}

/*
 * Update user's chip count in DB.
 * @param {any[]} data - will contain the user's socket id that is being added (string) and the user's chip count (number).
 */
async function updateUser(data) {
    var name = users[data[0]].name;
    await DBModel.findOneAndUpdate({}, { chipCount: data[1] }, { new: true, useFindAndModify: false }).where('name').equals(name);
    console.log(name + "'s chip count has been updated in DB.");
}

/*
 * Checks if a countdown can be ran.
 * Does not continue or start if there aren't enough players
 */
function countdownCheck() {
    console.log("A call for countdown has been noted.");
    if (countdownInProgress === false && gameInProgress === false && Object.keys(users).length >= 3) {
        countdownInProgress = true;
        var countdown = 5;
        var timer = setInterval(function () {
            if (Object.keys(users).length < 3) {
                countdownInProgress = false;
                console.log("Not enough players");
                // Show users that there aren't enough players if a countdown was in progress and a user disconnected
                io.to('waiting').emit('playerCount', [gameInProgress, Object.keys(users).length]);
                // Reset countdown timer
                clearInterval(timer);
                return;
            }
            io.to('waiting').emit('countdownToGameStart', countdown);
            console.log(countdown--);
            // Countdown is over, start game
            if (countdown === -1) {
                // Create list of users that will be in current game
                countdownInProgress = false;
                console.log("Countdown over");
                gameInProgress = true;
                /* Start game */
                // Add each user that is a part of the current game to a room named 'inGame'
                for (var i = 0; i < Object.keys(users).length; i++) {
                    console.log(users[Object.keys(users)[i]].name + " is being added to current game.");
                    // Assign User to 'inGame' room and leave 'waiting' room
                    (users[Object.keys(users)[i]].socket).leave('waiting');
                    (users[Object.keys(users)[i]].socket).join('inGame');
                    // Add User to list of users in a game
                    inGameUsers[Object.keys(users)[i]] = users[Object.keys(users)[i]];
                    // Add User's name to a list of users in a game
                    inGameUsersNames[Object.keys(inGameUsers)[i]] = inGameUsers[Object.keys(inGameUsers)[i]].name;
                    // Remove User from list of names in waiting room
                    delete usersNames[Object.keys(inGameUsers)[i]];
                    console.log(users[Object.keys(users)[i]].name + ' has joined a game.');
                }
                // Find out which player will post the small blind and set accordingly
                if (leftOfDealer >= Object.keys(inGameUsers).length - 1) {
                    leftOfDealer = 0;
                }
                else {
                    leftOfDealer++;
                }
                // initialize and start game
                var gameDeck = new Deck();
                pokerGame = new PokerPresenter(inGameUsers, gameDeck, leftOfDealer, io);
                io.to('inGame').emit('gameStart');
                // Emit list of users in current game to everybody playing
                io.to('inGame').emit('showUsers', [inGameUsersNames, usersNames, 1]);
                pokerGame.startGame();
                // Reset countdown timer
                clearInterval(timer);
            }
        }, 1000);
    }
}

server.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
})

module.exports = app;