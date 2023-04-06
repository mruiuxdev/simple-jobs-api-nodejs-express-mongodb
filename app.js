const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const errorMiddleware = require("./middleware/error");

dotenv.config({ path: "./config/.env" });

process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to handled uncaught exception");
  process.exit(1);
});

connectDB();

const app = express();
const port = process.env.PORT;

app.use(express.json());

const apiVersion = process.env.API_VERSION_ONE;

const jobsRoutes = require("./routes/jobs");
const authRoutes = require("./routes/auth");

const ErrorHandler = require("./utils/errorHandler");

app.use(apiVersion, jobsRoutes);
app.use(apiVersion, authRoutes);

app.all("*", (req, res, next) =>
  next(new ErrorHandler(`${req.originalUrl} not found`, 404))
);

app.use(errorMiddleware);

const server = app.listen(port, () =>
  console.log(`Server started on port ${port}`)
);

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to unhandled promise rejection");
  server.close(() => process.exit(1));
});
