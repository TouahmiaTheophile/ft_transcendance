/**
 * Second security check if start.sh is bypass
 *
 * Validates environment variables before starting the server.
 * Ensures all database credentials conform to the allowed character set.
 */
    function validateEnvironment() {
        const validPattern = /^[a-zA-Z0-9.-]+$/;
        const requiredVars = ['DB_USER', 'DB_PASSWORD', 'DB_NAME'];

        requiredVars.forEach((varName) => {
            const value = process.env[varName];
            if (!value || !validPattern.test(value)) {
                console.error(`FATAL CONFIG ERROR: Environment variable '${varName}' is missing or contains invalid characters.`);
                process.exit(1);
            }
        });
    }

    // Execute validation before app initialization
    validateEnvironment();



/*
    CECI EST LA VERSION SANS PRISMA,
    DANS LES FONCTIONS IL FAUT ECRIRE LES REQUETES SQL ET DEMANDER EXACTEMENT LES BONS PARAMETRES
      (ligne 60 - 61)
    DANS LA VERSION PRISMA POUR POST (CREATE) UNE FONCTION EST APPELE POUR CHECK CERTAINS ATTRIBUTS,
    MAIS POUR L'AJOUT IL Y A SIMPLEMENT .create({data: data}) => AUCUN BESOIN D'ADAPTER
*/

//    CRUD      //

const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

let pool;

async function connectDB() {
  pool = await mysql.createPool(dbConfig);
  console.log('Connected to MariaDB database');
}

connectDB();

// Create a user
app.post('/users', async (req, res) => {
  try {
    const { username, email } = req.body;
    await pool.execute('INSERT INTO users (username, email) VALUES (?, ?)', [username, email]);
    res.status(201).send('User created');
  } catch (err) {
    res.status(500).send(err.message);
  }
});
// // Create a user
// app.post('/users', async (req, res) => {
//   try {
//     const { username } = req.body;
//     await pool.execute('INSERT INTO users (username) VALUES (?)', [username]);
//     res.status(201).send('User created');
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });

// Read all users
app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update a user
app.put('/users/:id', async (req, res) => {
  try {
    const { username, email } = req.body;
    await pool.execute('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, req.params.id]);
    res.send('User updated');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete a user
app.delete('/users/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.send('User deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => console.log('API running on port 3000'));