import dotenv from 'dotenv'
import express, { Express, Request, Response, NextFunction } from 'express'
import { connectToDB } from './configs/db';
import identifyRoutes from './routes/identifyRoutes';

dotenv.config()


const app: Express = express()

// Middleware
app.use(express.json())

const port = process.env.PORT || 3000

// API Routes
app.use('/api/v1/identify', identifyRoutes)


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
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

export default app;