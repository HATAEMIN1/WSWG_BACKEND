const multer = require("multer"); // multer is the middleware for handling multipart/form-data used for uploading files
const { v4: uuid } = require("uuid"); // for random string
const mime = require("mime-types");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads"); // upload file to wswg_backend/uploads
  },
  filename: function (req, file, callback) {
    // mime.extension gets the default extension for a content-type
    // here the content-type given as file.mimetype is e.g. image/png
    // then mime.extension finds the default extension for the image/png
    // content type which would be extension .png
    callback(null, uuid() + "." + mime.extension(file.mimetype));
  },
});

/* multer({optionsObject})
  Multer accepts an options object.
  If you omit the options object, the files will be kept in memory and never written to disk.
  */
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (["image/jpeg", "image/png"].includes(file.mimetype)) {
      // err is always the first parameter of a callback, indicating if an error occurred or not.
      // cb = callback function: error (first arg - null if no error occured, otherwise Error object), acceptance flag(second arg - true or false)
      return cb(null, true); // callback function used to control whether an uploaded file should be accepted (true) or rejected(false)
      // based on certain conditions such as file type validation as done here
    } else {
      return cb(
        new Error("invalid file type: only png and jpeg allowed"),
        false
      );
    }
  },
  // no limits specified to file size. e.g. can set limit to filesize like below:
  limits: {
    fileSize: 1024 * 1024 * 3, // Set maximum file size to 3 MB
  },
});

module.exports = { upload };
