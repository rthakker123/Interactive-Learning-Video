//Import Tools
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const crypto = require('crypto');

app.use(express.json());       // Allows the server to read data sent from the browser
app.use(express.static('.'));  // Serves your index.html, script.js, and css to the browser

// creates a file named if it isn't there already.
const db = new sqlite3.Database('./project.db');

// Manually build the tables inside the database file right at startup
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY, 
        accessCode TEXT, 
        timestamp TEXT, 
        question TEXT,
        a TEXT,
        b TEXT,
        c TEXT,
        d TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY, 
        name TEXT, 
        questionCount INTEGER, 
        questionsCorrect INTEGER,
        percentage INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS videos (
           accessCode TEXT PRIMARY KEY,
        videoURL TEXT
    )`);
});

// Get all questions for a specific acess code.
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

//Add a Question to the database
app.post('/questions/add', (req, res) => {
  const { accessCode, timestamp, question, a, b, c, d } = req.body;

  db.run(
    `INSERT INTO questions (accessCode, timestamp, question, a, b, c, d)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [accessCode, timestamp, question, a, b, c, d],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.post('/videos/create', (req, res) => {
    const { videoUrl } = req.body;
    if(!videoUrl) {
        return res.status(400).json({ error: "Please give a video URL!!!" });
    }

    const accessCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    db.run(
        `INSERT INTO videos (accessCode, videoUrl) VALUES (?, ?)`,
            [accessCode, videoUrl],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.json({ accessCode: accessCode });
            }
        );
    });

    // Get a video using its access code
app.get('/videos/:accessCode', (req, res) => {
    const accessCode = req.params.accessCode;

    db.get(
        `SELECT videoURL FROM videos WHERE accessCode = ?`,
        [accessCode],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!row) {
                return res.status(404).json({ error: "Video not found." });
            }

            res.json({ videoUrl: row.videoURL });
        }
    );
});


// Start Server
app.listen(3000, () => console.log("Server listening at http://localhost:3000"));
