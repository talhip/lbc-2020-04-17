require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const formidable = require("express-formidable");
const compression = require("compression");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;
const app = express();
app.use(formidable());
app.use(compression());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// Configure to Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Import user-model
const User = require("./models/user-model");

// Import offer-model
const Offer = require("./models/offer-model");

// Import user routes
const userRoutes = require("./routes/user-route");

// Active userRoutes routes
app.use(userRoutes);

// Import offer routes
const offerRoutes = require("./routes/offer-route");

// Active offerRoutes routes
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "Page not found" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
