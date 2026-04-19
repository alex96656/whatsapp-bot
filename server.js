const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

// import routes
const pairRoute = require("./routes/pair");

// use routes
app.use("/api", pairRoute);

// test route
app.get("/", (req, res) => {
  res.send("Backend API is running");
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});