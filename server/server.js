// ==========================================================
// SHADEMIST DOCS — BACKEND SERVER
// ==========================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const Database = require("better-sqlite3");
const crypto = require("crypto");

const app = express();


// ==========================================================
// CONFIG
// ==========================================================

const PORT = process.env.PORT || 3000;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
    console.error("❌ ADMIN_PASSWORD is missing from .env");
    process.exit(1);
}


// ==========================================================
// MIDDLEWARE
// ==========================================================

app.use(cors());

app.use(express.json({
    limit: "100kb"
}));


// ==========================================================
// DATABASE
// ==========================================================

const dbPath = path.join(__dirname, "shademist.db");

const db = new Database(dbPath);


// Enable WAL mode
db.pragma("journal_mode = WAL");


// ==========================================================
// TABLES
// ==========================================================

db.exec(`
    CREATE TABLE IF NOT EXISTS updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS commands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        usage TEXT,
        created_at TEXT NOT NULL
    );
`);


// ==========================================================
// ADMIN SESSIONS
// ==========================================================

const sessions = new Map();


// ==========================================================
// HELPERS
// ==========================================================

function createToken() {

    return crypto.randomBytes(32).toString("hex");

}


function requireAdmin(req, res, next) {

    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {

        return res.status(401).json({
            success: false,
            message: "Unauthorized."
        });

    }

    const token = auth.slice(7);

    if (!sessions.has(token)) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired session."
        });

    }

    next();

}


// ==========================================================
// BASIC ROUTES
// ==========================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        name: "ShadeMist Docs API",
        version: "1.0.0",
        status: "online"
    });

});


// ==========================================================
// HEALTH CHECK
// ==========================================================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        status: "online",
        timestamp: new Date().toISOString()
    });

});


// ==========================================================
// ADMIN LOGIN
// ==========================================================

app.post("/api/admin/login", (req, res) => {

    const { password } = req.body;

    if (!password) {

        return res.status(400).json({
            success: false,
            message: "Password is required."
        });

    }


    if (password !== ADMIN_PASSWORD) {

        return res.status(401).json({
            success: false,
            message: "Incorrect password."
        });

    }


    const token = createToken();

    sessions.set(token, {
        createdAt: Date.now()
    });


    res.json({
        success: true,
        token
    });

});


// ==========================================================
// ADMIN LOGOUT
// ==========================================================

app.post(
    "/api/admin/logout",
    requireAdmin,
    (req, res) => {

        const token =
            req.headers.authorization.slice(7);

        sessions.delete(token);

        res.json({
            success: true,
            message: "Logged out successfully."
        });

    }
);


// ==========================================================
// GET UPDATES
// ==========================================================

app.get("/api/updates", (req, res) => {

    try {

        const updates = db.prepare(`
            SELECT
                id,
                title,
                description,
                date
            FROM updates
            ORDER BY id DESC
        `).all();


        res.json({
            success: true,
            updates
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to load updates."
        });

    }

});


// ==========================================================
// CREATE UPDATE
// ==========================================================

app.post(
    "/api/updates",
    requireAdmin,
    (req, res) => {

        try {

            const {
                title,
                description
            } = req.body;


            if (!title || !description) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Title and description are required."
                });

            }


            if (title.length > 150) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Title is too long."
                });

            }


            if (description.length > 5000) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Description is too long."
                });

            }


            const date =
                new Date().toISOString();


            const result = db.prepare(`
                INSERT INTO updates
                (title, description, date)
                VALUES (?, ?, ?)
            `).run(
                title.trim(),
                description.trim(),
                date
            );


            res.json({
                success: true,
                message: "Update published.",
                update: {
                    id: result.lastInsertRowid,
                    title: title.trim(),
                    description: description.trim(),
                    date
                }
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Failed to publish update."
            });

        }

    }
);


// ==========================================================
// DELETE UPDATE
// ==========================================================

app.delete(
    "/api/updates/:id",
    requireAdmin,
    (req, res) => {

        try {

            const id =
                Number(req.params.id);


            if (!Number.isInteger(id)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid update ID."
                });

            }


            const result = db.prepare(`
                DELETE FROM updates
                WHERE id = ?
            `).run(id);


            if (result.changes === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Update not found."
                });

            }


            res.json({
                success: true,
                message: "Update deleted."
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Failed to delete update."
            });

        }

    }
);


// ==========================================================
// GET COMMANDS
// ==========================================================

app.get("/api/commands", (req, res) => {

    try {

        const commands = db.prepare(`
            SELECT
                id,
                category,
                name,
                description,
                usage,
                created_at
            FROM commands
            ORDER BY category ASC, id ASC
        `).all();


        res.json({
            success: true,
            commands
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to load commands."
        });

    }

});


// ==========================================================
// CREATE COMMAND
// ==========================================================

app.post(
    "/api/commands",
    requireAdmin,
    (req, res) => {

        try {

            const {
                category,
                name,
                description,
                usage
            } = req.body;


            if (
                !category ||
                !name ||
                !description
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Category, name and description are required."
                });

            }


            if (category.length > 50) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Category is too long."
                });

            }


            if (name.length > 100) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Command name is too long."
                });

            }


            if (description.length > 1000) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Description is too long."
                });

            }


            const createdAt =
                new Date().toISOString();


            const result = db.prepare(`
                INSERT INTO commands
                (
                    category,
                    name,
                    description,
                    usage,
                    created_at
                )
                VALUES (?, ?, ?, ?, ?)
            `).run(
                category.trim(),
                name.trim(),
                description.trim(),
                usage ? usage.trim() : "",
                createdAt
            );


            res.json({
                success: true,
                message:
                    "Command added successfully.",
                command: {
                    id: result.lastInsertRowid,
                    category: category.trim(),
                    name: name.trim(),
                    description: description.trim(),
                    usage: usage
                        ? usage.trim()
                        : "",
                    created_at: createdAt
                }
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Failed to add command."
            });

        }

    }
);


// ==========================================================
// DELETE COMMAND
// ==========================================================

app.delete(
    "/api/commands/:id",
    requireAdmin,
    (req, res) => {

        try {

            const id =
                Number(req.params.id);


            if (!Number.isInteger(id)) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid command ID."
                });

            }


            const result = db.prepare(`
                DELETE FROM commands
                WHERE id = ?
            `).run(id);


            if (result.changes === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Command not found."
                });

            }


            res.json({
                success: true,
                message:
                    "Command deleted."
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Failed to delete command."
            });

        }

    }
);


// ==========================================================
// 404
// ==========================================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "API route not found."
    });

});


// ==========================================================
// ERROR HANDLER
// ==========================================================

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal server error."
    });

});


// ==========================================================
// START SERVER
// ==========================================================

app.listen(PORT, () => {

    console.log("");
    console.log("======================================");
    console.log("      SHADEMIST DOCS API");
    console.log("======================================");
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📦 Database: ${dbPath}`);
    console.log("🔐 Admin authentication enabled");
    console.log("======================================");
    console.log("");

});