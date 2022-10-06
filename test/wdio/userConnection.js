/*
    User Connection Test:
    Checks that a user connection is received, including name that is entered.
    When another user joins, it will also test that both of these users are shown.
    When one disconnects, it will check that their is only one user left.
*/
describe('User Connection/Disconnection', () => {
    it('Checks user connection and disconnection', () => {
        // opens initial window on website
        browser.url("http://localhost:3000/");

        var nameIn = $('#nameIn');
        var nameInSubmit = $('#nameInSubmit');

        // Enter into name input box and click submit.
        nameIn.setValue('User1');
        nameInSubmit.click();

        var users = $('#usersWaiting');

        /*
            Check that only User1 is connected.
            toHaveValue checks that 'User1' is
            the only text in the selected textarea
        */
        expect(users).toHaveValue('User1');

        // Create new window to act as a new user.
        browser.newWindow("http://localhost:3000/");

        nameIn = $('#nameIn');
        nameInSubmit = $('#nameInSubmit');

        // Just as before, enter into name input box and click submit.
        // Different name this time.
        nameIn.setValue('User2');
        nameInSubmit.click();

        users = $('#usersWaiting');

        /*
            Check that both users are listed as connected.
            toHaveValueContaining checks that the textarea
            selected contains 'User1' and 'User2'.
        */
        expect(users).toHaveValueContaining('User1');
        expect(users).toHaveValueContaining('User2');

        // Find the window handles and select the second window
        const handles = browser.getWindowHandles();
        browser.switchToWindow(handles[1]);
        // close second window (User2).
        browser.closeWindow();
        // switch back to first window (User1).
        browser.switchToWindow(handles[0]);

        users = $('#usersWaiting');

        /*
            Check that the only user is 'User1'.
        */
        expect(users).toHaveValue('User1');
    })
})