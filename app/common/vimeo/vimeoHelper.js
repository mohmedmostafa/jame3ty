const Vimeo = require('vimeo').Vimeo;

const {
  VIMEO_CLIENT_ID,
  VIMEO_CLIENT_SECRET,
  VIMEO_ACCESS_TOKEN,
} = require('../../config/env.config');

const VimeoClient = new Vimeo(
  VIMEO_CLIENT_ID,
  VIMEO_CLIENT_SECRET,
  VIMEO_ACCESS_TOKEN
);

const {
  onErrorDeleteFiles,
  deleteFile,
} = require('../../common/attachmentsUpload/multerConfig');

const {
  Response,
  ValidateResponse,
  ResponseConstants,
} = require('../../common/response/response.handler');

//---------------------------------------------------------------
//Upload video from req to vimeo
exports.uploadVideoTOVimeo = (req, res) => {
  return new Promise((resolve, reject) => {
    //Create Attachment String
    //Local File System Path - Multer
    if (req.files.vedio) {
      let field_2 = [];
      req.files['vedio'].forEach((file) => {
        let fileUrl = file.path.replace(/\\/g, '/');
        field_2.push(fileUrl);
      });
      req.body.vedio = field_2.join();
    }

    //Upload to vimeo
    VimeoClient.upload(
      req.body.vedio,
      {
        name: req.files['vedio'][0].originalname,
        description: req.files['vedio'][0].originalname,
      },
      function (uri) {
        console.log('File upload completed. Your Vimeo URI is:', uri);

        //Remove video from local fs
        deleteFile(req.body.vedio);

        //add vimeo video uri to body
        req.body.uri = uri;

        //Success
        return resolve(uri);
      },
      function (bytesUploaded, bytesTotal) {
        var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(bytesUploaded, bytesTotal, percentage + '%');
      },
      function (error) {
        console.log('Failed because: ' + error);

        //Remove video from local fs
        // deleteFile(req.body.vedio);

        //Fail to upload to vimeo
        return reject(error);
      }
    );
  });
};

//-----------------------------------------------
exports.vimeoErrorResHandler = (req, res, error) => {
  switch (error.error_code) {
    case 2205:
      console.log(error);
    //   onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
        ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type
          .VIMEO_ERROR_CODE_2205,
        ResponseConstants.ERROR_MESSAGES.VIMEO_ERROR_CODE_2205
      );
    case 2204:
      console.log(error);
    //   onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
        ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type
          .VIMEO_ERROR_CODE_2204,
        ResponseConstants.ERROR_MESSAGES.VIMEO_ERROR_CODE_2204
      );
    case 2230:
      console.log(error);
    //   onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
        ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type
          .VIMEO_ERROR_CODE_2230,
        ResponseConstants.ERROR_MESSAGES.VIMEO_ERROR_CODE_2230
      );
    case 2511:
      console.log(error);
    //   onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
        ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type
          .VIMEO_ERROR_CODE_2511,
        ResponseConstants.ERROR_MESSAGES.VIMEO_ERROR_CODE_2511
      );
    case 3116:
      console.log(error);
    //   onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
        ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type
          .VIMEO_ERROR_CODE_3116,
        ResponseConstants.ERROR_MESSAGES.VIMEO_ERROR_CODE_3116
      );
    case 8002:
      console.log(error);
    //   onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.code,
        ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type
          .VIMEO_ERROR_CODE_8002,
        ResponseConstants.ERROR_MESSAGES.VIMEO_ERROR_CODE_8002
      );
    case 4102:
      console.log(error);
    //   onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.code,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.type
          .VIMEO_ERROR_CODE_4102,
        ResponseConstants.ERROR_MESSAGES.VIMEO_ERROR_CODE_4102
      );
    case 4101:
      console.log(error);
    //   onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.code,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.type
          .VIMEO_ERROR_CODE_4101,
        ResponseConstants.ERROR_MESSAGES.VIMEO_ERROR_CODE_4101
      );
    case 4003:
      console.log(error);
    //   onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
          .VIMEO_ERROR_CODE_4003,
        ResponseConstants.ERROR_MESSAGES.VIMEO_ERROR_CODE_4003
      );
  }
};
