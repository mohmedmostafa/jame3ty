const multer = require('multer');
const FileUploader = require('../../common/attachmentsUpload/multerConfig');
const { AuthJwt } = require('../../middleware');

const {
  ValidateResponse,
  ResponseConstants,
} = require('../../common/response/response.handler');
const CourseSubscribeValidation = require('./controller/courseSubscribe.validation');
const CourseSubscribeController = require('./controller/courseSubscribe.controller');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.post(
    '/api/generatePaymentRequest',
    FileUploader.upload.none(),
    //[AuthJwt.VerifyToken, AuthJwt.isStudentorOrAdmin],
    CourseSubscribeController.generatePaymentRequest
  );

  app.get(
    '/api/success_urlPaymentRequest',
    FileUploader.upload.none(),
    CourseSubscribeController.success_urlPaymentRequest
  );

  app.get(
    '/api/error_urlPaymentRequest',
    FileUploader.upload.none(),
    CourseSubscribeController.error_urlPaymentRequest
  );
};
