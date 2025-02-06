const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const awsServerlessExpress = require("aws-serverless-express");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
require("dotenv").config();

const app = express();

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "fallback_not_secure_string";

// Base S3 URL
const S3_BUCKET_URL = "https://bookstore-images.s3.amazonaws.com";

// Check if running locally
const isLocal = process.env.NODE_ENV === "development";

// Body parser middleware
app.use(bodyParser.json());

// Initialize DynamoDB Document Client
const client = new DynamoDBClient({
  endpoint: isLocal ? "http://localhost:8000" : undefined, // Use local endpoint if running locally
});
const dynamoDB = DynamoDBDocumentClient.from(client);

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

// Home Route
app.get("/", async (req, res) => {
  try {
    const result = await dynamoDB.send(new ScanCommand({ TableName: "books" }));
    const books = result.Items;

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
    // Check if the user already exists
    const userCheck = await dynamoDB.send(new GetCommand({
      TableName: "users",
      Key: { username },
    }));

    if (userCheck.Item) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await hashPassword(password);

    // Create a new user
    const newUser = {
      username,
      password: hashedPassword,
      created_at: new Date().toISOString(),
    };

    await dynamoDB.send(new PutCommand({
      TableName: "users",
      Item: newUser,
    }));

    // Generate JWT token for the new user
    const token = generateJWT(newUser);

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
    const userResult = await dynamoDB.send(new GetCommand({
      TableName: "users",
      Key: { username },
    }));

    const user = userResult.Item;

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

// Get User Info Route
app.get("/me", authenticateJWT, async (req, res) => {
  try {
    const userResult = await dynamoDB.send(new GetCommand({
      TableName: "users",
      Key: { username: req.user.username },
    }));

    const user = userResult.Item;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: { username: user.username } });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Protected Route: Purchase
app.post("/purchase", authenticateJWT, async (req, res) => {
  const { bookId } = req.body;

  if (!bookId) {
    return res.status(400).json({ message: "Book ID is required" });
  }

  try {
    const bookResult = await dynamoDB.send(new GetCommand({
      TableName: "books",
      Key: { id: bookId },
    }));

    const book = bookResult.Item;

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const purchase = {
      username: req.user.username,
      bookname: book.bookname,
      price: book.price,
      purchased_date: new Date().toISOString(),
    };

    await dynamoDB.send(new PutCommand({
      TableName: "PurchasedBooks",
      Item: purchase,
    }));

    res.status(201).json({
      message: "Book purchased successfully",
      purchasedBook: purchase,
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

// Lambda handler for Express
const server = awsServerlessExpress.createServer(app);

// Lambda function handler
exports.handler = (event, context) => {
  return awsServerlessExpress.proxy(server, event, context);
};

