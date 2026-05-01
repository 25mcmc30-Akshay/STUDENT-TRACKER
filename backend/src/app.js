const express = require("express");
const app = express();

app.use(express.json());

// ✅ IMPORT ROUTES
const studentRoutes = require("./routes/studentRoutes");

// ✅ CONNECT ROUTES
app.use("/api", studentRoutes);

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

module.exports = app;