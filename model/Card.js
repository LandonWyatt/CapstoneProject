/**
 * Creates a single card.
 */
class Card {
    /**
     * Constructs card with suit and value.
     * @param {string} suit - The Card's suit.
     * @param {string} value - The Card's value.
     */
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }
    /**
     * Returns the value and the suit of the card.
     * @return {string} Value & Suit - A string containing a card's value and suit separated by a space. 
     */
    getCard() {
        return this.value + ' ' + this.suit;
    }
    /**
     * Returns the value of the card.
     * @return {string} Value - A string containing a card's value.
     */
    getValue() {
        return this.value;
    }
    /**
     * Returns the suit of the card
     * @return {string} Suit - A string containing a card's suit.
     */
    getSuit() {
        return this.suit;
    }
    /**
     * Returns link to picture of card
     * @return {string} cardLink - file path to a picture of the specific card.
     */
    getCardPicture() {
        return "/images/cards/" + this.getValue() + (this.getSuit()).charAt(0) + ".png";
    }
}
module.exports = Card;