### Instructions on How to Play Poker (Texas Hold'em)
# Starting a Game:
- Before the game is officially started, players must pay what is called a "blind".
	- This requires the first player to the left of the dealer (Although, for the sake of this version, the first player in the list of users) will be required to pay the small blind (10 chips) and the next player over will have to pay the big blind (double that of the small blind, 20 chips).
		- This prevents players from joining a game, seeing they have bad cards and folding to avoid losing chips.
		- The users that have to pay these blinds will rotate each game.
- The objective of each game is to win the most chips by betting and hopefully pushing others to bet. 
	- The winner is based on whoever has the highest hand in the game. This is a combination of the player's two cards, and the five community cards that are shown throughout the game. Look at "Hand Ranks" below to learn what each hand rank is from highest to lowest. But first, look at how each game is organized.

# Betting Rounds (How each game is organized):
	- Pre-flop:
		- This is where each player is given their two cards face-down (only visible to the player).
		- They can also "Call" the big blind that is currently out (matches the current bet to continue playing), "Raise" the current bet, or "Fold" and not play the rest of the game. This will continue until all players have bet the same amount or folded.
	- Flop:
		- This is the first round of betting that community cards are shown. Community cards are a shared number of cards in the center of the table.
		- The Dealer, or computer, will deal three face-up community cards out to the table.
		- The current bet is reset to 0 and each player will be given the options below:
			- Each player will then be given a chance to "Check" (Not bet, but continue), "Bet" (Add a bet to the table), "Fold" (leave the game).
			- If one player chooses to "Bet" during a round, everybody will have to match this bet by calling or they have the option to raise the bet. The next round will commence when all player have bet the same amount or they have folded.
	- Turn:
		- This round is similiar to the Flop, although, only one community card is revealed.
		- A betting round begins and the same betting rules apply as the previous betting round and the current bet is set back to 0.
	- River:
		- This round is the same as the Turn. One more community card is revealed.
		- The rest of the round is dedicated to last bets as this is the last round of betting.
		- Once all player's have bet the same amount, all cards are revealed and the winner receives the chips in the pot.

# Hand Ranks (In order from highest to lowest):
	- Royal Flush (Highest):
		- A, K, Q, J, and a 10 of all the same suit.
	- Straight Flush:
		- 5 cards of the same suit in a sequence.
		- Ex: 3 clubs, 4 clubs, 5 clubs, 6 clubs, 7 clubs
	- Four of a Kind:
		- 4 cards of the same value.
		- Ex: 4 clubs, 4 spades, 4 diamonds, 4 hearts
	- Full House:
		- 3 cards of the same value and a separate 2 cards of the same value.
		- Ex: J diamonds, J clubs, J spades, 5 spades, 5 clubs
	- Flush:
		- 5 cards of the same suit, not in a sequence.
		- Ex: 2 clubs, 7 clubs, J clubs, 8 clubs, 4 clubs
	- Straight:
		- 5 cards in a sequence, suit does not matter.
		- Ex: 3 diamonds, 4 clubs, 5 spades, 6 hearts, 7 clubs
	- Three of a Kind:
		- Ex: 4 clubs, 4 spades, 4 diamonds
	- Two Pair:
		- Two different pairs of the same value.
		- Ex: J diamonds, J clubs, 5 spades, 5 clubs
	- Pair:
		- 2 of the same cards.
		- Ex: 5 spades, 5 clubs
	- High Card (Lowest):
		- The highest card within the player's hand and community cards.

### Organized by User Story
## Milestone 1
# User Connection:
- User will be able to access website at url (currently http://localhost:3000)
	- When accessing website, they will be shown a textbox with 'Name:' next to it and a 'Submit' button.
		- User can enter their name into said textbox and when 'Submit' is pressed the textbox will disappear and, within the textarea, they will see their name and any other users.
	- On the list below 'Users:', it should be empty on initial visit, although, when they enter their name and click 'Submit', they should see their name and any other names of users that are currently connected.
	- When a user disconnects, their name will disappear from the list immediately for any other users currently connected. The same works for connection, when a user connects, this will update the list.

# Player Sees Cards:
- User will be able to see two cards dealt to them.
	- The cards given will be chosen from the top of the deck after being shuffled.
		- At the start of the game, each user will be dealt two cards and then shown those two cards.
	- Each user will only be able to see their hand and no other user's hands.

# Poker Community Cards:
- User will be able to go through each phase of a game of Poker.
	- When a game is started, only one user will be able to interact with the game at a time.
		- When the player able to interact takes their turn, they will then be unable to click anything. The next player
		will then be able to take their turn.
	- When all players have taken their turn and are considered ready, the current phase (or gamestate) will end and go to the next.
		- First gamestate (Pre-Flop): Dealing two cards from a shuffled deck to each player and allowing each player to take their turn.
		- Second gamestate (Flop): Three community cards are shown to each user and each player will take their turn.
		- Third gamestate (Turn): Another community card is added and shown to each user and each player will take their turn.
		- Fourth gamestate (River): Another community card is added and shown to each user and each player will take their turn.
		- After all gamestates, game ends and when more progress is made, this will announce and reward the winner.

# Poker Highest Card
- As the game progress, the user will constantly be told what their highest hand currently is.
	- Each gamestate update will lead to sending to the player what their current highest hand is.
		- The Player will be able to see this change and they will be able to always know what they currently have.

# Player Sees Chips
- When the user has entered their name and join the server, they will be shown a section that will
show their current chip count. 
	- When this value is updated, what is shown to the user will also be updated.

# Poker Choices
- When a game has begun, each user will be given a turn when the previous player has taken their turn.
	- When it is the player's turn, they will be given three choices:
		- Check/Call, Bet/Raise (With an adjusted amount they can choose), and Fold.
			- The player will only be able to choose Bet/Raise when there is a specified number of chips they chose to Bet/Raise.
			- If the player folds, they will be unable to take their turn for the rest of the game and they will not be allowed to win.
	- When a player takes their turn, this will allow the next player to take their turn.
		- This will continue until only a single player is left or the game had reached the last gamestate (game over).
	- While the player is in the game, they will be able to see their current chip count, as well as the current pot and the current highest bet.
		- All of these values will update for the user when their is a change.

## Milestone 2
# Multiple Games
- When a user joins the game, they will be placed into a 'waiting' room. While in this room, they will be waiting until there are enough players to start the game (3 players).
	- When enough players have joined, a countdown will begin.
		- This countdown can be interrupted if enough players leave resulting in the player count to drop below 3 players.
	- When the countdown ends, a game will begin.
		- The game will continue until a winner is decided, or if multiple winners are decided.
			- During a game, if a player joins, they will not join the current game, they will be waiting until the next game.
	- When a game ends, the players in the game will be prompted with who had won, as well as a countdown stating they are returning to the 'waiting' room.
		- After the players have returned, this process will repeat with all users that are currently connected (including players returning from the game and players who were waiting).

# Saved Users
- When a user joins the website, they will prompted to enter their username and press submit, when this happens, there are two things that can happen:
	- The user has already joined using this username and their information (chip count) will be returned to their current session.
	- The user has not joined with this username and they will start with the initial chip count (1000), as well as being added to the database that holds user information.
- When a user disconnects, their information (chip count) will be updated in the database.

# Poker Visuals
- The visuals that the User will see throughout their experience with the website has been changed to look more appealing:
	- The background now has a green poker table look to it.
	- The font has been changed to match a little better, as well as some things that are more important being bolded to look more obvious.
	- The section that shows the list of users has been changed to look better by adding a background that adds more of a Poker game feel.
	- Card visuals have also been implemented, showing an actual picture of the cards that the user has in their hand, as well as what is in the community cards.
	- More user friendly text has been add to better the user's experience:
		- Countdown for when a game starts.
		- Number of players connected and how many more players are needed to start the game.
			- Along with this, when a user connects to the server during a game, they will be informed there is a game in progress.
		- How much the winner or winners had won.