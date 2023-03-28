const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

dotenv.config({ path: "./config/.env" });
connectDB();

const app = express();
const port = process.env.PORT;

app.use(express.json());

const apiVersion = process.env.API_VERSION_ONE;
const jobsRoutes = require("./routes/jobs");
app.use(apiVersion, jobsRoutes);

app.listen(port, () => console.log(`Server started on port ${port}`));