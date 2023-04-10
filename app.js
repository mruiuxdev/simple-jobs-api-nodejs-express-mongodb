const express = require("express");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const bodyParser = require("body-parser");

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

const limiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 100,
});

app
	.use(bodyParser.urlencoded({ extended: true }))
	.use(express.static("public"))
	.use(helmet())
	.use(express.json())
	.use(cookieParser())
	.use(fileUpload())
	.use(limiter)
	.use(mongoSanitize())
	.use(xssClean())
	.use(
		hpp({
			whitelist: ["positions"],
		})
	)
	.use(cors());

const apiVersion = process.env.API_VERSION_ONE;

const jobsRoutes = require("./routes/jobs");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const ErrorHandler = require("./utils/errorHandler");

app
	.use(apiVersion, jobsRoutes)
	.use(apiVersion, authRoutes)
	.use(apiVersion, userRoutes);

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
