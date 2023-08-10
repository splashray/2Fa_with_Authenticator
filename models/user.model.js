const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  otp_enabled: { type: Boolean, default: false },
  otp_verified: { type: Boolean, default: false },
  otp_ascii: { type: String },
  otp_hex: { type: String },
  otp_base32: { type: String },
  otp_auth_url: { type: String }
}, { 
  collection: 'users',
  timestamps: true 
});

const User = mongoose.model('User', userSchema);

module.exports = User;
