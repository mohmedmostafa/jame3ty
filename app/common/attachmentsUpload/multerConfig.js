const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
//
const {
  ValidateResponse,
  ResponseConstants,
} = require('../../common/response/response.handler');
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

//----------------------------------------------------------------
const valid_mim_types_constants = {
  IMAGE: ['image/jpg', 'image/png', 'image/jpeg'],
  VEDIO: ['video/mp4'],
  FILE_PDF: ['application/pdf'],
  FILE_WORD: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  FILE_POWERPOINT: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  FILE_EXCEL: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  FILE_COMPRESSED: [
    'application/vnd.rar',
    'application/zip',
    'application/x-7z-compressed',
  ],
  FILE_ANY: [
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
    'image/jpg',
    'image/png',
    'image/jpeg',
  ],
};

const valid_form_data_param_names_constants = {
  VALID_FORM_DATA_PARAM_NAMES_WITH_MIM_TYPES: [
    ['img', valid_mim_types_constants.IMAGE],
    ['img1', valid_mim_types_constants.IMAGE],
    ['vedio', valid_mim_types_constants.VEDIO],
    ['file', valid_mim_types_constants.FILE_ANY],
    ['file1', valid_mim_types_constants.FILE_ANY],
    ['attachments', valid_mim_types_constants.FILE_ANY],
    ['pdf', valid_mim_types_constants.FILE_PDF],
    ['pdf1', valid_mim_types_constants.FILE_PDF],
    ['word', valid_mim_types_constants.FILE_WORD],
    ['powerpoint', valid_mim_types_constants.FILE_POWERPOINT],
    ['excel', valid_mim_types_constants.FILE_EXCEL],
    ['compressed', valid_mim_types_constants.FILE_COMPRESSED],
  ],
};

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
      valid_form_data_param_names_constants
        .VALID_FORM_DATA_PARAM_NAMES_WITH_MIM_TYPES[index][0];
    const VaildMimTypes =
      valid_form_data_param_names_constants
        .VALID_FORM_DATA_PARAM_NAMES_WITH_MIM_TYPES[index][1];

    //In case of NOT a valid Min type
    if (VaildMimTypes.indexOf(file.mimetype) === -1) {
      req.fileVaildMimTypesError = file;

      return cb({ VaildMimTypes }, false);
    }

    return cb(null, true);
  }
}

//-----------------------------------------------------------------
//Extract the valid params names
function validForm_DataParamNames() {
  let valid = [];
  valid_form_data_param_names_constants.VALID_FORM_DATA_PARAM_NAMES_WITH_MIM_TYPES.forEach(
    (type) => {
      valid.push(type[0]);
    }
  );
  return valid;
}

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
          ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
            .FILE_EXTENSION_INVALID,
          [
            ResponseConstants.ERROR_MESSAGES.FILE_EXTENSION_INVALID,
            VaildMimTypes,
            file,
          ]
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
  valid_form_data_param_names_constants.VALID_FORM_DATA_PARAM_NAMES_WITH_MIM_TYPES.forEach(
    (type, index) => {
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
    }
  );
}

function validateFileAfterUpdate_(req, res, next, upload_callback) {
  upload_callback(req, res, (err) => {
    //If file ext invalid
    if (req.fileVaildMimTypesError) {
      this.onErrorDeleteFiles(req);
      return ValidateResponse(
        res,
        ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
          .FILE_EXTENSION_INVALID,
        [
          ResponseConstants.ERROR_MESSAGES.FILE_EXTENSION_INVALID,
          req.fileVaildMimTypesError,
          err,
        ]
      );
    }

    //If Unexpected form-data field ERROR
    if (
      err instanceof multer.MulterError &&
      err.message === 'Unexpected field'
    ) {
      this.onErrorDeleteFiles(req);
      return ValidateResponse(
        res,
        ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
          .UNEXPECTED_FIELD,
        [
          ResponseConstants.ERROR_MESSAGES.UNEXPECTED_FIELD,
          { VaildFormDataParamNames: exports.validForm_DataParamNames() },
          err,
        ]
      );
    }

    //Other Errors
    if (err) {
      console.log(err);
      //this.onErrorDeleteFiles(req);
      return ValidateResponse(
        res,
        ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
          .MULTER_UNEXPECTED_ERROR,
        [ResponseConstants.ERROR_MESSAGES.MULTER_UNEXPECTED_ERROR, err]
      );
    }

    return next();
  });
}
function deleteFile(path) {
  console.log(path);
  unlinkAsync(path).catch((err) => {
    console.log(err);
  });
}

//module.exports.validForm_DataParamNames_With_Mimtypes = validForm_DataParamNames_With_Mimtypes;
module.exports.onErrorDeleteFiles = onErrorDeleteFiles;
module.exports.validForm_DataParamNames = validForm_DataParamNames;
module.exports.onErrorDeleteFiles = onErrorDeleteFiles;
module.exports.validateFileAfterUpdate = validateFileAfterUpdate_;
module.exports.deleteFile = deleteFile;

//--------

//------------------------------------------------------------------
//Valid Mim Types
// const imageVaildMimTypes = ['image/jpg', 'image/png', 'image/jpeg'];

// const vedioVaildMimTypes = ['video/mp4'];

// const fileValidMinTypes_all = [
//   'image/jpg',
//   'image/png',
//   'image/jpeg',
//   'video/mp4',
//   'application/pdf',
//   'application/msword',
//   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//   'application/vnd.ms-powerpoint',
//   'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//   'application/vnd.ms-excel',
//   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//   'application/vnd.rar',
//   'application/zip',
//   'application/x-7z-compressed',
//   'image/jpg',
//   'image/png',
//   'image/jpeg',
// ];

// const filesVaildMimTypes_OnlyPDF = ['application/pdf'];

// const filesVaildMimTypes_OnlyWORD = [
//   'application/msword',
//   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// ];

// const filesVaildMimTypes_OnlyPOWERPOINT = [
//   'application/vnd.ms-powerpoint',
//   'application/vnd.openxmlformats-officedocument.presentationml.presentation',
// ];

// const filesVaildMimTypes_OnlyEXCEL = [
//   'application/vnd.ms-excel',
//   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
// ];

// const filesValidMimTypes_OnlyCOMPRESSED = [
//   'application/vnd.rar',
//   'application/zip',
//   'application/x-7z-compressed',
// ];

//------------------------------------------------------------------
//NOTE: Parameter Name in (form-data) MUST be 1 of these names:-
//[img, vedio, file, pdf, word, powerpoint, excel, compressed]
// const validForm_DataParamNames_With_Mimtypes = [
//   ['img', imageVaildMimTypes],
//   ['img1', imageVaildMimTypes],
//   ['vedio', vedioVaildMimTypes],
//   ['file', fileValidMinTypes_all],
//   ['file1', fileValidMinTypes_all],
//   ['pdf', filesVaildMimTypes_OnlyPDF],
//   ['pdf1', filesVaildMimTypes_OnlyPDF],
//   ['word', filesVaildMimTypes_OnlyWORD],
//   ['powerpoint', filesVaildMimTypes_OnlyPOWERPOINT],
//   ['excel', filesVaildMimTypes_OnlyEXCEL],
//   ['compressed', filesValidMimTypes_OnlyCOMPRESSED],
//   ['attachments', fileValidMinTypes_all],
// ];
