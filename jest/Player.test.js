const Player = require('../model/Player.js');
const Deck = require('../model/Deck.js');

/**
 * This will test the Deck.js class.
 */
test('Check that a Player can be given a card.', () => {
    // Create Player & Deck object.
    const deck = new Deck();
    const player = new Player(deck);

    //Deal a card to user's hand.
    player.add(deck.dealCard());

    // Deal a card to the User's hand (will be unshuffled).
    expect(player.playerHand[0].getCard()).toBe('2 hearts');
})
test('Check that the hand of the Player can be emptied.', () => {
    // Create Player & Deck object.
    const deck = new Deck();
    const player = new Player(deck);

    //Deal two cards to Player's hand.
    player.add(deck.dealCard());
    player.add(deck.dealCard());

    // Check that their are two cards in the Player's hand.
    expect(player.playerHand.length).toBe(2);

    // Empty Player's hand.
    player.emptyHand();

    // Check that the Player's hand is empty.
    expect(player.playerHand.length).toBe(0);
})