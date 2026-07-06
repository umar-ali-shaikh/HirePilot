const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const authrouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes")

// Routes
app.use("/api/auth", authrouter);
app.use("/api/interview", interviewRouter);

module.exports = app;