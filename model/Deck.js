const Card = require('./Card.js');

/**
 * Creates a deck consisting of multiple cards.
 */
class Deck {
    /**
     * Constructs a deck containing multiple Card objects.
     * Each card will be a combination of a suit and a value with no duplicates.
     */
    constructor() {
        this.deckOfCards = [];
        const suit = ['hearts', 'diamonds', 'clubs', 'spades'];
        const value = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        for (var i = 0; i < suit.length; i++) {
            for (var j = 0; j < value.length; j++) {
                this.deckOfCards.push(new Card(suit[i], value[j]));
            }
        }
    }
    /**
     * Will shuffle entirety of deck.
     * Goes to each position and trades spots with a card in a randomly selected position.
     * @return {object[]} deckOfCards - Shuffled deck.
     */
    shuffleDeck() {
        var randNum, temp;
        const lengthOfDeck = this.deckOfCards.length;
        for (var i = 0; i < lengthOfDeck; i++) {
            randNum = Math.floor(Math.random() * lengthOfDeck);
            temp = this.deckOfCards[randNum];
            this.deckOfCards[randNum] = this.deckOfCards[i];
            this.deckOfCards[i] = temp;
        }
        return this.deckOfCards;
    }
    /**
     * Will return card at the beginning of deck.
     * @return {object} Card - Card being returned.
     */
    dealCard() {
        return this.deckOfCards.shift();
    }
}
module.exports = Deck;