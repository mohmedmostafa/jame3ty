const multer = require('multer');
const { AuthJwt } = require('../../middleware');
const { ValidateResponse } = require('../../common/response/response.handler');
const LessonValidation = require('./controller/lesson.validation');
const LessonController = require('./controller/lesson.controller');
const FileUploader = require('../../common/attachmentsUpload/multerConfig');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  const upload_addLesson = FileUploader.upload.fields([
    {
      name: 'attachments',
      maxCount: 10,
    },
  ]);

  app.post(
    '/api/addLesson',
    (req, res, next) => {
      upload_addLesson(req, res, (err) => {
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
      LessonValidation.addLessonValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructor,
    ],
    LessonController.addLesson
  );

  app.post(
    '/api/deleteLesson/:id',
    FileUploader.upload.none(),
    [
      LessonValidation.deleteLessonValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructor,
    ],
    LessonController.deleteLesson
  );

  app.post(
    '/api/deleteLessonAttachment/:id',
    FileUploader.upload.none(),
    [
      LessonValidation.deleteAttachmentValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructor,
    ],
    LessonController.deleteAttachment
  );

  app.get(
    '/api/listLessonById/:id',
    FileUploader.upload.none(),
    [
      LessonValidation.listLessonByIdValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    LessonController.listLessonById
  );

  app.get(
    '/api/listLesson',
    FileUploader.upload.none(),
    [
      LessonValidation.listLessonValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    LessonController.listLesson
  );

  const upload_updateLesson = FileUploader.upload.fields([
    {
      name: 'attachments',
      maxCount: 10,
    },
  ]);

  app.post(
    '/api/updateLesson/:id',
    (req, res, next) => {
      upload_updateLesson(req, res, (err) => {
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
      LessonValidation.updateLessonValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructor,
    ],
    LessonController.updateLesson
  );
};
