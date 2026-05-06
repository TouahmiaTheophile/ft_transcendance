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



const express = require('express');
const { PrismaClient } = require('@prisma/client'); // Imports PrismaClient

const app = express();
app.use(express.json());

// Initialize client, automatically handled using DATABASE_URL variable
const prisma = new PrismaClient();

//    CRUD      //


/**
 * Validates user creation data.
 * Returns an object with success status and error details.
 * @param {Object} data - Raw data from request body
 * @returns {Object} { success: boolean, data?: Object, error?: string }
 */
function validateUserData(data) {
  // Check required fields
  if (!data.username) {
    return { success: false, error: 'Username is required' };
  }
  if (!data.email) {
    return { success: false, error: 'Email is required' };
  }

  // Validate username (min 3 chars, alphanumeric + dots/hyphens)
  if (data.username.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters long' };
  }
  if (!/^[a-zA-Z0-9.-]+$/.test(data.username)) {
    return { success: false, error: 'Username can only contain letters, numbers, dots and hyphens' };
  }

  // Validate email format
  if (!data.email.includes('@') || !data.email.includes('.')) {
    return { success: false, error: 'Email must contain @ and a dot (.)' };
  }

  // Validate age if provided (optional field)
  if (data.age !== undefined) {
    if (isNaN(data.age)) {
      return { success: false, error: 'Age must be a valid number' };
    }
    if (data.age < 0) {
      return { success: false, error: 'Age cannot be negative' };
    }
    if (data.age > 120) {
      return { success: false, error: 'Age cannot exceed 120' };
    }
  }

  return { success: true, data };
}

// Create a user
app.post('/users', async (req, res) => {
  try {
    // Application logic checks
    const validation = validateUserData(req.body);

    // Return precise error message
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    // Prisma attempts to create the user
    const newUser = await prisma.user.create({
      data: validation.data,
    });

    res.status(201).json(newUser);
  } catch (err) {
    // Errors due to database constraints (@Unique, @Not Null etc)

    // @Unique
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    res.status(500).json({ error: err.message });
  }
});

// Read all users
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update a user
app.put('/users/:id', async (req, res) => {
  try {
    const { username, email } = req.body;
    const updated = await prisma.user.update({
      where: { id: parseInt(req.params.id) }, // Prisma expects ID in number
      data: { username, email },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete a user
app.delete('/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.send('User deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => console.log('API running with Prisma on port 3000'));
