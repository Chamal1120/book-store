const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const { Pool } = require('pg');
require('dotenv').config();

const app = express()
const port = 3000

// Middlewares

// Setup Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

// Parses Json data
app.use(bodyParser.json());

// Check for the authentication
function checkAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}

// Postgresql connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Helper function: Hash password with scrypt
function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

// Helper function: Verify password
function verifyPassword(storedHash, password) {
  return new Promise((resolve, reject) => {
    const [salt, key] = storedHash.split(":");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString("hex"));
    });
  });
}

// Home Route
app.get("/home", async (_, res) => {
  try {
    const result = await pool.query("SELECT * FROM books");
    const books = result.rows;

    res.status(200).json({ books });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Protected Route: Purchase
app.post("/purchase", checkAuth, async (req, res) => {
  const { bookId } = req.body;

  if (!bookId) {
    return res.status(400).json({ message: "Book ID is required" });
  }

  try {
    // Get book details by ID
    const bookResult = await pool.query("SELECT * FROM books WHERE id = $1", [bookId]);
    const book = bookResult.rows[0];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Get logged-in user's username from session
    const username = req.session.user.username;

    // Insert into purchased_books table
    const insertResult = await pool.query(
      "INSERT INTO purchased_books (username, bookname, price) VALUES ($1, $2, $3) RETURNING purchase_id, username, bookname, price, purchased_date",
      [username, book.bookname, book.price]
    );

    const purchasedBook = insertResult.rows[0];

    res.status(201).json({
      message: "Book purchased successfully",
      purchasedBook,
    });
  } catch (error) {
    console.error("Error purchasing book:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Protected Route: purchase-history
app.get("/purchase-history", checkAuth, async (req, res) => {
  try {
    // Get logged-in user's username from session
    const username = req.session.user.username;

    // Query to fetch the purchase history of the logged-in user
    const result = await pool.query(
      "SELECT * FROM purchased_books WHERE username = $1 ORDER BY purchased_date DESC",
      [username]
    );

    const purchaseHistory = result.rows;

    if (purchaseHistory.length === 0) {
      return res.status(404).json({ message: "No purchase history found" });
    }

    // Send the user's purchase history
    res.status(200).json({ purchaseHistory });
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Registration Route
app.post("/register", async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  // Input validation
  if (!username || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // Check if username already exists
    const userCheck = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Insert user into the database
    const newUser = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at",
      [username, hashedPassword]
    );

    // Send success response
    res.status(201).json({
      message: "User registered successfully",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Input validation
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    // Find user by username
    const userResult = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(user.password, password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Store the user ID in the session
    req.session.user = { id: user.id, username: user.username };

    // Send success response with user info (excluding password)
    const { password: _, ...userInfo } = user;  // Exclude password from the response
    res.status(200).json({
      message: "Login successful",
      user: userInfo
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
