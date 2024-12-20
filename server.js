const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");

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
app.use("/api/user", userRoutes);

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