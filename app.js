"use strict";

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

const app = express();

dotenv.config({ path: "./config/.env" });
connectDB();

const apiVersion = process.env.API_VERSION_ONE;
const jobs = require("./routes/jobs");

app.use(apiVersion, jobs);

const port = process.env.PORT;
app.listen(port, () => console.log(`Server started on port ${port}`));
