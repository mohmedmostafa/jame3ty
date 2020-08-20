const multer = require('multer');
const path = require('path');

const maxSize = 500 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    if (ext === 'jpg') {
      cb(null, './public/images/jpgs/');
    } else if (ext === 'png') {
      cb(null, './public/images/pngs/');
    } else if (ext === 'pdf') {
      cb(null, './public/files/pdfs/');
    } else {
      cb(null, './public/files/others/');
    }
  },
  limits: {
    fieldSize: maxSize,
  },
  filename: function (req, file, cb) {
    cb(
      null,
      path.basename(file.originalname, path.extname(file.originalname)) +
        '-' +
        Date.now() +
        '-' +
        path.extname(file.originalname)
    );
  },
});

const uploader = multer({ storage: storage });

module.exports = uploader;
