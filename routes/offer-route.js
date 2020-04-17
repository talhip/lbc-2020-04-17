const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const compression = require("compression");
const User = require("../models/user-model");
const Offer = require("../models/offer-model");
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middlewares/is-authenticated");

// Post an offer
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  const user = req.user;
  try {
    const result = await cloudinary.uploader.upload(req.files.picture.path);
    const offer = new Offer({
      created: Date.now(),
      creator: user._id,
      description: req.fields.description,
      picture: result,
      price: req.fields.price,
      title: req.fields.title,
    });
    await offer.save();
    return res.json({
      created: offer.created,
      creator: {
        account: {
          username: user.account.username,
          phone: user.account.phone,
        },
        _id: user._id,
      },
      description: offer.description,
      picture: result,
      price: offer.price,
      title: offer.title,
      _id: offer._id,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// Get all offers
router.get("/offer/with-count", async (req, res) => {
  try {
    const filters = {};

    if (req.query.title) {
      filters.title = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMax) {
      filters.price = {};
      filters.price.$lte = req.query.priceMax;
    }

    if (req.query.priceMin) {
      if (filters.price === undefined) {
        filters.price = {};
      }
      filters.price.$gte = req.query.priceMin;
    }

    let sort = {};

    if (req.query.sort === "date-desc") {
      sort = { created: "desc" };
    } else if (req.query.sort === "date-asc") {
      sort = { created: "asc" };
    } else if (req.query.sort === "price-asc") {
      sort = { price: "asc" };
    } else if (req.query.sort === "price-desc") {
      sort = { price: "desc" };
    }

    const count = await Offer.countDocuments(filters);

    let page = Number(req.query.page);
    if (!page) {
      page = 1;
    }

    let limit = 2;

    const offers = await Offer.find(filters)
      .select("title price created creator picture.secure_url description")
      .populate({
        path: "creator",
        select: "account.username account.phone",
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sort);

    return res.json({
      count: count,
      offers: offers,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// Delete an offer
router.delete("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    const offer = await Offer.findById(req.fields.id);
    await cloudinary.uploader.destroy(offer.picture[0].public_id);
    await offer.remove();
    res.json({ message: "Offer successfully removed" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
