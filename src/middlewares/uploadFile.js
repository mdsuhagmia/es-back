const multer = require('multer')
const { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, UPLOAD_USER_IMAGE_DIRECTORY, UPLOAD_PRODUCT_IMAGE_DIRECTORY } = require('../config');

const UserStorage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   cb(null, UPLOAD_USER_IMAGE_DIRECTORY)
  // },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  },
});

const productStorage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   cb(null, UPLOAD_PRODUCT_IMAGE_DIRECTORY)
  // },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  },
});

const fileFilter = (req, file, cb)=>{
  if(!file.mimetype.startsWith("image/")){
    return cb(new Error("Only image file are allowed"), false);
  }
  if(file.size > MAX_FILE_SIZE){
    return cb(new Error("File size exists the maximum limit"), false);
  }
  if(!ALLOWED_FILE_TYPES.includes(file.mimetype)){
    return cb(new Error("File extention is not allowed"), false);
  }
  cb(null, true);
}

const uploadUserImage = multer({
  storage: UserStorage,
  fileFilter: fileFilter
})

const uploadProductImage = multer({
  storage: productStorage,
  fileFilter: fileFilter
})

module.exports = {uploadUserImage, uploadProductImage};