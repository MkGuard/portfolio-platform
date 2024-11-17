const mongoose = require("mongoose");

const portfolioItemSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String },
});

module.exports = mongoose.model("PortfolioItem", portfolioItemSchema);
