/*
    Player Sees Cards Test:
    Checks that a user is given random cards.
*/
describe('Sending Users their own hands.', () => {
    it('Checks that each user has different hands.', () => {
        browser.url("http://localhost:3000/");

        var nameIn = $('#nameIn');
        var nameInSubmit = $('#nameInSubmit');

        nameIn.setValue('User1');
        nameInSubmit.click();

        browser.newWindow("http://localhost:3000/");

        nameIn = $('#nameIn');
        nameInSubmit = $('#nameInSubmit');

        nameIn.setValue('User2');
        nameInSubmit.click();

        // Find the window handles
        const handles = browser.getWindowHandles();

        // Save User2's hand.
        browser.switchToWindow(handles[1]);
        var user2Hand = $('#cards').getHTML(false);
        console.log("user2Hand: " + user2Hand);

        // Save User1's hand.
        browser.switchToWindow(handles[0]);
        var user1Hand = $('#cards').getHTML(false);
        console.log("user1Hand: " + user1Hand);

        /**
         * Compare the two strings and check that they are two different hands.
         * If 0 is returned, they are the same, this will check that the value returned is not 0.
         */
        expect(user1Hand.localeCompare(user2Hand)).toBe(0);
    })
})