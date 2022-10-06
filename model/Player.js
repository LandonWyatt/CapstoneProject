/**
 * Creates a Player object.
 */
class Player{
    /**
     * Constructs player with an individual hand.
     */
    constructor() {
        this.playerHand = []; // Player's Hand
    }
    /**
     * Adds a card to Player's hand.
     * @param {object} card - Card that will be added to Player's hand.
     */
    add(card) {
        this.playerHand.push(card);
    }
    /**
     * Empties Player's hand.
     */
    emptyHand() {
        this.playerHand = [];
    }
}
module.exports = Player;