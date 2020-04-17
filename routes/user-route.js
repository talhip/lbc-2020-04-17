const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const compression = require("compression");
const User = require("../models/user-model");
const Offer = require("../models/offer-model");
const cloudinary = require("cloudinary").v2;

// Sign up
router.post("/user/sign_up", async (req, res) => {
  try {
    const alreadyUser = await User.findOne({ email: req.fields.email });
    if (!req.fields.username || !req.fields.email || !req.fields.password) {
      return res.status(400).json({
        error: {
          message: "A value is missing",
        },
      });
    } else if (alreadyUser) {
      return res.status(400).json({
        error: {
          message: "Email already exists",
        },
      });
    } else {
      const password = req.fields.password;
      const salt = uid2(16);
      const hash = SHA256(password + salt).toString(encBase64);
      const token = uid2(16);

      const user = new User({
        email: req.fields.email,
        token: token,
        hash: hash,
        salt: salt,
        account: {
          username: req.fields.username,
          phone: req.fields.phone,
        },
      });
      await user.save();
      return res.json({
        _id: user._id,
        token: user.token,
        account: user.account,
      });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// Log in
router.post("/user/log_in", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });
    const password = req.fields.password;
    if (user) {
      const hashToCompare = SHA256(password + user.salt).toString(encBase64);
      if (hashToCompare === user.hash) {
        return res.json({
          _id: user._id,
          token: user.token,
          account: user.account,
        });
      } else {
        return res.status(401).json({
          error: {
            message: "Unauthorized, wrong password",
          },
        });
      }
    } else {
      return res.status(401).json({
        error: {
          message: "Unauthorized, unknown email",
        },
      });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
