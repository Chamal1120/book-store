const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } =
  require("@aws-sdk/lib-dynamodb");
require("dotenv").config();

const router = express.Router();

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "fallback_not_secure_string";

// Check if running locally
const isLocal = process.env.NODE_ENV === "development";

// Initialize DynamoDB Document Client
const client = new DynamoDBClient({
  endpoint: isLocal ? "http://localhost:8000" : undefined,
});
const dynamoDB = DynamoDBDocumentClient.from(client);

// Helper function: Hash password
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Helper function: Verify password
async function verifyPassword(storedHash, password) {
  return await bcrypt.compare(password, storedHash);
}

// Helper function: Generate JWT
function generateJWT(user) {
  const payload = {
    username: user.username,
  };
  const options = {
    expiresIn: "1h",
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
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token is missing" });
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  req.user = decoded;
  next();
}

// Home Route: Get list of books
router.get("/", async (_, res) => {
  try {
    const result = await dynamoDB.send(new ScanCommand({ TableName: "books" }));
    const books = result.Items;

    res.json({ books });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Registration Route
router.post("/register", async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (!username || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const userCheck = await dynamoDB.send(new GetCommand({
      TableName: "users",
      Key: { username },
    }));

    if (userCheck.Item) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = {
      username,
      password: hashedPassword,
      created_at: new Date().toISOString(),
    };

    await dynamoDB.send(new PutCommand({
      TableName: "users",
      Item: newUser,
    }));

    const token = generateJWT(newUser);

    res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
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

    const token = generateJWT(user);

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get User Info Route
router.get("/me", authenticateJWT, async (req, res) => {
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

// Logout Route
router.post("/logout", (_, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;

