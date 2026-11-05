const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname)));

const db = new sqlite3.Database(path.join(__dirname, "project.db"));

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        accessCode TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        question TEXT NOT NULL,
        a TEXT NOT NULL,
        b TEXT NOT NULL,
        c TEXT NOT NULL,
        d TEXT NOT NULL,
        correctAnswer TEXT NOT NULL DEFAULT 'a'
    )`);

    // Upgrade databases created by the older project version.
    db.all("PRAGMA table_info(questions)", (err, columns) => {
        if (err) return console.error("Could not inspect questions table:", err.message);
        if (!columns.some(column => column.name === "correctAnswer")) {
            db.run("ALTER TABLE questions ADD COLUMN correctAnswer TEXT NOT NULL DEFAULT 'a'",
                alterErr => {
                    if (alterErr) console.error("Could not add correctAnswer column:", alterErr.message);
                });
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        questionCount INTEGER,
        questionsCorrect INTEGER,
        percentage INTEGER
    )`);
});

function parseTimestamp(value) {
    const text = String(value ?? "").trim();
    if (/^\d+(\.\d+)?$/.test(text)) return Number(text);
    const parts = text.split(":");
    if (parts.length === 2 && parts.every(part => /^\d+(\.\d+)?$/.test(part))) {
        return Number(parts[0]) * 60 + Number(parts[1]);
    }
    if (parts.length === 3 && parts.every(part => /^\d+(\.\d+)?$/.test(part))) {
        return Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2]);
    }
    return NaN;
}

app.get("/questions/getQuiz/:accessCode", (req, res) => {
    const accessCode = req.params.accessCode.trim();
    if (!accessCode || accessCode.length > 40) {
        return res.status(400).json({ error: "Invalid access code." });
    }
    db.all(
        "SELECT id, accessCode, timestamp, question, a, b, c, d, correctAnswer FROM questions WHERE accessCode = ? ORDER BY CAST(timestamp AS REAL), id",
        [accessCode],
        (err, rows) => {
            if (err) return res.status(500).json({ error: "Could not load quiz." });
            res.json(rows);
        }
    );
});

app.post("/questions/add", (req, res) => {
    const { accessCode, timestamp, question, a, b, c, d, correctAnswer } = req.body || {};
    const fields = [accessCode, timestamp, question, a, b, c, d];
    if (fields.some(value => typeof value !== "string" || !value.trim())) {
        return res.status(400).json({ error: "Please fill in every field." });
    }
    if (accessCode.trim().length > 40) return res.status(400).json({ error: "Access code must be 40 characters or fewer." });
    if (question.trim().length > 1000) return res.status(400).json({ error: "Question must be 1000 characters or fewer." });
    if (!Number.isFinite(parseTimestamp(timestamp)) || parseTimestamp(timestamp) < 0) {
        return res.status(400).json({ error: "Timestamp must be seconds or mm:ss (or hh:mm:ss)." });
    }
    if (!["a", "b", "c", "d"].includes(correctAnswer)) {
        return res.status(400).json({ error: "Choose the correct answer (A-D)." });
    }

    db.run(
        `INSERT INTO questions (accessCode, timestamp, question, a, b, c, d, correctAnswer)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [accessCode.trim(), timestamp.trim(), question.trim(), a.trim(), b.trim(), c.trim(), d.trim(), correctAnswer],
        function (err) {
            if (err) return res.status(500).json({ error: "Could not save question." });
            res.status(201).json({ id: this.lastID });
        }
    );
});

app.listen(PORT, () => console.log(`Server listening at http://localhost:${PORT}`));