const Deck = require('../model/Deck.js');

/**
 * This will test the Deck.js class.
 */
test('Check that a deck can deal a card.', () => {
    // Create Deck object for User to use.
    const deck = new Deck();

    // Deal a card to the User's hand (will be unshuffled).
    expect(deck.dealCard().getCard()).toBe('2 hearts');
})
test('Check that a deck can be shuffled.', () => {
    // Create two Deck objects.
    const deck = new Deck();
    const deck2 = new Deck();
    // Shuffle second deck.
    deck2.shuffleDeck();
    // Check that the two decks are different.
    expect(deck).not.toBe(deck2);
})