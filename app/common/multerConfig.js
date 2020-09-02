const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
//
const { ValidateResponse } = require('./response.handler');
const multer = require('multer');
const path = require('path');

const maxSize = 500 * 1024 * 1024;

//----------------------------------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    ext = ext.toLowerCase();
    //Images
    if (ext === '.jpg' || ext === '.png' || ext === '.jpeg') {
      cb(null, './public/images/');
    } else if (ext === '.mp4') {
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

exports.upload = multer({ storage: storage, fileFilter: fieldsFileFilter });

//------------------------------------------------------------------
//------------------------------------------------------------------
//NOTE: Parameter Name in (form-data) MUST be 1 of these names:-
//[img, vedio, file, pdf, word, powerpoint, excel, compressed]
//Upload Multi Fields and Return Paths to be stored in DB
function fieldsFileFilter(req, file, cb) {
  console.log(req.body);
  let index = exports.validForm_DataParamNames().indexOf(`${file.fieldname}`);
  console.log(index);

  if (index > -1) {
    const validParamName =
      exports.validForm_DataParamNames_With_Mimtypes[index][0];
    const VaildMimTypes =
      exports.validForm_DataParamNames_With_Mimtypes[index][1];

    //In case of NOT a valid Min type
    if (VaildMimTypes.indexOf(file.mimetype) === -1) {
      req.fileVaildMimTypesError = file;

      return cb(
        `File Extension Not Valid, Only Accept { ${VaildMimTypes} }`,
        false
      );
    }

    return cb(null, true);
  }
}

//-----------------------------------------------------------------
//Extract the valid params names
function validForm_DataParamNames() {
  let valid = [];
  exports.validForm_DataParamNames_With_Mimtypes.forEach((type) => {
    valid.push(type[0]);
  });
  return valid;
}

//------------------------------------------------------------------
//Valid Mim Types
const imageVaildMimTypes = ['image/jpg', 'image/png', 'image/jpeg'];

const vedioVaildMimTypes = ['video/mp4'];

const fileValidMinTypes_all = [
  'image/jpg',
  'image/png',
  'image/jpeg',
  'video/mp4',
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
  'image/jpg', 'image/png', 'image/jpeg'
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
  ['img1', imageVaildMimTypes],
  ['vedio', vedioVaildMimTypes],
  ['file', fileValidMinTypes_all],
  ['file1', fileValidMinTypes_all],
  ['pdf', filesVaildMimTypes_OnlyPDF],
  ['pdf1', filesVaildMimTypes_OnlyPDF],
  ['word', filesVaildMimTypes_OnlyWORD],
  ['powerpoint', filesVaildMimTypes_OnlyPOWERPOINT],
  ['excel', filesVaildMimTypes_OnlyEXCEL],
  ['compressed', filesValidMimTypes_OnlyCOMPRESSED],
  ['attachments', fileValidMinTypes_all],
];

//----------------------------------------------------------
//Validate ONE Field against it Mim Types
function validateFieldMimTypesAndCreatePaths(
  req,
  res,
  validParamName,
  VaildMimTypes
) {
  let fieldUrls = [];
  if (req.files[validParamName].length > 0) {
    req.files[validParamName].forEach((file, index) => {
      if (VaildMimTypes.indexOf(file.mimetype) === -1) {
        //Delete the file
        unlinkAsync(file.path);

        return ValidateResponse(
          res,
          'File Extension Not Valid, Only Accept: ' + VaildMimTypes,
          { file }
        );
      } else {
        let fileUrl = file.path.replace(/\\/g, '/').substring('public'.length);
        fieldUrls.push(fileUrl);
      }
    });

    return fieldUrls;
  }
}

//----------------------------------------------------------
//Delete the files uploaded if error happend -> Called in Validation Files if Validation Error Happend
function onErrorDeleteFiles(req) {
  exports.validForm_DataParamNames_With_Mimtypes.forEach((type, index) => {
    const validParamName = type[0];
    if (req.files[validParamName]) {
      req.files[validParamName].forEach((file) => {
        //Delete the file
        if (file.buffer) {
          unlinkAsync(file.buffer);
        }

        if (file.path) {
          unlinkAsync(file.path);
        }
      });
    }
  });
}

function validateFileAfterUpdate_(req,res,next,upload_callback){
  console.log("m1");
    upload_callback(req, res, (err) => {
      console.log("m2");
        if (req.fileVaildMimTypesError) {
          return ValidateResponse(res, err, req.fileVaildMimTypesError);
        }
         //If Unexpected field ERROR
        if (
          err instanceof multer.MulterError &&
          err.message === 'Unexpected field'
        ) {
          this.onErrorDeleteFiles(req);
          return ValidateResponse(
            res,
            err,
            this.validForm_DataParamNames()
          );
        }

        //Other Errors
        if (err) {
          console.log("m4",err);
          //this.onErrorDeleteFiles(req);
          return ValidateResponse(res, err, {});
        }
        console.log("m3");
        return next();
      });
};
function deleteFile(path) {
  console.log(path);
  unlinkAsync(path).catch((err) => {
    console.log(err);
  });
}

module.exports.onErrorDeleteFiles = onErrorDeleteFiles;
module.exports.validForm_DataParamNames_With_Mimtypes = validForm_DataParamNames_With_Mimtypes;
module.exports.validForm_DataParamNames = validForm_DataParamNames;
module.exports.onErrorDeleteFiles = onErrorDeleteFiles;
module.exports.validateFileAfterUpdate=validateFileAfterUpdate_;
module.exports.deleteFile = deleteFile;
