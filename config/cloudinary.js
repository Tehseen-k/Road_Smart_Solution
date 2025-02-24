const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME??"dhjgywp9k",
  api_key: process.env.CLOUDINARY_API_KEY??"395146622246596",
  api_secret: process.env.CLOUDINARY_API_SECRET??"TpBRS_lO_L5SdZN22_QyzNxxkuk",
});

module.exports = cloudinary;