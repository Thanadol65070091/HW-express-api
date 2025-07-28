const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

db.connect();

// HW2 แสดงฉพ.สค.ที่ไม่ถูกลบ
app.get('/products', (req, res) => {
    db.query('SELECT * FROM products WHERE is_deleted = 0', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

//
app.get('/products/:id', (req, res) => {
    db.query('SELECT * FROM products WHERE id = ? AND is_deleted = 0', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0] || {});
    });
});

//
app.get('/products/search/:keyword', (req, res) => {
    db.query('SELECT * FROM products WHERE name LIKE ? AND is_deleted = 0', [`%${req.params.keyword}%`], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });
        res.json(results);
    });
});



//HW2D2
app.post('/products', (req, res) => {
        const { name, price, discount, review_count, image_url } = req.body;
        db.query(
                'INSERT INTO products (name, price, discount, review_count, image_url) VALUES (?, ?, ?, ?, ?)',
                [name, price, discount, review_count, image_url], 
                (err, result) => {
                        if (err) return res.status(500).json({error: err.message});
                        res.status(201).json({ id: result.insertId, message: 'Product created' });
                }
        );
});

app.put('/products/:id', (req, res) => {
        const { name, price, discount, review_count, image_url } = req.body;
        db.query(
                'UPDATE products SET name = ?, price = ?, discount = ?, review_count = ?, image_url = ? WHERE id = ?',
                [name, price, discount, review_count, image_url, req.params.id], 
                (err) => {
                        if (err) return res.status(500).json({error: err.message});
                        res.json({ message: 'Product updated' });
                }
        );
});


// app.delete('/products/:id', (req, res) => {
//         db.query(
//                 'DELETE FROM products WHERE id = ?',
//                 [req.params.id],
//                 (err) => {
//                         if (err) return res.status(500).json({error: err.message});
//                         res.json({ message: 'Product deleted' });
//                 }
//         );
// });

// Soft
app.delete('/products/:id', (req, res) => {
        db.query(
                'UPDATE products SET is_deleted = 1 WHERE id = ?',
                [req.params.id],
                (err) => {
                        if (err) return res.status(500).json({error: err.message});
                        res.json({ message: 'Product soft-deleted' });
                }
        );
});

// Undo Soft Deleted
app.put('/products/restore/:id', (req, res) => {
        db.query(
                'UPDATE products SET is_deleted = 0 WHERE id = ?',
                [req.params.id],
                (err) => {
                        if (err) return res.status(500).json({error: err.message});
                        res.json({ message: 'Product restored' });
                }
        );
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});


