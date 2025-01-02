const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const formRoutes = require("./routes/formRoutes");
const folderRoutes = require("./routes/folderRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const responseRoutes = require("./routes/responseRoutes");
const cron = require("node-cron");

const app = express();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use(express.json());

app.get("/test-server", (req, res) => {
  res.send("Server is working");
});

// to keep the web service active on render
cron.schedule("*/14 * * * *", () => {
  axios
    .get("https://formbot-backend-z6fm.onrender.com/test-server")
    .then(() => {
      console.log("Ping Response:");
    })
    .catch((error) => {
      console.error("Error pinging the server:", error);
    });
});

app.use("/api/user", userRoutes);
app.use("/api/form", formRoutes);
app.use("/api/folder", folderRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/response", responseRoutes);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log("connected to DB and server listening on port", PORT);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error.message);
  });
