# BookStore Backend

This is the backend api for the bookstore frontend, built with Express.js and PostgreSQL for the Cloud Infrastructure Module of University. The app uses node's built-in scrypt for password hashing and express-session for session management.

# Requirements

* Node.js
* pnpm
* PostgreSQL

# How to run

1. Clone the repo:

```bash
git clone <repository-url>
cd bookstore-backend
```

2. Create the .env file:

```bash
DB_USER=your_pg_username
DB_PASSWORD=your_pg_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookstore
SESSION_SECRET=your_secret_key
```

3. Create the PostgreSQL database and tables:

```sql
CREATE DATABASE bookstore;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    bookname VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE purchased_books (
    purchase_id SERIAL PRIMARY KEY,
    username VARCHAR(100) REFERENCES users(username),
    bookname VARCHAR(255),
    price NUMERIC(10, 2),
    purchased_date TIMESTAMP DEFAULT NOW()
);
```

4. Sync the node modules

```bash
pnpm i
```

4. Start the development server:

```bash
pnpm run dev
```

# Testing Routes

You can test the routes using testng tool like Postman, REST cleint or the following curl commands.

1. /register

Request Body
```json
{
  "username": "testuser",
  "password": "mypassword123",
  "confirmPassword": "mypassword123"
}
```

```bash
curl -X POST http://localhost:3000/register \
-H "Content-Type: application/json" \
-d '{"username": "testuser", "password": "mypassword123", "confirmPassword": "mypassword123"}'
```

2. /login

Request Body
```json
{
  "username": "testuser",
  "password": "mypassword123"
}
```

```bash
curl -X POST http://localhost:3000/login \
-H "Content-Type: application/json" \
-d '{"username": "testuser", "password": "mypassword123"}' -c cookies.txt
```

3. /books

```bash
curl -X GET http://localhost:3000/
```

4. /purchase

Request Body
```json
{
  "bookId": 1
}
```

```bash
curl -X POST http://localhost:3000/purchase \
-H "Content-Type: application/json" \
-d '{"bookId": 1}' -b cookies.txt
```

5. /purchase_history

```bash
curl -X GET http://localhost:3000/purchase-history -b cookies.txt
```
