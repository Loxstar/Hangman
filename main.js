const express = require("express");
const mustache = require("mustache-express");
const bodyparser = require("body-parser");
const fs = require("fs");
const session = require("express-session");
const app = express();
const path = require('path');

// CSS 
app.use(express.static(path.join(__dirname, 'public')));

// Enable Dictionary
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

// Enable body parser
app.use(bodyparser.urlencoded({ extended: true }));

app.use(session({
    secret: 'bigfoot',
    resave: false,
    saveUninitialized: true
}))


// Enable mustache
app.engine('mustache', mustache());
app.set('views', './files');
app.set('view engine', 'mustache');

// Homepage
app.get("/", function (req, res) {
    let word = [];
    if (req.session.word === undefined) {
        req.session.word = words[Math.floor(Math.random() * words.length)];
        req.session.guessArray = [];
        req.session.guessLeft = 8;
        req.session.answerArray = [];
        req.session.gameSitch = "Get Guessin'!";


        for (let i = 0; i < req.session.word.length; i++) {
            word.push(req.session.word[i]);
            req.session.answerArray.push("_");

        }
    };
    // Create variables to abbreviate
    let guessArray = req.session.guessArray;
    let guessLeft = req.session.guessLeft;
    let answerArray = req.session.answerArray;
    let gameSitch = req.session.gameSitch;
    // console.log(req.session.word)
    // console.log(req.session.guessArray)
    // console.log(req.session.guessLeft)
    // console.log(req.session.answerArray)

console.log(req.session.word);
    res.render("index", {
        guessArray: guessArray,
        guessLeft: guessLeft,
        answerArray: answerArray,
        gameSitch: gameSitch
    });
});
// Route
app.post("/", function (req, res) {
    let word = req.session.word;
    let guessArray = req.session.guessArray;
    let guessLeft = req.session.guessLeft;
    let answerArray = req.session.answerArray;
    let gameSitch = req.session.gameSitch;
    let guess = req.body.gp;
    let sameGuess = "";
    let goodOrNo = false;
    let dupGuess = false;
    let replay = false;


    if (guess.length > 1) { // Redirect 
        res.redirect("/")
    };
    // Set up guessed letters array
    for (let i = 0; i < guessArray.length; i++) {
        if (guess === guessArray[i]) {
            dupGuess = true;
            sameGuess = "Remember better! Try again!";
        };
    };
    if (dupGuess === false) {
        guessArray.push(guess);
    } else {
        res.redirect("/");
    };

    for (let i = 0; i < word.length; i++) {
        if (guess === word[i]) {
            answerArray[i] = guess;
            goodOrNo = true;
        }
    };
    if (goodOrNo === false) {
        req.session.guessLeft = guessLeft - 1;
    }

    // Ran out of guesses. Game Over!
    if (req.session.guessLeft === 0) {
        answerArray === word;
        gameSitch = "Haha! You're the worst!";
        replay = true;

    } else {
        gameSitch = "Is the Goose Noose still loose?";
    };
    if (req.session.guessLeft > 0 && word===answerArray.join('')) {
        replay = true;
        gameSitch = "YOUR NOOSE REMAINS UNGOOSED!!! For now...";
    }

    res.render("index", {
        guess: guess,
        guessLeft: req.session.guessLeft,
        answerArray: answerArray,
        gameSitch: gameSitch,
        guessArray: guessArray,
        replay: replay
    });
});

app.post("/restart", function (req, res) {
    req.session.destroy();
    res.redirect("/");
});

app.listen(3000, function () {
    console.log('Ham Sammich!');
});