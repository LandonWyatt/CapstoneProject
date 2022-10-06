const socket = io.connect('http://localhost:3000/');
const usersWaiting = document.getElementById('usersWaiting');
const usersWaitingClass = document.querySelector('.usersWaiting');
const usersInGame = document.getElementById('usersInGame');
const usersInGameClass = document.querySelector('.usersInGame');
const nameIn = document.getElementById('nameIn');
const nameInSubmit = document.getElementById('nameInSubmit');
const formName = document.getElementById('formName');
const gameStart = document.querySelector('.gameStart');
const countdownTimer = document.getElementById('countdownTimer');
const playerCountClass = document.querySelector('.playerCount');
const playerCount = document.getElementById('playerCount');
const choiceButtons = document.querySelector('.choiceButtons');
const gameInfo = document.querySelector('.gameInfo');
const chipCountClass = document.querySelector('.chipCountClass');
const betRaise = document.querySelector('.betRaise');
const firstChoice = document.getElementById('firstChoice');
const secondChoice = document.getElementById('secondChoice');
const foldChoice = document.getElementById('foldChoice');
const betRaiseIn = document.getElementById('betRaiseIn');

/*
 * Event listener that will listen for User's name.
 * Listens for the submit button to be pressed.
 * Then emits the value entered to the server.
 */
formName.addEventListener('submit', function (e) {
    e.preventDefault();
    // if there is a value
    if (nameIn.value !== '') {
        // set #formName to be unseen by user
        document.getElementById('formName').style.display = 'none';
        // emit value entered by user (name) to the server through 'userId'
        socket.emit('userId', nameIn.value);
        nameIn.value = "";
        // Show chip count
        usersWaitingClass.style.visibility = 'visible';
        usersInGameClass.style.visibility = 'visible';
        chipCountClass.style.visibility = 'visible';
    }
});
// check that a name is being entered
nameIn.addEventListener("input", function () {
    if (nameIn.value === '') {
        nameInSubmit.disabled = true;
    }
    else {
        nameInSubmit.disabled = false;
    }
});

/*
 * Listens for countdown from server and shows to clients
 */
socket.on('countdownToGameStart', (data) => {
    playerCountClass.style.display = 'none';
    gameStart.style.display = 'block';
    if (data > 1) {
        countdownTimer.innerHTML = "Game will start in <b>" + data + "</b> seconds...";
    }
    else if (data === 1) {
        countdownTimer.innerHTML = "Game will start in " + data + " second...";
    }
    else if (data === 0) {
        countdownTimer.innerHTML = "Game is starting...";
    }
});

var playersNeededtoStart = 3;
var playersLeft;
/*
 * Listens for player count waiting for game to start and if a game is in progress.
 * Then shows information to users in waiting room.
 */
socket.on('playerCount', (data) => {
    gameStart.style.display = 'none';
    playerCountClass.style.display = 'block';
    playersLeft = playersNeededtoStart - data[1];
    if (data[0] === false && playersLeft > 0) {
        playerCount.innerHTML = "Players connected: <b>" + data[1] + "</b><br/>";
        if (playersLeft > 1) {
            playerCount.innerHTML += "<b>" + playersLeft + "</b> more players needed to start.";
        }
        else {
            playerCount.innerHTML += "<b>" + playersLeft + "</b> more player needed to start.";
        }
    }
    else if (data[0] === false && playersLeft === 0) {
        playerCount.innerHTML = "Starting game...";
    }
    else if (data[0]) {
        playerCount.innerHTML = "Game in progress...";
    }

});

/*
 * Listens for game to start. If the current user is in the game,
 * they will be shown the game information that is needed.
 */
socket.on('gameStart', () => {
    console.log('Game Started');
    gameStart.style.display = 'none';
    // Show player information (Hand and Community Cards)
    gameInfo.style.visibility = 'visible';
    // Show choice buttons (will be disabled until turn)
    choiceButtons.style.visibility = 'visible';
})

/*
 * Listens for list of currently connected users.
 * Prints list of users sent from server into textarea #users.
 */
socket.on('showUsers', (data) => {
    var listOfUsers;
    // If user is in 'waiting' room
    if (data[2] === 0) {
        usersWaitingClass.style.visibility = 'visible';
        if (data[0].length === 0) {
            usersInGame.value = '';
        }
        if (usersWaiting.value !== '') {
            usersWaiting.value = '';
        }
        listOfUsers = data[1];
        for (var socket in listOfUsers) {
            if (usersWaiting.value !== '') {
                usersWaiting.value += '\n' + listOfUsers[socket];
            }
            else {
                usersWaiting.value += listOfUsers[socket];
            }
        }
        if (usersInGame.value !== '') {
            usersInGame.value = '';
        }
        listOfUsers = data[0];
        for (var socket in listOfUsers) {
            if (usersInGame.value !== '') {
                usersInGame.value += '\n' + listOfUsers[socket];
            }
            else {
                usersInGame.value += listOfUsers[socket];
            }
        }
    }
    // If user is in game
    else {
        usersWaitingClass.style.visibility = 'collapse';
        usersWaiting.value = '';
        if (usersInGame.value !== '') {
            usersInGame.value = '';
        }
        listOfUsers = data[0];
        for (var user in listOfUsers) {
            if (usersInGame.value !== '') {
                usersInGame.value += '\n' + listOfUsers[user];
            }
            else {
                usersInGame.value += listOfUsers[user];
            }
        }
    }
})

const highestHand = document.getElementById('highestHand');
/*
 * Listens for User's Highest Hand.
 */
socket.on('highestHand', (data) => {
    if (highestHand.innerHTML !== '') {
        highestHand.innerHTML = '';
    }
    highestHand.innerHTML = "<b>" + data + "</b>"; 
});

const chipCount = document.getElementById("chipCount");
/*
 * Listens for User's current chip count.
 */
socket.on('chipCount', (chips) => {
    console.log("chip count received");
    chipCount.innerHTML = "<b>" + chips + "</b>";
});

const usersCards = document.getElementById('cards');
/*
 * Listens for list of the separate user's cards.
 * This will receive this user's cards and show them.
 */
socket.on('userCards', (hand) => {
    console.log(hand);
    while (usersCards.children.length != 0) {
        usersCards.removeChild(usersCards.children[0]);
    }
    for (var i = 0; i < 2; i++) {
        var newImage = document.createElement("img");
        newImage.src = hand[i];
        usersCards.appendChild(newImage);
    }
});

const pot = document.getElementById("pot");
const currBet = document.getElementById("currBet");
/*
 * Listens for current pot and bet count
 */
socket.on('potCurrBet', (data) => {
    pot.innerHTML = "<b>" + data[0] + "</b>";
    currBet.innerHTML = "<b>" + data[1] + "</b>";
});

const communityCards = document.getElementById('commCards');
/*
 * Listens for current list of community cards.
 * This will be called three times per game.
 */
socket.on('communityCards', (cards) => {
    while (communityCards.children.length != 0) {
        communityCards.removeChild(communityCards.children[0]);
    }
    for (var i = 0; i < cards.length; i++) {
        var newImage = document.createElement("img");
        newImage.src = cards[i];
        communityCards.appendChild(newImage);
    }
    if (cards.length < 5) {
        for (var i = 0; i < (5 - cards.length); i++) {
            var newImage = document.createElement("img");
            newImage.src = "/images/design/emptyFrame.png";
            communityCards.appendChild(newImage);
        }
    }
});

var userChosenButton = undefined;
var amount = 0;
/*
 * Area to send User's choice and listen for
 * server to state it is a User's turn.
 */
// save which button is clicked
function saveChoice(clicked) {
    console.log(clicked);
    if (clicked !== null) {
        userChosenButton = clicked;
    }
}
// check that bet/raise textarea is entered into
betRaiseIn.addEventListener("input", function () {
    if (betRaiseIn.value === '') {
        document.getElementById('secondChoice').disabled = true;
    }
    else {
        document.getElementById('secondChoice').disabled = false;
    }
});
// Wait for User's turn.
socket.on('yourTurn', function (data) {
    var turnInformation = [];
    // Set amount as the current bet in the game.
    amount = data[0];
    console.log('your turn.');
    betRaise.style.visibility = 'visible';
    firstChoice.style.visibility = 'visible';
    secondChoice.style.visibility = 'visible';
    foldChoice.style.visibility = 'visible';
    // Set button faces
    /* 
     * In the Pre-Flop phase, if all players had called the big blind,
     * when it comes to the player who posted the big blind, they cannot
     * 'Call' the current bet as they had already posted this bet, they would
     * then 'Check', 'Raise', or 'Fold'
     */
    if (data[0] === data[1]) {
        firstChoice.innerHTML = 'Check';
    }
    else {
        firstChoice.innerHTML = 'Call';
    }
    secondChoice.innerHTML = 'Raise';

    // Listen for button click (allowing only a single click)
    choiceButtons.addEventListener('click', function () {
        if (userChosenButton !== undefined) {
            betRaise.style.visibility = 'collapse';
            firstChoice.style.visibility = 'collapse';
            secondChoice.style.visibility = 'collapse';
            foldChoice.style.visibility = 'collapse';

            // If there is a bet or raise amount given by user, add to current bet
            if (betRaiseIn.value !== '' && userChosenButton === 'secondChoice') {
                console.log('bet placed');
                amount = parseInt(betRaiseIn.value) + amount;
                betRaiseIn.value = '';
                document.getElementById('secondChoice').disabled = true;
            }
            /* Assign information to the array to send to server */
            // Assign chosen button
            turnInformation[0] = userChosenButton;
            // Assign bet amount, even if no bet was placed
            turnInformation[1] = amount;

            console.log('button pressed');
            socket.emit('tookTurn', turnInformation);
        }
        userChosenButton = undefined;
    });
});

const winnerShown = document.getElementById('winner');
const countdownShown = document.getElementById('countdown');
const endgameInfo = document.querySelector('.endgameInfo');
var countdown;
// Listens for when the game ends
socket.on('gameOverClient', function (data) {
    betRaise.style.visibility = 'collapse';
    firstChoice.style.visibility = 'collapse';
    secondChoice.style.visibility = 'collapse';
    foldChoice.style.visibility = 'collapse';
    endgameInfo.style.visibility = 'visible';
    // reset winners if there was a previous game
    if (winnerShown.innerHTML !== '') {
        winnerShown.innerHTML = '';
    }
    for (var winner in data[0]) {
        if (winnerShown.innerHTML === '') {
            winnerShown.innerHTML = 'Congratulations <b>' + data[0][winner] + '</b>';
        }
        else {
            winnerShown.innerHTML += ' & <b>' + data[0][winner] + '</b>';
        }
    }
    var winnings = data[1];
    console.log("winners.length: " + data[0].length);
    if (data[0].length > 1) {
        console.log("winnings: " + winnings);
        winnerShown.innerHTML += '<br/> The winners each won <b>' + winnings + '</b> chips each!';
    }
    else {
        console.log("winnings: " + winnings);
        winnerShown.innerHTML += '<br/> The winner won <b>' + winnings + '</b> chips!';
    }
    
    countdown = 5;
    countdownShown.innerHTML = 'Returning to Waiting room: <b>' + countdown + '</b>';
    var countdownTimer = setInterval(function () {
        countdown--;
        countdownShown.innerHTML = 'Returning to Waiting room: <b>' + countdown + '</b>';
        if (countdown === -1) {
            gameInfo.style.visibility = 'collapse';
            endgameInfo.style.visibility = 'collapse';
            socket.emit('gameOverServer');
            // Reset countdown timer
            clearInterval(countdownTimer);
        }
    }, 1000);
})
