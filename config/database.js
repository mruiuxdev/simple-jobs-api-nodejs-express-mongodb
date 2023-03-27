"use strict";

const mongoose = require("mongoose");

const connectDB = () => mongoose.connect(process.env.DB_LOCAL_URL);

if (connectDB) {
  console.log("Connected to MongoDB");
} else {
  console.log("Could not connect to MongoDB");
}

module.exports = connectDB;
