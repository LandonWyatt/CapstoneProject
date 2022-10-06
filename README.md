# **Online Poker, Blackjack, & Roulette**
I will create a server-based Poker, Blackjack, and Roulette website using HTML/CSS and JavaScript with a Node/Express server. It will consist of Three games that will allow the player to use chips that are given upon access to the website. The user will access said website and be given a certain number of chips that they can use to gamble on either Blackjack, Poker, or Roulette, they will also be able to choose what game they would like to play.

## **Plans**
  - Create a server-backed Poker, Blackjack, and Roulette website using Node/Express.
  - Provide users who visit with a standard amount of chips to use throughout the three games.
  - Allow user to play either of the three games and bet their own chips.
  
## **Games Planned**
### Poker
  This will be set up as Texas Holdem, the user will be given two cards at random from a set number of cards. When it is their turn, they will be asked to Call, Raise, or Fold, and when all bets are placed the three community cards will be shown to the whole table. As the game continues, with each person’s turn, they will be asked to Call, Raise, or Fold. When all players have bet the same amount for the round, the next card in the middle will be shown, the same will then be repeated for the next community card. Once all community cards are shown and all players have bet the same amount, or all they can bet, the game will end, and the pot will go to the player with the highest hand.

### Blackjack
  This will be less based on player-to-player interaction but will still have some kind of interaction between each other, more or less, just knowing who won and who is present. At the beginning of each play, the player will be asked how much they would like to bet. After betting, the player will be given two initial cards, as well as the dealer (Computer). The dealer’s cards will be face up and visible to whomever is playing with, and each player’s cards will only be visible to themselves. When it reaches the player’s turn, they will be asked to Hit or Stand, if they break 21, they lose, if they do not, then it will be compared to the dealer’s hand (If the player has the higher hand, they win). The dealer will be forced to hit when their cards add up to 16 or less and will have to stand when their cards add up to 17 or more.

### Roulette
  People can join in and place bets on a visible wheel. The wheel will be server side. The user will be able to place bets on black or red, odd or eve, or any number of their choice and when betting is over, if the ball lands on their bet, they would win the number of chips based on the probability of their bet, otherwise, they will lose.
  
## **Standards Being Used**
- JavaScript: https://developer.mozilla.org/en-US/docs/MDN/Guidelines/Code_guidelines/JavaScript
- HTML: https://www.w3schools.com/html/html5_syntax.asp
- CSS: https://developer.mozilla.org/en-US/docs/MDN/Guidelines/Code_guidelines/CSS
