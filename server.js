//IMPORT TOOLS
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json());       // Allows the server to read data sent from the browser
app.use(express.static('.'));  // Serves your index.html, script.js, and css to the browser

// creates a file named if it isn't there already.
const db = new sqlite3.Database('./project.db');

// Manually build a table inside the database file right at startup
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY, 
        accessCode TEXT, 
        timestamp TEXT, 
        question TEXT,
        a TEXT,
        b TEXT,
        c TEXT,
        d TEXT,
        optionCount INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY, 
        name TEXT, 
        questionCount INTEGER, 
        questionsCorrect INTEGER,
        percentage INTEGER,
    )`);
});

// GET ALL QUESTIONS FOR A SPECIFIC ACCESS CODE
app.get('/questions/getQuiz/:accessCode', (req, res) => {
    const accessCode = req.params.accessCode;
    db.all(`SELECT * FROM questions WHERE accessCode = ?`, [accessCode], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// START SERVER
app.listen(3000, () => console.log("Server listening at http://localhost:3000"));
