# Instructions to Run Code
## IDE
Developed in Visual Studio 2019
 1. To run this project, you must open the Visual Studio Installer and click on modify, if already installed.
 2. Then, under 'Workloads', install Node.js development.
 3. To open the project, open Capstone.sln file that is located within the dev files.

## Node/Express server (w/ Socket.io, Webdriver.io, Jest, MongoDB, Mongoose)
You will have to install Express, Socket.io, Webdriver.io, Jest, MongoDB, and Mongoose:
- Open the folder containing all of the files within this Dev branch in a command console and follow the instructions below.
  - Enter "npm ci" into CMD to install all extensions.
- After this, you will have to run the Node.js server by accessing the file that holds the Dev files and typing, "node app.js" into CMD.
  - You will then be able to go to the local host: http://localhost:3000 to access the game.

# Instructions to Test Code 
## Using Webdriver.io
- Open a command console and head to my main directory.
  - Within the command console, run server (by entering "node app.js") and then enter "npx wdio run wdio.conf.js --spec ./test/wdio/--.js".
  	- The '--' before '.js' will be replaced with the name of the corresponding testing file you would like to run.
- To check the source code for the testing.
  - Found in "test/specs/".
## Using Jest
- Open a command console and head to my main directory.
  - Within the command console, enter "jest --coverage ./jest/--.test.js".
  	- The '--' before '.test.js' will be replaced with the name of the corresponding testing file you would like to run.
