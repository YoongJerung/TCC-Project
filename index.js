const express = require("express");
const bodyParser = require("body-parser")
const mysql = require("mysql");
const path = require("path");
const currentDir = __dirname;

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({extended:true}));

const db = mysql.createConnection({
    host: "tcc-project-database.cn022yiocpzt.us-east-1.rds.amazonaws.com",
    port: "3306",
    user: "main",
    password: "tccproject",
    database: "project"
})

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database!');
});

// CORS middleware for handling requests from different origins
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// SQL statement to create the table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS items (
    assetId INT PRIMARY KEY,
    assetName VARCHAR(255),
    quantity INT,
    price FLOAT,
    location VARCHAR(255)
  );
`;

  // Create the table
  db.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Table created successfully!');
    }
  });

app.get("/", (req, res) => {
    res.sendFile(currentDir + "/home.html");
});

app.get("/add-item", (req, res) => {
    res.sendFile(currentDir + "/add.html");
});

app.get("/delete-item", (req, res) => {
    res.sendFile(currentDir + "/delete.html");
});

app.get("/edit-item", (req, res) => {
    res.sendFile(currentDir + "/edit.html");
});

app.get("/view-item", (req, res) => {
    res.sendFile(currentDir + "/view.html");
});

app.post("/add", (req, res) => {
    const { assetName, assetId, quantity, price, location } = req.body;
    const sql = 'INSERT INTO items (assetName, assetId, quantity, price, location) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [assetName, assetId, quantity, price, location], (err, result) => {
        if (err) {
            console.error('Error adding item:', err);
            res.status(404).json('Error adding item to the database.');
        } else {
            console.log('Item added successfully!');
            res.json('Item added successfully!');
        }
    });
});

app.post("/edit", (req, res) => {
  const { itemId, assetName, quantity, price, location } = req.body;

  // Perform the database query to update the item
  const query = 'UPDATE items SET assetName=?, quantity=?, price=?, location=? WHERE assetId = ?';
  db.query(query, [assetName, quantity, price, location, itemId], (err, result) => {
    if (err) {
      console.error('Error executing update query:', err);
      res.status(500).json('Internal Server Error');
      return;
    }

    if (result.affectedRows > 0) {
      res.json('Item updated successfully');
    } else {
      res.status(404).json('Item not found');
    }
  });
});

app.post("/delete", (req, res) => {
  const itemId = req.body.itemId;

  // Perform the database query to delete the item
  const query = 'DELETE FROM items WHERE assetId = ?';
  db.query(query, [itemId], (err, result) => {
    if (err) {
      console.error('Error executing delete query:', err);
      res.status(500).json('Internal Server Error');
      return;
    }

    if (result.affectedRows > 0) {
      res.json('Item deleted successfully');
    } else {
      res.status(404).json('Item not found');
    }
  });
});

app.get("/get-items", (req, res) => {
  const selectAllItemsQuery = 'SELECT * FROM items';
  db.query(selectAllItemsQuery, (err, results) => {
    if (err) {
      console.error('Error querying items:', err);
      res.status(500).json('Internal Server Error');
    } else {
      console.log('All items in the "items" table:', results);
      res.json(results);
    }
  });
})

app.post("/search", (req, res) => {
    const itemId = req.body.itemId;
    const query = 'SELECT * FROM items WHERE assetId = ?';
    db.query(query, [itemId], (err, results) => {
        if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Internal Server Error');
        return;
        }

        if (results.length > 0) {
        const itemInfo = results[0];
        res.json(itemInfo);
        } else {
        res.status(404).send({ error: 'Item not found' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
