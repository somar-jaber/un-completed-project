const multer = require('multer');
const path = require('path');

// Set up storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.mimetype.startsWith('image') ? 'uploads/images/' : 'uploads/videos/';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter to allow specific file types
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|mp4|avi/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed!'), false);
  }
};

// Initialize upload with multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
}).array("files", 10);

// Ensure the uploads directories exist
const fs = require('fs');
const uploadDirs = ['./uploads/images', './uploads/videos'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});


function uploadFun(req, res, next, err, name = "files", limit = 10) {
    upload.array(name, limit)(req, res, next, (err) => { // Change 'files' to your form field name and set the max number of files
        if (err) {
            throw new Error( `${err.message}`);
        }
        next();
    });
}

module.exports.upload = upload;
module.exports.uploadFun = uploadFun;
