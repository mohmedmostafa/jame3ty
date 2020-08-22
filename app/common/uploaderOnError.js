const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

//----------------------------------------------------------
//Delete the files uploaded if error happend -> Called in Validation Files if Validation Error Happend
exports.onErrorDeleteFiles = (req, Uploader) => {
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
