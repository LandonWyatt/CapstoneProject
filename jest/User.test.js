const Deck = require('../model/Deck.js');
const User = require('../presenter/User.js');

/**
 * This will test the Card.js, Deck.js, and Player.js classes through the use of the User.js class.
 */
test('Check that a User can be created.', () => {
    // Create Deck object for User to use.
    const gameDeck = new Deck();
    // Create User object (with deck, socketID, and name).
    const user = new User('1234','User1',1);
    // Check that each value is saved for the user.
    expect(user.socket).toBe('1234');
    expect(user.name).toBe('User1');
})

test('Check that a User can be dealt cards from a deck.', () => {
    // Create Deck object for User to use.
    const gameDeck = new Deck();
    // Create User object (with deck, socketID, and name).
    const user = new User(gameDeck, '1234', 'User1');

    // Deal a card to the User's hand (will be unshuffled).
    user.add(gameDeck.dealCard());

    // Check that the first card of the deck is given to user.
    expect(user.playerHand[0].getCard()).toBe('2 hearts');
})

test('Check that the hand of the User can be emptied.', () => {
    // Create User object.
    const gameDeck = new Deck();
    const user = new User(gameDeck, '1234', 'User1');

    // Deal two cards to the User's hand.
    user.add(gameDeck.dealCard());
    user.add(gameDeck.dealCard());

    // Check that their are two cards in the User's hand.
    expect(user.playerHand.length).toBe(2);

    // Empty User's hand.
    user.emptyHand();

    // Check that the User's hand is empty.
    expect(user.playerHand.length).toBe(0);
})

test('Check that Card holds suit and value.', () => {
    // Create User object.
    const gameDeck = new Deck();
    const user = new User(gameDeck, '1234', 'User1');

    // Deal a card to the User's hand.
    user.add(gameDeck.dealCard());

    // Check that the Card can return the suit and value
    expect(user.playerHand[0].getCard()).toBe('2 hearts');
    expect(user.playerHand[0].getSuit()).toBe('hearts');
    expect(user.playerHand[0].getValue()).toBe('2');
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