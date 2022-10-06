const Card = require('../model/Card.js');

/**
 * This will test the Card.js class.
 */
test('Check that Card holds suit and value.', () => {
    // Create Card object.
    var card = new Card('hearts', '2');

    // Check that the Card can return the suit and value
    expect(card.getCard()).toBe('2 hearts');
    expect(card.getSuit()).toBe('hearts');
    expect(card.getValue()).toBe('2');
})
test('Check that the link to the card image is returned properly.', () => {
    // Create Card object.
    var card = new Card('hearts', '2');

    // Check that the Card can return the suit and value
    expect(card.getCardPicture()).toBe("/images/cards/2h.png");
})