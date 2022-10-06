const Player = require('../model/Player.js');

/**
 * Creates a User by extending Player object.
 * Allows for specifying who the user is and what actions are taken by the user.
 * @extends Player
 */
class User extends Player {
    /**
     * Constructs user with certain parameters that define who the player is.
     * @param {object} socket - Socket assigned to User.
     * @param {string} name - Name assigned to User.
     * @param {object} io - io connection to allowing connecting to the client.
     */
    constructor(socket, name, io) {
        super();
        this.socket = socket;
        this.name = name;
        this.io = io;
        this.currUserBet = 0; // Current User's bet.
        this.highestHand = []; // The array containing information about the User's highest hand.
        this.chipCount = 1000; // User's chip count.
        this.currStatus = 'NR'; // User's ready status.
    }
}
module.exports = User;