const multer = require('multer');
const { AuthJwt } = require('../../middleware');
const { ValidateResponse } = require('../../common/response.handler');
const CourseValidation = require('./controller/courses.validation');
const CourseController = require('./controller/courses.controller');
const FileUploader = require('../../common/multerConfig');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  //name: FileUploader.validForm_DataParamNames()[2], //vedio0

  const upload_addCourse = FileUploader.upload.fields([
    {
      name: 'img',
      maxCount: 2,
    },
    {
      name: 'vedio',
      maxCount: 1,
    },
  ]);

  app.post(
    '/api/addCourse/:method',
    (req, res, next) => {
      upload_addCourse(req, res, (err) => {
        if (req.fileVaildMimTypesError) {
          return ValidateResponse(res, err, req.fileVaildMimTypesError);
        }

        //If Unexpected field ERROR
        if (
          err instanceof multer.MulterError &&
          err.message === 'Unexpected field'
        ) {
          FileUploader.onErrorDeleteFiles(req);
          return ValidateResponse(
            res,
            err,
            FileUploader.validForm_DataParamNames()
          );
        }

        //Other Errors
        if (err) {
          FileUploader.onErrorDeleteFiles(req);
          return ValidateResponse(res, err, {});
        }

        return next();
      });
    },
    [
      CourseValidation.addCourseValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructor,
    ],
    CourseController.addCourse
  );
};
