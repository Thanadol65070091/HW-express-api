const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

db.connect();

//แสดงสินค้าทั้งหมด
app.get('/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            console.error('Query error: ', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

//แสดงสินค้าตาม id
app.get('/products/:id', (req, res) => {
    db.query('SELECT * FROM products WHERE id = ?', [req.params.id], (err, results) => {
        if (err) {
            console.error('Query error: ', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.length === 0) {
            return res.send({ message: 'Product not found' });
        }
        res.json(results[0]);
    });
});

//ค้นหาสินค้าจาก name
app.get('/products/search/:keyword', (req, res) => {
    db.query('SELECT * FROM products WHERE name LIKE ?', [`%${req.params.keyword}%`], (err, results) => {
        if (err) {
            console.error('Query error: ', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
