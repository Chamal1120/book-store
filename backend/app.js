const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cors = require("cors");
const awsServerlessExpress = require("aws-serverless-express");

// var port = 3000;

const app = express();

// Enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "fallback_not_secure_string";

// Base S3 URL
const S3_BUCKET_URL = "https://bookstore-images.s3.amazonaws.com";

// Check if running locally
const isLocal = process.env.NODE_ENV === "development";

// Body parser middleware
app.use(bodyParser.json());

// Postgresql connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Helper function: Hash password
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

// Helper function: Generate JWT
function generateJWT(user) {
  const payload = {
    userId: user.id,
    username: user.username,
  };
  const options = {
    expiresIn: "1h", // JWT expiration time
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

// Helper function: Verify JWT
function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Middleware: Authenticate JWT from Authorization header
function authenticateJWT(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ message: "Authorization token is missing" });
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  req.user = decoded; // Attach user info to request object for use in route handlers
  next();
}

app.get("/me", authenticateJWT, async (req, res) => {
  try {
    const userResult = await pool.query(
      "SELECT id, username FROM users WHERE id = $1",
      [req.user.userId],
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Home Route
app.get("/", async (_, res) => {
  try {
    const result = await pool.query("SELECT * FROM books");
    const books = result.rows;

    // Generate image URLs dynamically based on environment
    const updatedBooks = books.map((book) => {
      const isbn = book.isbn;
      const localImagePath = `../covers/${isbn}.jpg`;
      const s3ImagePath = `${S3_BUCKET_URL}/${isbn}.jpg`;

      return {
        ...book,
        cover: isLocal ? localImagePath : s3ImagePath,
      };
    });

    res.status(200).json({ books: updatedBooks });
  } catch (error) {
    console.error("Error fetching books:", error);
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
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at",
      [username, hashedPassword],
    );

    const user = newUser.rows[0];

    // Generate JWT token for the new user
    const token = generateJWT(user);

    res.status(201).json({
      message: "User registered successfully",
      token, // Send the JWT token to the client
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await verifyPassword(user.password, password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Generate JWT token for the logged-in user
    const token = generateJWT(user);

    res.status(200).json({
      message: "Login successful",
      token, // Send the JWT token to the client
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Protected Route: Purchase
app.post("/purchase", authenticateJWT, async (req, res) => {
  const { bookId } = req.body;

  if (!bookId) {
    return res.status(400).json({ message: "Book ID is required" });
  }

  try {
    const bookResult = await pool.query("SELECT * FROM books WHERE id = $1", [
      bookId,
    ]);
    const book = bookResult.rows[0];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const username = req.user.username; // Use username from decoded JWT

    const insertResult = await pool.query(
      "INSERT INTO purchased_books (username, bookname, price) VALUES ($1, $2, $3) RETURNING purchase_id, username, bookname, price, purchased_date",
      [username, book.bookname, book.price],
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

// Logout Route
app.post("/logout", (_, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

// Start the server
//app.listen(port, () => {
//  console.log(`Server running on http://localhost:${port}`);
//});

// Lambda handler for Express
const server = awsServerlessExpress.createServer(app);

// Lambda function handler
exports.handler = (event, context) => {
  return awsServerlessExpress.proxy(server, event, context);
};
