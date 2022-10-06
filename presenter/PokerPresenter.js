const Card = require('../model/Card.js');
/**
 * Stands as a presenter for a single poker game.
 * When called, the game will continue until it's completion.
 */
class PokerPresenter {
    /**
     * Constructs poker game containing users playing, deck being used, and io connection.
     * @param {object[]} users - List of users that are participating in a game. Only contains users in current game.
     * @param {object[]} deck - Deck being used for this game.
     * @param {number} leftOfDealer - This number will keep track of who will post the small blind and so on.
     * @param {object} io - io connection to allowing connecting to the client.
     */
    constructor(users, deck, leftOfDealer, io) {
        this.users = users;
        this.deck = deck;
        this.currLeftOfDealer = leftOfDealer;
        this.io = io;
        this.gameState = 0; // Holds the current gamestate, incremented each round.
        this.communityCards = []; // List of cards in Community Hand.
        this.stringCommunityCards = []; // String version to send to Client.
        this.currUser = 0; // The currently called on position in the 'users' array.
        this.currSocket = 1; // Current socket of the user being called on.
        this.readyUsers = 0; // Number of ready users in current phase.
        this.foldedUsers = 0; // Number of folded users in current game.
        this.currBet = 0; // Current highest bet in a round.
        this.pot = 0; // Amount held in pot.
        this.lastUser = false; // Will be set to true when their is only a single player left.
        this.smallBlind = 10; // Value set as the small blind for this game.
    }

    /**
     * Begins game by checking gamestate and starting game.
     */
    startGame() {
        console.log("Game Started.");
        this.performGamestate();
    }

    /**
     * Calls to check who will be next and sets the next user's turn.
     */
    nextTurn() {
        // Check if there is only one player left who has not folded or left game
        if (this.foldedUsers === Object.keys(this.users).length - 1) {
            this.lastUser = true;
        }
        if (this.lastUser) {
            this.gameState = 4;
            this.performGamestate();
        }
        // If not all users are ready (have betted properly or folded), continue taking turns.
        else if (this.readyUsers < Object.keys(this.users).length) {
            if (this.currUser !== Object.keys(this.users).length - 1) {
                this.currUser++;
                this.takeTurn();
            }
            else {
                this.currUser = 0;
                this.takeTurn();
            }
        }
        // Else, move on
        else {
            // Go to the next available user
            // Check if the current user is the last player and if so reset current user count
            if (this.users[Object.keys(this.users)[this.currUser + 1]] === undefined) {
                this.currUser = 0;
            }
            // Otherwise, go to next user
            else {
                this.currUser++;
            }
            // Continue on until there is a player found that has not folded
            while (this.users[Object.keys(this.users)[this.currUser]].currStatus === 'F') {
                if (this.currUser !== Object.keys(this.users).length - 1) {
                    this.currUser++;
                }
                else {
                    this.currUser = 0;
                }
            }
            // Go to next gamestate
            this.gameState++;
            this.performGamestate();
        }
    }

    /**
     * Have player take their turn.
     * Sets current user's turn and sends a message to them stating it is their turn.
     */
    takeTurn() {
        // Check if there is only one player left who has not folded or left game
        if (this.foldedUsers === Object.keys(this.users).length - 1) {
            this.lastUser = true;
        }
        this.currSocket = Object.keys(this.users)[this.currUser];
        if (this.lastUser === false) {
            // If the player is not ready, let them take their turn
            if (this.users[this.currSocket].currStatus === 'NR') {
                this.io.to(this.currSocket).emit('yourTurn', [this.currBet, this.users[this.currSocket].currUserBet]);
            }
            else {
                this.nextTurn();
            }
        }
        else {
            this.gameState = 4;
            this.performGamestate();
        }
    }

    /**
     * Update User and game based on the User's choice
     * during their turn.
     * Will also set status of user.
     * @param {any[]} information - Contains information about player choice (Contains choice {string} and amount bet {number})
     */
    updateUser(information) {
        /*
         * Take the bet gained from client and update current bet.
         * Contains:
         * - Previous current bet plus raised amount OR
         * - new bet made by player
         */
        this.currBet = information[1];
        // If there was a bet/raise placed
        if (information[0] === 'secondChoice' && information[1] > 0) {
            // Set User's bet as the amount they had bet or raised bet to
            if (this.users[this.currSocket].currUserBet === 0) {
                // subtract from user's chip count
                this.users[this.currSocket].chipCount -= information[1];
                // add to pot
                this.pot += information[1];
                // send the current user's chip count to their client
                this.io.to(this.currSocket).emit('chipCount', this.users[this.currSocket].chipCount);
            }
            else {
                // subtract from user's chip count
                this.users[this.currSocket].chipCount -= information[1] - this.users[this.currSocket].currUserBet;
                // add to pot
                this.pot += information[1] - this.users[this.currSocket].currUserBet;
                // send the current user's chip count to their client
                this.io.to(this.currSocket).emit('chipCount', this.users[this.currSocket].chipCount);
            }
            this.users[this.currSocket].currUserBet = information[1];
            // Since this player had raised or bet, each player who was ready, is now not ready
            for (var i = 0; i < Object.keys(this.users).length; i++) {
                const tempSocket = Object.keys(this.users)[i];
                // If this player is ready, set them as not ready
                if (this.users[tempSocket].currStatus === 'R') {
                    this.users[tempSocket].currStatus = 'NR';
                    this.readyUsers--;
                }
            }
            // Set this player as ready
            this.users[this.currSocket].currStatus = 'R';
            this.readyUsers++;
        }
        // If player chooses first choice (check or call), subtract amount from chip count and continue
        else if (information[0] === 'firstChoice') {
            // add to pot when the user is calling
            if (this.users[this.currSocket].currUserBet === 0) {
                // subtract from user's chip count
                this.users[this.currSocket].chipCount -= information[1];
                // add to pot
                this.pot += information[1]
                // send the current user's chip count to their client
                this.io.to(this.currSocket).emit('chipCount', this.users[this.currSocket].chipCount);
            }
            // add to pot when the user is calling and if they had bet prior
            else if (information[1] > 0) {
                // subtract from user's chip count
                this.users[this.currSocket].chipCount -= information[1] - this.users[this.currSocket].currUserBet;
                // add to pot
                this.pot += information[1] - this.users[this.currSocket].currUserBet;
                // send the current user's chip count to their client
                this.io.to(this.currSocket).emit('chipCount', this.users[this.currSocket].chipCount);
            }
            // Else, the user is checking (no change to pot or chip count)
            else {
                // send the current user's chip count to their client
                this.io.to(this.currSocket).emit('chipCount', this.users[this.currSocket].chipCount);
            }
            this.users[this.currSocket].currUserBet = information[1];
            this.users[this.currSocket].currStatus = 'R';
            this.readyUsers++;
        }
        // If player folds, set their current status as folded
        else if (information[0] === 'foldChoice') {
            this.users[this.currSocket].currStatus = 'F';
            this.readyUsers++;
            this.foldedUsers++;
        }
        // Send new pot and current bet to all clients
        this.io.emit('potCurrBet', [this.pot, this.currBet]);
    }

    /**
     * Perform the current gamestate. (Pre-Flop, Flop, Turn, River, or end game)
     */
    performGamestate() {
        console.log('\nperformGamestate Called');
        // Pre-Flop
        if (this.gameState === 0) {
            console.log('Begin Pre-Flop');
            console.log("currLeftOfDealer: " + this.currLeftOfDealer);
            console.log("Name: " + this.users[Object.keys(this.users)[this.currLeftOfDealer]].name);
            // Post small blind with player who is 'left of dealer' and set their bet
            this.users[Object.keys(this.users)[this.currLeftOfDealer]].chipCount -= this.smallBlind;
            this.users[Object.keys(this.users)[this.currLeftOfDealer]].currUserBet = this.smallBlind;
            this.io.to(Object.keys(this.users)[this.currLeftOfDealer]).emit('chipCount', this.users[Object.keys(this.users)[this.currLeftOfDealer]].chipCount);

            // Post big blind with next player (twice that of the small blind) and set their bet
            if (this.currLeftOfDealer + 1 === Object.keys(this.users).length) {
                this.users[Object.keys(this.users)[0]].chipCount -= this.smallBlind * 2;
                this.users[Object.keys(this.users)[0]].currUserBet = this.smallBlind * 2;
                this.io.to(Object.keys(this.users)[0]).emit('chipCount', this.users[Object.keys(this.users)[0]].chipCount);
            }
            else {
                this.users[Object.keys(this.users)[this.currLeftOfDealer + 1]].chipCount -= this.smallBlind * 2;
                this.users[Object.keys(this.users)[this.currLeftOfDealer + 1]].currUserBet = this.smallBlind * 2;
                this.io.to(Object.keys(this.users)[this.currLeftOfDealer + 1]).emit('chipCount', this.users[Object.keys(this.users)[this.currLeftOfDealer + 1]].chipCount);
            }

            // Set the next player after the player who placed the big blind
            // If the location of the player who placed the big blind is at the beginning of the list, set the current user as 1
            if (this.currLeftOfDealer + 1 === Object.keys(this.users).length) {
                this.currUser = 1;
            }
            // Else if the location after the player who placed the big blind is at the beginning of the list, set accordingly
            else if (this.currLeftOfDealer + 2 === Object.keys(this.users).length) {
                this.currUser = 0;
            }
            // Else, set the current user as two places after the player who placed the small blind
            else {
                this.currUser = this.currLeftOfDealer + 2;
            }

            // Update game status accordingly and send this to client
            // Add to the pot: small blind and big blind (2 * small blind) that was posted by players
            // Send an empty list of community cards for a user who is playing another game
            this.pot = this.smallBlind * 3;
            this.currBet = this.smallBlind * 2;
            this.io.emit('potCurrBet', [this.pot, this.currBet]);
            this.io.emit('communityCards', this.stringCommunityCards);

            // Shuffle deck
            this.deck.shuffleDeck();

            // Deal hands to players
            this.dealHand();

            // Check the highest hand of each player.
            this.sendHighestHand();

            // Begin turns
            this.takeTurn();
        }
        // Flop
        else if (this.gameState === 1) {
            console.log('Begin Flop')

            // Reset previous round's bet
            this.currBet = this.smallBlind * 2;

            // Deal three cards to community
            this.communityCards.push(this.deck.dealCard());
            this.communityCards.push(this.deck.dealCard());
            this.communityCards.push(this.deck.dealCard());
            // Store string versions of community cards to send to client
            for (var i = 0; i < this.communityCards.length; i++) {
                this.stringCommunityCards.push(this.communityCards[i].getCardPicture());
            }
            console.log("Cards in Deck left: ", Object.keys(this.deck.deckOfCards).length);
            this.io.emit('communityCards', this.stringCommunityCards);

            // Check the highest hand of each player.
            this.sendHighestHand();
            // update pot and current Bet
            this.io.emit('potCurrBet', [this.pot, this.currBet]);

            // Reset status of not folded players
            this.resetStatusNotfolded();

            // Begin turns
            this.takeTurn();
        }
        // Turn
        else if (this.gameState === 2) {
            console.log('Begin Turn');

            // Reset previous round's bet
            this.currBet = this.smallBlind * 2;

            // Deal one card to community
            this.communityCards.push(this.deck.dealCard());
            // Store string versions of community cards to send to client
            this.stringCommunityCards.push(this.communityCards[3].getCardPicture());
            console.log("Cards in Deck left: ", Object.keys(this.deck.deckOfCards).length);
            this.io.emit('communityCards', this.stringCommunityCards);

            // Check the highest hand of each player.
            this.sendHighestHand();
            // update pot and current Bet
            this.io.emit('potCurrBet', [this.pot, this.currBet]);

            // Reset status of not folded players
            this.resetStatusNotfolded();

            // Begin turns
            this.takeTurn();
        }
        // River
        else if (this.gameState === 3) {
            console.log('Begin River')

            // Reset previous round's bet
            this.currBet = this.smallBlind * 2;

            // Deal one card to community
            this.communityCards.push(this.deck.dealCard());
            // Store string versions of community cards to send to client
            this.stringCommunityCards.push(this.communityCards[4].getCardPicture());
            console.log("Cards in Deck left: ", Object.keys(this.deck.deckOfCards).length);
            this.io.emit('communityCards', this.stringCommunityCards);

            // Check the highest hand of each player.
            this.sendHighestHand();
            // update pot and current Bet
            this.io.emit('potCurrBet', [this.pot, this.currBet]);

            // Reset status of not folded players
            this.resetStatusNotfolded();

            // Begin turns
            this.takeTurn();
        }
        else {
            // Obtain list that contains winner(s)
            var winners = this.decideWinner();
            var winnings;
            // For a single winner.
            if (winners.length === 1) {
                this.users[winners[0]].chipCount += this.pot;
                winnings = this.pot;
                this.io.to(winners[0]).emit('chipCount', this.users[winners[0]].chipCount);
                this.pot = 0;
                // Update pot and current bet
                this.io.emit('potCurrBet', [this.pot, this.currBet]);
                // Set winner as the winner's name rather than the socket.id
                winners[0] = this.users[winners[0]].name;
            }
            // In case of a tie.
            else {
                console.log("Tie");
                // Split chips for all who tied
                var splitChipCount = this.pot / winners.length;
                winnings = splitChipCount;
                // Send to each winner.
                for (var i = 0; i < winners.length; i++) {
                    this.users[winners[i]].chipCount += splitChipCount;
                    this.io.to(winners[i]).emit('chipCount', this.users[winners[i]].chipCount);
                    this.pot = 0;
                    // Update pot and current bet
                    this.io.emit('potCurrBet', [this.pot, this.currBet]);
                    // Set winner as the winner's name rather than the socket.id
                    winners[i] = this.users[winners[i]].name;
                }
            }
            console.log(winners);
            console.log('Game Over.');
            // Emit to players game is over
            this.io.to('inGame').emit('gameOverClient', [winners, winnings]);
        }
    }

    /**
     * Reset readiness for all not folded players
     */
    resetStatusNotfolded() {
        for (var i = 0; i < Object.keys(this.users).length; i++) {
            // If this player is ready, set them as not ready
            if (this.users[Object.keys(this.users)[i]].currStatus === 'R') {
                this.users[Object.keys(this.users)[i]].currUserBet = 0;
                this.users[Object.keys(this.users)[i]].currStatus = 'NR';
                this.readyUsers--;
            }
        }
    }

    /**
     * Deal hands to all players.
     */
    dealHand() {
        // Deal hands
        for (var i = 0; i < Object.keys(this.users).length; i++) {
            // find current user's socket
            const currSocket = Object.keys(this.users)[i];
            // find player's hand
            var hand = []; // initialize hand
            this.users[currSocket].emptyHand(); // reset User's hand
                // deal two cards to hand
                this.users[currSocket].playerHand.push(this.deck.dealCard());
                this.users[currSocket].playerHand.push(this.deck.dealCard());
                // for each card in hand, place in hand array
                for (var j = 0; j < this.users[currSocket].playerHand.length; j++) {
                    hand.push((this.users[currSocket].playerHand[j]).getCardPicture());
                }
            //}
            // TEMPORARY: check that cards are leaving Deck
            console.log("Cards in Deck left: ", Object.keys(this.deck.deckOfCards).length);
            // emit hand to specific user's client
            this.io.to(currSocket).emit('userCards', hand);
        }
    }
    /**
     * Check the highest hand of a given player.
     * Will create a temporary hand that will hold all community cards
     * currently shown and all cards in User's hand to find highest hand.
     * @param {string} socketID - ID that is original for each user.
     * @return {string[]} highestHand - highest hand found on the user provided.
     */
    checkHighestHand(socketID) {
        var tempHand = [];

        // Place User's cards in temporary hand.
        for (var i = 0; i < this.users[socketID].playerHand.length; i++) {
            tempHand.push(this.users[socketID].playerHand[i]);
        }
        // Place all community cards shown into temporary hand.
        for (i = 0; i < this.communityCards.length; i++) {
            tempHand.push(this.communityCards[i]);
        }

        const cardValues = ['2','3','4','5','6','7','8','9','10','J', 'Q', 'K', 'A'];
        var tempCard;

        // Sort cards
        for (i = 0; i < tempHand.length; i++) {
            for (var j = i + 1; j < tempHand.length; j++) {
                if (cardValues.indexOf(tempHand[i].getValue()) > cardValues.indexOf(tempHand[j].getValue())) {
                    tempCard = tempHand[j];
                    tempHand[j] = tempHand[i];
                    tempHand[i] = tempCard;
                }
            }
        }

        // initialize array to hold highest hand
        var highestHand = [];
        // Find high card
        var highCard = tempHand[tempHand.length - 1].getValue();

        /*
         * Royal Flush (A,K,Q,J,10 of all the same suit)
         */
        if(tempHand.length >= 5){
            if (this.checkForCard(tempHand, 'A hearts') && this.checkForCard(tempHand, 'K hearts') &&
                this.checkForCard(tempHand, 'Q hearts') && this.checkForCard(tempHand, 'J hearts') &&
                this.checkForCard(tempHand, '10 hearts')) {
                highestHand[0] = 'Royal Flush';
                highestHand[1] = undefined;
                highestHand[2] = undefined;
            }
            else if (this.checkForCard(tempHand, 'A diamonds') && this.checkForCard(tempHand, 'K diamonds') &&
                this.checkForCard(tempHand, 'Q diamonds') && this.checkForCard(tempHand, 'J diamonds') &&
                this.checkForCard(tempHand, '10 diamonds')) {
                highestHand[0] = 'Royal Flush';
                highestHand[1] = undefined;
                highestHand[2] = undefined;
            }
            else if (this.checkForCard(tempHand, 'A clubs') && this.checkForCard(tempHand, 'K clubs') &&
                this.checkForCard(tempHand, 'Q clubs') && this.checkForCard(tempHand, 'J clubs') &&
                this.checkForCard(tempHand, '10 clubs')) {
                highestHand[0] = 'Royal Flush';
                highestHand[1] = undefined;
                highestHand[2] = undefined;
            }
            else if (this.checkForCard(tempHand, 'A spades') && this.checkForCard(tempHand, 'K spades') &&
                this.checkForCard(tempHand, 'Q spades') && this.checkForCard(tempHand, 'J spades') &&
                this.checkForCard(tempHand, '10 spades')) {
                highestHand[0] = 'Royal Flush';
                highestHand[1] = undefined;
                highestHand[2] = undefined;
            }
        }
        if (highestHand.length !== 0) {
            return highestHand;
        }
        
        /*
         * Straight Flush (Five cards in a sequence, same suit)
         */
        if (tempHand.length >= 5) {
            for (i = 0; i < tempHand.length; i++) {
                var currentRun = [];
                currentRun.push(tempHand[i]);
                for (j = i + 1; j < tempHand.length; j++) {
                    if ((cardValues.indexOf(tempHand[j].getValue()) === cardValues.indexOf(currentRun[currentRun.length - 1].getValue()) + 1) && 
                        (tempHand[j].getSuit() === currentRun[currentRun.length - 1].getSuit())) {
                        currentRun.push(tempHand[j]);
                    }
                    else if (tempHand[j].getValue() === currentRun[currentRun.length - 1].getValue()) {
                    }
                    else {
                        i = j - 1;
                        break;
                    }
                }
                if (currentRun.length >= 5) {
                    highestHand[0] = 'Straight Flush';
                    highestHand[1] = currentRun[currentRun.length - 1].getValue();
                    highestHand[2] = undefined;
                    break;
                }
            }
        }
        if (highestHand.length !== 0) {
            return highestHand;
        }
        
        /*
         * Four of a Kind (Four of the same value)
         */
        if (tempHand.length >= 4) {
            for (i = tempHand.length-1; i >= 0; i--) {
                var currentRun = [];
                currentRun.push(tempHand[i]);
                for (j = i - 1; j >= 0; j--) {
                    if (tempHand[j].getValue() === currentRun[currentRun.length - 1].getValue()) {
                        currentRun.push(tempHand[j]);
                    }
                    else {
                        i = j + 1;
                        break;
                    }
                }
                if (currentRun.length === 4) {
                    highestHand[0] = 'Four of a Kind';
                    highestHand[1] = currentRun[0].getValue();
                    // Save high card in case of a tie
                    highestHand[2] = highCard;
                    break;
                }
            }
        }
        if (highestHand.length !== 0) {
            return highestHand;
        }
        
        /*
         * Full House (Pair and a three of a kind)
         */
        if (tempHand.length >= 5) {
            var pair = false, trio = false;
            for (i = 0; i < tempHand.length; i++) {
                var currentRun = [];
                currentRun.push(tempHand[i]);
                for (j = i + 1; j < tempHand.length; j++) {
                    if (tempHand[j].getValue() === currentRun[currentRun.length - 1].getValue()) {
                        currentRun.push(tempHand[j]);
                    }
                    else {
                        i = j - 1;
                        break;
                    }
                }
                if (currentRun.length === 3 && trio === false) {
                    var trioValue = currentRun[currentRun.length - 1].getValue();
                    trio = true;
                }
                else if (currentRun.length >= 2 && pair === false && currentRun[currentRun.length - 1].getValue() !== trioValue) {
                    var pairValue = currentRun[currentRun.length - 1].getValue();
                    pair = true;
                }
            }
            if (pair && trio) {
                highestHand[0] = 'Full House';
                highestHand[1] = trioValue;
                // Save high card in case of a second tie
                highestHand[2] = pairValue;
            }
        }
        if (highestHand.length !== 0) {
            return highestHand;
        }
 
        /*
         * Flush (Five cards of the same suit)
         */
        var suit = ['hearts', 'diamonds', 'clubs', 'spades'];
        if (tempHand.length >= 5) {
            for (i = 0; i < suit.length; i++) {
                var currentRun = [];
                for (j = 0; j < tempHand.length; j++) {
                    if (tempHand[j].getSuit() === suit[i]) {
                        currentRun.push(tempHand[j]);
                    }
                    if (currentRun.length >= 5) {
                        highestHand[0] = 'Flush';
                        highestHand[1] = currentRun[currentRun.length - 1].getValue();
                        // Save high card of run in case of a tie
                        highestHand[2] = undefined;
                        break;
                    }
                }
            }
        }
        if (highestHand.length !== 0) {
            return highestHand;
        }
        
        /*
         * Straight (Five cards in a sequence)
         */
        if (tempHand.length >= 5) {
            for (i = 0; i < tempHand.length; i++) {
                var currentRun = [];
                currentRun.push(tempHand[i]);
                for (j = i + 1; j < tempHand.length; j++) {
                    if (cardValues.indexOf(tempHand[j].getValue()) === cardValues.indexOf(currentRun[currentRun.length - 1].getValue()) + 1) {
                        currentRun.push(tempHand[j]);
                    }
                    else if (tempHand[j].getValue() === currentRun[currentRun.length - 1].getValue()) {
                    }
                    else {
                        i = j - 1;
                        break;
                    }
                }
                if (currentRun.length >= 5) {
                    highestHand[0] = 'Straight';
                    highestHand[1] = currentRun[currentRun.length - 1].getValue();
                    highestHand[2] = undefined;
                    break;
                }
            }
        }
        if (highestHand.length !== 0) {
            return highestHand;
        }
        
        /*
         * Three of a kind (Three of the same value)
         */
        if (tempHand.length >= 3) {
            for (i = tempHand.length - 1; i >= 0; i--) {
                var currentRun = [];
                currentRun.push(tempHand[i]);
                for (j = i - 1; j >= 0; j--) {
                    if (tempHand[j].getValue() === currentRun[currentRun.length - 1].getValue()) {
                        currentRun.push(tempHand[j]);
                    }
                    else {
                        i = j + 1;
                        break;
                    }
                }
                if (currentRun.length === 3) {
                    highestHand[0] = 'Three of a Kind';
                    highestHand[1] = currentRun[0].getValue();
                    highestHand[2] = highCard;
                    break;
                }
            }
        }
        if (highestHand.length !== 0) {
            return highestHand;
        }
        
        /*
         * Two Pair (Two different pairs of the same value)
         */
        if (tempHand.length >= 4) {
            var pair = 0;
            var firstPair = false;
            var firstPairValue = undefined, secondPairValue;
            for (i = tempHand.length - 1; i >= 0; i--) {
                var currentRun = [];
                currentRun.push(tempHand[i]);
                for (j = i - 1; j >= 0; j--) {
                    if (tempHand[j].getValue() === currentRun[currentRun.length - 1].getValue()) {
                        currentRun.push(tempHand[j]);
                    }
                    else {
                        i = j + 1;
                        break;
                    }
                    if (currentRun.length === 2) {
                        if (firstPairValue === undefined && firstPair === false) {
                            firstPairValue = currentRun[currentRun.length - 1].getValue();
                            firstPair = true;
                        }
                        else {
                            secondPairValue = currentRun[currentRun.length - 1].getValue();
                        }
                        pair++;
                    }
                }
                if (pair === 2) {
                    highestHand[0] = 'Two Pair';
                    highestHand[1] = firstPairValue;
                    highestHand[2] = secondPairValue;
                    break;
                }
            }
        }
        if (highestHand.length !== 0) {
            return highestHand;
        }
        
        /*
         * Pair (Two of the same value)
         */
        if (tempHand.length >= 2) {
            for (i = tempHand.length - 1; i >= 0; i--) {
                var currentRun = [];
                currentRun.push(tempHand[i]);
                for (j = i - 1; j >= 0; j--) {
                    if (tempHand[j].getValue() === currentRun[currentRun.length - 1].getValue()) {
                        currentRun.push(tempHand[j]);
                    }
                    else {
                        i = j + 1;
                        break;
                    }
                }
                if (currentRun.length === 2) {
                    highestHand[0] = 'Pair';
                    highestHand[1] = currentRun[0].getValue();
                    // Save high card in case of a tie
                    highestHand[2] = highCard;
                    break;
                }
            }
        }
        if (highestHand.length !== 0) {
            return highestHand;
        }
        
        /*
         * High Card (Highest Value in deck)
         */
        if (highestHand.length === 0) {
            highestHand[0] = 'High Card';
            highestHand[1] = highCard; // Highest card
            highestHand[2] = tempHand[tempHand.length - 2].getValue(); // Second highest card
        }

        return highestHand;
    }
    
    /**
     * Sends each user their current highest hand.
     */
    sendHighestHand() {
        var highestHandShown, highestHandString;
        for (var i = 0; i < Object.keys(this.users).length; i++) {
            // find current user's socket
            const currSocket = Object.keys(this.users)[i];

            // find current user's highest hand and send this to their client.
            highestHandShown = this.checkHighestHand(Object.keys(this.users)[i]);
            this.users[currSocket].highestHand = highestHandShown;
            // Royal Flush
            if (highestHandShown[0] === 'Royal Flush') {
                highestHandString = highestHandShown[0];
            }
            // Straight Flush, Straight, or Flush
            else if (highestHandShown[0] === 'Straight Flush' || highestHandShown[0] === 'Straight' || highestHandShown[0] === 'Flush') {
                highestHandString = highestHandShown[0] + ', ' + highestHandShown[1] + ' high';
            }
            // Four of a Kind
            else if (highestHandShown[0] === 'Four of a Kind') {
                highestHandString = 'Four ' + highestHandShown[1] + 's, ' + highestHandShown[2] + ' high';
            }
            // Full House
            else if (highestHandShown[0] === 'Full House') {
                highestHandString = 'Full House: 3 ' + highestHandShown[1] + 's & 2 ' + highestHandShown[2] + 's';
            }
            // Three of a Kind
            else if (highestHandShown[0] === 'Three of a Kind') {
                highestHandString = 'Three ' + highestHandShown[1] + 's, ' + highestHandShown[2] + ' high';
            }
            // Two Pair
            else if (highestHandShown[0] === 'Two Pair') {
                highestHandString = highestHandShown[0] + ': Two ' + highestHandShown[1] + 's & Two ' + highestHandShown[2] + 's';
            }
            // Pair
            else if (highestHandShown[0] === 'Pair') {
                highestHandString = 'Pair of ' + highestHandShown[1] + 's, ' + highestHandShown[2] + ' high';
            }
            // High Card
            else if (highestHandShown[0] === 'High Card') {
                highestHandString = highestHandShown[1] + ' high';
            }
            // Send highest hand message to client
            this.io.to(currSocket).emit('highestHand', highestHandString);
        }
    }

    /**
     * Decides which player is the winner based on highest hand.
     * @returns {string[]} winners - An array holding a single winner or a list of winners.
     */
    decideWinner() {
        const handRanks = ['High Card', 'Pair', 'Two Pair', 'Three of a Kind', 'Straight', 'Flush', 'Full House', 'Four of a Kind', 'Straight Flush', 'Royal Flush'];
        const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        var currUser = undefined, winners = [], currHighestHand, temp = 0;
        // Find first user in the list that has not folded, set them as current winner
        for (var i = 0; i < Object.keys(this.users).length; i++) {
            if (this.users[Object.keys(this.users)[i]].currStatus !== 'F') {
                winners[0] = Object.keys(this.users)[i]; // set current winner
                currHighestHand = this.users[Object.keys(this.users)[0]].highestHand; // set current highest hand
                break;
            }
            temp = i;
        }
        // If the current winner is the last player in the list, set them as the winner
        if (this.users[Object.keys(this.users)[temp + 1]] === undefined) {
            return winners;
        }
        // Start in the position after the current winner, and go through the rest of the players
        for (var j = temp + 1; j < Object.keys(this.users).length; j++) {
            currUser = Object.keys(this.users)[j]; // Set current user
            // Make sure the current user hasn't folded
            if (this.users[currUser].currStatus !== 'F') {
                // If current user has a higher hand rank, set them as the winner.
                if (handRanks.indexOf(currHighestHand[0]) < handRanks.indexOf(this.users[currUser].highestHand[0])) {
                    winners = [];
                    winners.push(currUser);
                    currHighestHand = this.users[currUser].highestHand;
                }
                // If the current user has the same hand rank as the current highest hand, continue to check other values.
                else if (handRanks.indexOf(currHighestHand[0]) === handRanks.indexOf(this.users[currUser].highestHand[0])) {
                    // If second value is undefined (Royal Flush, Straight Flush, or Flush).
                    if (currHighestHand[1] === undefined) {
                        // If the third value is undefined as well, add current user to list of winners
                        if (currHighestHand[2] === undefined) {
                            winners.push(currUser);
                        }
                        // If the currUser has the higher high card, set them as the winner.
                        else if (cardValues.indexOf(currHighestHand[2]) < cardValues.indexOf(this.users[currUser].highestHand[2])) {
                            winners = [];
                            winners.push(currUser);
                            currHighestHand = this.users[currUser].highestHand;
                        }
                        // Else if the current user and current highest hand have the same high card, push current user to the winner array.
                        else if (cardValues.indexOf(currHighestHand[2]) === cardValues.indexOf(this.users[currUser].highestHand[2])) {
                            winners.push(currUser);
                        }
                    }
                    // If the second value does not equal undefined (Anything that can having a higher card: (Straight, Pair, etc.)).
                    else {
                        // If the currUser has the higher card, set them as the winner.
                        if (cardValues.indexOf(currHighestHand[1]) < cardValues.indexOf(this.users[currUser].highestHand[1])) {
                            winners = [];
                            winners.push(currUser);
                            currHighestHand = this.users[currUser].highestHand;
                        }
                        // Else if the current user and current highest hand have the same high card.
                        else if (cardValues.indexOf(currHighestHand[1]) === cardValues.indexOf(this.users[currUser].highestHand[1])) {
                            // If the third value is undefined, the game counts this as a draw, push current user to winners
                            if (currHighestHand[2] === undefined) {
                                winners.push(currUser);
                            }
                            // if the current user has a higher high card, set them as the new winner.
                            else if (cardValues.indexOf(currHighestHand[2]) < cardValues.indexOf(this.users[currUser].highestHand[2])) {
                                winners = [];
                                winners.push(currUser);
                                currHighestHand = this.users[currUser].highestHand;
                            }
                            // else if the current user ties with current highest hand, push them to the winner array.
                            else if (cardValues.indexOf(currHighestHand[2]) === cardValues.indexOf(this.users[currUser].highestHand[2])) {
                                winners.push(currUser);
                            }
                        }
                    }
                }
            }
        }
        return winners;
    }

    /**
     * Checks if a given hand continues a specific card.
     * Checks by using the string version of the card to find.
     * @param {object[]} hand - Hand provided to check for card.
     * @param {string} card - Card to search for.
     * @returns {boolean} cardFound - Value that will state if the card sought after was found.
     */
    checkForCard(hand, card) {
        var cardFound = false;
        for (var i = 0; i < hand.length; i++) {
            if (hand[i].getCard() === card) {
                cardFound = true;
            }
        }
        return cardFound;
    }
}
module.exports = PokerPresenter;