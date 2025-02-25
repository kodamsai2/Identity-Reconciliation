require('dotenv').config()
const express = require('express')
const { connectToDB } = require('./configs/db');
const identifyRoutes = require('./routes/identifyRoutes');

const app = express()

// Middleware
app.use(express.json())

const port = process.env.PORT || 3000

// API Routes
app.use('/api/v1/identify', identifyRoutes)

app.use((err, req, res, next) => {
  console.error('Global Error:', err.message);
  res.status(500).json({ message: 'Global Error: Internal Server Error', success: false });
});


// Start the server, after connecting to the database.
connectToDB()
  .then(() => {
    console.log("Database connected. Starting server...");
    app.listen(port, () => {
      console.log(`IMF Gadget API is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed. Server will not start.");
    console.error(error);
    process.exit(1); // Exit the process if DB connection fails
  });