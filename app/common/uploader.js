const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
//
const { ValidateResponse } = require('../common/response.handler');
const multer = require('multer');
const path = require('path');

const maxSize = 500 * 1024 * 1024;

//----------------------------------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    console.log(ext);
    //Images
    if (ext === '.jpg' || ext === '.png' || ext === '.jpeg') {
      cb(null, './public/images/');
    } else if (ext === 'mp4') {
      //Vedio
      cb(null, './public/vedio/');
    } else if (ext === '.rar' || ext === '.zip' || ext === '.7z') {
      //Compressed Files
      cb(null, './public/files/compressed/');
    } else if (
      ext === '.pdf' ||
      ext === '.doc' ||
      ext === '.docx' ||
      ext === '.ppt' ||
      ext === '.pptx' ||
      ext === '.xls' ||
      ext === '.xlsx'
    ) {
      //Files
      cb(null, './public/files/');
    } else {
      //Other Extention
      cb(null, './public/others/');
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

upload = multer({ storage: storage });

//------------------------------------------------------------------
//Valid Mim Types
const imageVaildMimTypes = ['image/jpg', 'image/png', 'image/jpeg'];

const vedioVaildMimTypes = ['video/mp4'];

const fileValidMinTypes_all = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.rar',
  'application/zip',
  'application/x-7z-compressed',
];

const filesVaildMimTypes_OnlyPDF = ['application/pdf'];

const filesVaildMimTypes_OnlyWORD = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const filesVaildMimTypes_OnlyPOWERPOINT = [
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const filesVaildMimTypes_OnlyEXCEL = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const filesValidMimTypes_OnlyCOMPRESSED = [
  'application/vnd.rar',
  'application/zip',
  'application/x-7z-compressed',
];

//------------------------------------------------------------------
//NOTE: Parameter Name in (form-data) MUST be 1 of these names:-
//[img, vedio, file, pdf, word, powerpoint, excel, compressed]
const validForm_DataParamNames_With_Mimtypes = [
  ['img', imageVaildMimTypes],
  ['vedio', vedioVaildMimTypes],
  ['file', fileValidMinTypes_all],
  ['pdf', filesVaildMimTypes_OnlyPDF],
  ['word', filesVaildMimTypes_OnlyWORD],
  ['powerpoint', filesVaildMimTypes_OnlyPOWERPOINT],
  ['excel', filesVaildMimTypes_OnlyEXCEL],
  ['compressed', filesValidMimTypes_OnlyCOMPRESSED],
];

//-----------------------------------------------------------------
//Extract the valid params names
validForm_DataParamNames = () => {
  let valid = [];
  validForm_DataParamNames_With_Mimtypes.forEach((type) => {
    valid.push(type[0]);
  });
  return valid;
};

//------------------------------------------------------------------
//NOTE: Parameter Name in (form-data) MUST be 1 of these names:-
//[img, vedio, file, pdf, word, powerpoint, excel, compressed]
//Upload Multi Fields and Return Paths to be stored in DB
uploadMultiFields_With_MultiFiles = (req, res, next) => {
  try {
    console.log(req.files);
    console.log(req.files);

    validForm_DataParamNames_With_Mimtypes.forEach((type, index) => {
      if (req.files[type[0]]) {
        validateFieldMimTypes(req, res, type[0], type[1]);
      }
    });

    //Create Path String to Store to DB
    //let attachmentLocations = req.files.map((file) => {});
    //console.log(attachmentLocations);
    next();
    return;
  } catch (error) {
    if (error instanceof multer.MulterError) {
      console.log('ERRRRRRRR');
    }
    next();
    return;
  }
};

//----------------------------------------------------------
//Validate ONE Field against it Mim Types
validateFieldMimTypes = (req, res, validParamName, VaildMimTypes) => {
  if (req.files[validParamName].length > 0) {
    req.files[validParamName].forEach((file, index) => {
      if (file.fieldname === validParamName) {
        if (VaildMimTypes.indexOf(file.mimetype) === -1) {
          //Delete the file
          unlinkAsync(file.path);

          return ValidateResponse(
            res,
            'File Extension Not Valid, Only Accept: ' + VaildMimTypes,
            { file }
          );
        }
      }
    });
  }
};

//----------------------------------------------------------
onErrorDeleteFiles = (req, Uploader) => {
  Uploader.validForm_DataParamNames_With_Mimtypes.forEach((type, index) => {
    const validParamName = type[0];
    if (req.files[validParamName]) {
      req.files[validParamName].forEach((file) => {
        //Delete the file
        unlinkAsync(file.path);
      });
    }
  });
};
//----------------------------------------------------------
const uploader = {
  upload: upload,
  validForm_DataParamNames_With_Mimtypes: validForm_DataParamNames_With_Mimtypes,
  uploadMultiFields_With_MultiFiles: uploadMultiFields_With_MultiFiles,
  validForm_DataParamNames: validForm_DataParamNames(),
  onValidationErrorDelete: onErrorDeleteFiles
};

module.exports = uploader;
