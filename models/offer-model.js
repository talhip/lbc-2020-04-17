const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  created: Date,
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  description: String,
  picture: [
    {
      type: Object,
    },
  ],
  price: Number,
  title: String,
});

module.exports = Offer;
