const mongoose = require("mongoose");
// mongodb://127.0.0.1:27017/jobs
const connectDB = async () =>
	await mongoose.connect(process.env.DB_LOCAL_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

if (connectDB) {
	console.log("Connected to MongoDB");
} else {
	console.log("Could not connect to MongoDB");
}

module.exports = connectDB;
