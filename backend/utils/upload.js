const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    // console.log('\nUploading file: ==========> ', file.originalname, "\n");
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 99000000 }, // 99MB file size limit
  fileFilter: function (req, file, cb) {
    // console.log('\nFiltering file: =======>', file.originalname, "\n");
    checkFileType(file, cb);
  }
}).array('media', 10); // expecting multiple files with field name 'media'

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|mp4|avi/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images and Videos only!');
  }
}

module.exports.upload = upload;
