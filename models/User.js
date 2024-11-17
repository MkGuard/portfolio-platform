const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  is2FAEnabled: { type: Boolean, default: false },
  twoFASecret: { type: String, default: "" }
});

module.exports = mongoose.model("User", userSchema);