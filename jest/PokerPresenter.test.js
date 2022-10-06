const PokerPresenter = require('../presenter/PokerPresenter.js');
const Deck = require('../model/Deck.js');
const Card = require('../model/Card.js');
const User = require('../presenter/User.js');

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

/**
 * This will test the PokerPresenter.js class.
 */
test('Check that a game can be started.', () => {
    const gameDeck = new Deck();
    var users = {};
    users['1111'] = new User('1111', 'User1', 1); // Create User1
    users['2222'] = new User('2222', 'User2', 1); // Create User2
    users['3333'] = new User('3333', 'User3', 1); // Create User3
    
    // Create Poker Game object.
    const pokerGame = new PokerPresenter(users, gameDeck, 0, io);
    // Begin Game
    pokerGame.startGame();

    // Check that each User hand has been included into the game
    // and given a hand.
    expect(users['1111'].playerHand[0].getCard()).not.toBe('');
    expect(users['2222'].playerHand[0].getCard()).not.toBe('');
    expect(users['3333'].playerHand[0].getCard()).not.toBe('');

    // Go through turns and test that the turn counter does work.
    pokerGame.nextTurn();
    expect(pokerGame.currUser).toBe(0);
    pokerGame.nextTurn();
    pokerGame.nextTurn();
    expect(pokerGame.currUser).toBe(2);

    // Set each player as ready and take next turn and test that it changes gamestate.
    pokerGame.readyUsers = 3;
    pokerGame.nextTurn();
    expect(pokerGame.gameState).toBe(1);

    // Test the rest of the gamestates
    pokerGame.gameState = 2;
    pokerGame.performGamestate();
    pokerGame.gameState = 3;
    pokerGame.performGamestate();
    pokerGame.gameState = 4;
    pokerGame.performGamestate();
})

test('Check that presenter can determine each highest hand correctly.', () => {
    const gameDeck = new Deck();
    var users = {}, highestHand;
    users['1111'] = new User('1111', 'User1', 1); // Create User1

    // Create Poker Game object.
    const pokerGame = new PokerPresenter(users, gameDeck, io);
  
    /* Checks for Royal Flush */
    // Deal cards to user and community
    users['1111'].playerHand.push(new Card('diamonds', 'A'));
    users['1111'].playerHand.push(new Card('diamonds', 'Q'));
    pokerGame.communityCards.push(new Card('diamonds', 'K'));
    pokerGame.communityCards.push(new Card('diamonds', 'J'));
    pokerGame.communityCards.push(new Card('diamonds', '10'));

    highestHand = pokerGame.checkHighestHand('1111');

    // Check that highest hand is equal to Royal Flush
    expect(highestHand).toStrictEqual(['Royal Flush', undefined, undefined]);

    // Reset Cards
    users['1111'].emptyHand();
    pokerGame.communityCards = [];

    /* Checks for Royal Flush */
    // Deal cards to user and community
    users['1111'].playerHand.push(new Card('hearts', 'A'));
    users['1111'].playerHand.push(new Card('hearts', 'Q'));
    pokerGame.communityCards.push(new Card('hearts', 'K'));
    pokerGame.communityCards.push(new Card('hearts', 'J'));
    pokerGame.communityCards.push(new Card('hearts', '10'));

    highestHand = pokerGame.checkHighestHand('1111');

    // Check that highest hand is equal to Royal Flush
    expect(highestHand).toStrictEqual(['Royal Flush', undefined, undefined]);

    // Reset Cards
    users['1111'].emptyHand();
    pokerGame.communityCards = [];
    // Deal cards to user and community
    users['1111'].playerHand.push(new Card('spades', 'A'));
    users['1111'].playerHand.push(new Card('spades', 'Q'));
    pokerGame.communityCards.push(new Card('spades', 'K'));
    pokerGame.communityCards.push(new Card('spades', 'J'));
    pokerGame.communityCards.push(new Card('spades', '10'));

    highestHand = pokerGame.checkHighestHand('1111');

    // Check that highest hand is equal to Royal Flush
    expect(highestHand).toStrictEqual(['Royal Flush', undefined, undefined]);

    // Reset Cards
    users['1111'].emptyHand();
    pokerGame.communityCards = [];
    // Deal cards to user and community
    users['1111'].playerHand.push(new Card('clubs', 'A'));
    users['1111'].playerHand.push(new Card('clubs', 'Q'));
    pokerGame.communityCards.push(new Card('clubs', 'K'));
    pokerGame.communityCards.push(new Card('clubs', 'J'));
    pokerGame.communityCards.push(new Card('clubs', '10'));

    highestHand = pokerGame.checkHighestHand('1111');

    // Check that highest hand is equal to Royal Flush
    expect(highestHand).toStrictEqual(['Royal Flush', undefined, undefined]);

    // Reset Cards
    users['1111'].emptyHand();
    pokerGame.communityCards = [];
  
    /* Checks for a Straight Flush */
    // Deal cards to user and community
    users['1111'].playerHand.push(new Card('clubs', '9'));
    users['1111'].playerHand.push(new Card('clubs', '10'));
    pokerGame.communityCards.push(new Card('clubs', '7'));
    pokerGame.communityCards.push(new Card('clubs', 'J'));
    pokerGame.communityCards.push(new Card('clubs', '8'));

    highestHand = pokerGame.checkHighestHand('1111');

    // Check that highest hand is equal to Royal Flush
    expect(highestHand).toStrictEqual(['Straight Flush', 'J', undefined]);

    // Reset Cards
    users['1111'].emptyHand();
    pokerGame.communityCards = [];
  
    /* Checks for Four of a Kind */
    // Deal cards to user and community
    users['1111'].playerHand.push(new Card('diamonds', '6'));
    users['1111'].playerHand.push(new Card('diamonds', '6'));
    pokerGame.communityCards.push(new Card('diamonds', '6'));
    pokerGame.communityCards.push(new Card('diamonds', '6'));
    pokerGame.communityCards.push(new Card('clubs', '8'));

    highestHand = pokerGame.checkHighestHand('1111');

    expect(highestHand).toStrictEqual(['Four of a Kind', '6', '8']);

    // Reset Cards
    users['1111'].emptyHand();
    pokerGame.communityCards = [];
    /* Checks for Full House */
    // Deal cards to user and community
    users['1111'].playerHand.push(new Card('diamonds', '6'));
    users['1111'].playerHand.push(new Card('diamonds', '6'));
    pokerGame.communityCards.push(new Card('spades', '6'));
    pokerGame.communityCards.push(new Card('diamonds', '3'));
    pokerGame.communityCards.push(new Card('clubs', '3'));

    highestHand = pokerGame.checkHighestHand('1111');

    expect(highestHand).toStrictEqual(['Full House', '6', '3']);

    // Reset Cards
    users['1111'].emptyHand();
    pokerGame.communityCards = [];
    /* Checks for Flush */
    // Deal cards to user and community
    users['1111'].playerHand.push(new Card('diamonds', '2'));
    users['1111'].playerHand.push(new Card('diamonds', '3'));
    pokerGame.communityCards.push(new Card('diamonds', '5'));
    pokerGame.communityCards.push(new Card('diamonds', '8'));
    pokerGame.communityCards.push(new Card('diamonds', '6'));
    pokerGame.communityCards.push(new Card('clubs', 'J'));

    highestHand = pokerGame.checkHighestHand('1111');

    expect(highestHand).toStrictEqual(['Flush', '8', undefined]);

    // Reset Cards
    users['1111'].emptyHand();
    pokerGame.communityCards = [];
    /* Checks for Straight */
    // Deal cards to user and community
    users['1111'].playerHand.push(new Card('diamonds', '5'));
    users['1111'].playerHand.push(new Card('spades', '6'));
    pokerGame.communityCards.push(new Card('diamonds', '4'));
    pokerGame.communityCards.push(new Card('hearts', '2'));
    pokerGame.communityCards.push(new Card('clubs', '3'));

    highestHand = pokerGame.checkHighestHand('1111');

    expect(highestHand).toStrictEqual(['Straight', '6', undefined]);

    // Reset Cards
    users['1111'].emptyHand();
    pokerGame.communityCards = [];
  
    /* Checks for Three of a Kind */
    // Deal cards to user and community
    users['1111'].playerHand.push(new Card('diamonds', '6'));
    users['1111'].playerHand.push(new Card('spades', '6'));
    pokerGame.communityCards.push(new Card('diamonds', '6'));

    highestHand = pokerGame.checkHighestHand('1111');

    expect(highestHand).toStrictEqual(['Three of a Kind', '6', '6']);

    // Reset Cards
    users['1111'].emptyHand();
    pokerGame.communityCards = [];
    /* Checks for Two Pair */
    // Deal cards to user and community
    users['1111'].playerHand.push(new Card('diamonds', '6'));
    users['1111'].playerHand.push(new Card('spades', 'J'));
    pokerGame.communityCards.push(new Card('diamonds', '6'));
    pokerGame.communityCards.push(new Card('hearts', 'J'));

    highestHand = pokerGame.checkHighestHand('1111');

    expect(highestHand).toStrictEqual(['Two Pair', 'J', '6']);

    // Reset Cards
    users['1111'].emptyHand();
    pokerGame.communityCards = [];
    /* Checks for Pair */
    // Deal cards to user and community
    users['1111'].playerHand.push(new Card('diamonds', 'A'));
    users['1111'].playerHand.push(new Card('spades', 'Q'));
    pokerGame.communityCards.push(new Card('diamonds', 'Q'));

    highestHand = pokerGame.checkHighestHand('1111');

    expect(highestHand).toStrictEqual(['Pair', 'Q', 'A']);

    // Reset Cards
    users['1111'].emptyHand();
    pokerGame.communityCards = [];
    /* Checks for High Card */
    // Deal cards to user and community
    users['1111'].playerHand.push(new Card('diamonds', 'A'));
    users['1111'].playerHand.push(new Card('clubs', '10'));
    pokerGame.communityCards.push(new Card('diamonds', '2'));
    pokerGame.communityCards.push(new Card('spades', '3'));
    pokerGame.communityCards.push(new Card('hearts', '4'));
    pokerGame.communityCards.push(new Card('spades', '7'));
    pokerGame.communityCards.push(new Card('diamonds', '8'));

    highestHand = pokerGame.checkHighestHand('1111');

    expect(highestHand).toStrictEqual(['High Card', 'A', '10']);
})

test('Check that presenter can determine who the winner is.', () => {
    const gameDeck = new Deck();
    var users = {}, winners;
    users['1111'] = new User('1111', 'User1', 1); // Create User1
    users['2222'] = new User('2222', 'User2', 1); // Create User2
    users['3333'] = new User('3333', 'User3', 1); // Create User3
    users['4444'] = new User('4444', 'User4', 1); // Create User4
    users['5555'] = new User('5555', 'User5', 1); // Create User3
    users['6666'] = new User('6666', 'User6', 1); // Create User4

    // Create Poker Game object.
    const pokerGame = new PokerPresenter(users, gameDeck, io);

    // Test for one user to be set as the winner early on and beat users checked after.
    users['1111'].highestHand = ['Pair', 'K', '5'];
    users['2222'].highestHand = ['Flush', undefined, 'Q'];
    users['3333'].highestHand = ['Pair', 'A', 'A'];
    users['4444'].highestHand = ['Flush', undefined, '3'];

    winners = pokerGame.decideWinner();

    expect(winners).toStrictEqual(['2222']);

    // Test for winners to have same highest hand.
    users['1111'].highestHand = ['Pair', 'K', '5'];
    users['2222'].highestHand = ['Flush', undefined, '8'];
    users['3333'].highestHand = ['Flush', undefined, '10'];
    users['4444'].highestHand = ['Flush', undefined, '10'];

    winners = pokerGame.decideWinner();

    expect(winners).toStrictEqual(['3333', '4444']);

    // Test for last user to be decided as the winner.
    users['1111'].highestHand = ['Pair', 'K', '5'];
    users['2222'].highestHand = ['Two Pair', '8', '6'];
    users['3333'].highestHand = ['Flush', undefined, '10'];
    users['4444'].highestHand = ['Flush', undefined, 'J'];

    winners = pokerGame.decideWinner();

    expect(winners).toStrictEqual(['4444']);

    // Test for comparing the second value of a pair 
    // and for comparing the high card and beating the previous.
    users['1111'].highestHand = ['Pair', '6', '3'];
    users['2222'].highestHand = ['Pair', '8', '4'];
    users['3333'].highestHand = ['Pair', 'K', '5'];
    users['4444'].highestHand = ['Pair', 'K', '6'];

    winners = pokerGame.decideWinner();

    expect(winners).toStrictEqual(['4444']);

    // Test for comparing the second value of a pair 
    // and for comparing the high card and beating the previous.
    users['1111'].highestHand = ['Pair', '6', '4'];
    users['2222'].highestHand = ['Pair', '6', '4'];
    users['3333'].highestHand = ['Three of a Kind', 'K', undefined];
    users['4444'].highestHand = ['Three of a Kind', 'K', undefined];
    users['5555'].highestHand = ['Royal Flush', undefined, undefined];
    users['6666'].highestHand = ['Royal Flush', undefined, undefined];

    winners = pokerGame.decideWinner();

    expect(winners).toStrictEqual(['5555', '6666']);

    users['1111'].currStatus = 'F';
    users['2222'].currStatus = 'F';
    users['3333'].currStatus = 'F';
    users['4444'].currStatus = 'F';
    users['5555'].currStatus = 'F';
    users['6666'].currStatus = 'R';

    // Test for one user to be set as the winner early on and beat users checked after.
    users['1111'].highestHand = ['Royal Flush', undefined, undefined];
    users['2222'].highestHand = ['Royal Flush', undefined, undefined];
    users['3333'].highestHand = ['Royal Flush', undefined, undefined];
    users['4444'].highestHand = ['Royal Flush', undefined, undefined];
    users['5555'].highestHand = ['Royal Flush', undefined, undefined];
    users['6666'].highestHand = ['High Card', 'A', 'J'];

    winners = pokerGame.decideWinner();

    expect(winners).toStrictEqual(['6666']);
});

test('Check that status of ready players can be reset.', () => {
    const gameDeck = new Deck();
    var users = {};
    users['1111'] = new User('1111', 'User1', 1); // Create User1
    users['2222'] = new User('2222', 'User2', 1); // Create User2
    users['3333'] = new User('3333', 'User3', 1); // Create User3
    users['4444'] = new User('4444', 'User4', 1); // Create User4

    // Set status of all players as ready besides one that has folded
    users['1111'].currStatus = 'R';
    users['2222'].currStatus = 'F';
    users['3333'].currStatus = 'R';
    users['4444'].currStatus = 'R';

    // Create Poker Game object.
    const pokerGame = new PokerPresenter(users, gameDeck, io);

    pokerGame.resetStatusNotfolded();

    expect(users['1111'].currStatus).toBe('NR');
    expect(users['2222'].currStatus).toBe('F');
    expect(users['3333'].currStatus).toBe('NR');
    expect(users['4444'].currStatus).toBe('NR');
});

test('Check that a user and the game is updated after their turn.', () => {
    const gameDeck = new Deck();
    var users = {};
    users['1111'] = new User('1111', 'User1', 1); // Create User1

    // Create Poker Game object.
    const pokerGame = new PokerPresenter(users, gameDeck, 0, io);

    // Test for user betting
    users['1111'].chipCount = 1000;
    pokerGame.currSocket = '1111';
    users['1111'].currUserBet = 0;

    pokerGame.updateUser(['secondChoice', 20]);

    expect(pokerGame.pot).toBe(20);
    expect(users['1111'].chipCount).toBe(980);

    // Test for user raising
    users['1111'].chipCount = 1000

    pokerGame.currSocket = '1111';
    pokerGame.pot = 20;
    users['1111'].currUserBet = 20;

    pokerGame.updateUser(['secondChoice', 30]);

    expect(pokerGame.pot).toBe(30);
    expect(users['1111'].chipCount).toBe(990);

    // Test for user calling
    users['1111'].chipCount = 1000

    pokerGame.currSocket = '1111';
    pokerGame.pot = 0;
    users['1111'].currUserBet = 0;

    pokerGame.updateUser(['firstChoice', 20]);

    expect(pokerGame.pot).toBe(20);
    expect(users['1111'].chipCount).toBe(980);

    // Test for user calling after betting before
    users['1111'].chipCount = 1000

    pokerGame.currSocket = '1111';
    pokerGame.pot = 20;
    users['1111'].currUserBet = 20;

    pokerGame.updateUser(['firstChoice', 30]);

    expect(pokerGame.pot).toBe(30);
    expect(users['1111'].chipCount).toBe(990);

    // Test for user checking
    users['1111'].chipCount = 1000

    pokerGame.currSocket = '1111';
    pokerGame.pot = 0;
    users['1111'].currUserBet = 0;

    pokerGame.updateUser(['firstChoice', 0]);

    expect(pokerGame.pot).toBe(0);
    expect(users['1111'].chipCount).toBe(1000);

    // Test for user folding
    users['1111'].chipCount = 1000

    pokerGame.currSocket = '1111';

    pokerGame.updateUser(['foldChoice', 0]);

    expect(users['1111'].currStatus).toBe('F');
});