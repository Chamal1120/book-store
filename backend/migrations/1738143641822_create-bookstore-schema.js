exports.up = (pgm) => {

  pgm.createTable("users", {
    id: "id",
    username: { type: "varchar(100)", notNull: true, unique: true },
    password: { type: "text", notNull: true },
    created_at: { type: "timestamp", default: pgm.func("current_timestamp") },
  });

  pgm.createTable("books", {
    id: "id",
    bookname: { type: "varchar(255)", notNull: true },
    author: { type: "varchar(255)", notNull: true },
    genre: "varchar(100)",
    price: { type: "numeric(10,2)", notNull: true },
    isbn: { type: "varchar(13)", notNull: true, unique: true },
  });

  pgm.createTable("purchased_books", {
    purchase_id: "id",
    username: { type: "varchar(100)", references: '"users"(username)', onDelete: "CASCADE" },
    bookname: "varchar(255)",
    isbn: "varchar(13)",
    price: "numeric(10,2)",
    purchased_date: { type: "timestamp", default: pgm.func("current_timestamp") },
  });

  pgm.createIndex("books", "isbn");
  pgm.createIndex("purchased_books", "username");
};
