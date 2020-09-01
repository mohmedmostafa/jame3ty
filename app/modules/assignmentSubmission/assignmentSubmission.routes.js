const multer = require('multer');
const { AuthJwt } = require('../../middleware');
const { ValidateResponse } = require('../../common/response.handler');
const AssignmentSubmissionValidation = require('./controller/assignmentSubmission.validation');
const AssignmentSubmissionController = require('./controller/assignmentSubmission.controller');
const FileUploader = require('../../common/multerConfig');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  const upload_addAssignmentSubmission = FileUploader.upload.fields([
    {
      name: 'attachments',
      maxCount: 10,
    },
  ]);

  app.post(
    '/api/addAssignmentSubmission',
    (req, res, next) => {
      upload_addAssignmentSubmission(req, res, (err) => {
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
      AssignmentSubmissionValidation.addAssignmentSubmissionValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructor,
    ],
    AssignmentSubmissionController.addAssignmentSubmission
  );

  app.post(
    '/api/deleteAssignmentSubmission/:id',
    FileUploader.upload.none(),
    [
      AssignmentSubmissionValidation.deleteAssignmentSubmissionValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructor,
    ],
    AssignmentSubmissionController.deleteAssignmentSubmission
  );

  app.post(
    '/api/deleteAttachment/:id',
    FileUploader.upload.none(),
    [
      AssignmentSubmissionValidation.deleteAttachmentValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructor,
    ],
    AssignmentSubmissionController.deleteAttachment
  );

  app.get(
    '/api/listAssignmentSubmissionById/:id',
    FileUploader.upload.none(),
    [
      AssignmentSubmissionValidation.listAssignmentSubmissionByIdValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrAdmin,
    ],
    AssignmentSubmissionController.listAssignmentSubmissionById
  );

  app.get(
    '/api/listAssignmentSubmission',
    FileUploader.upload.none(),
    [
      AssignmentSubmissionValidation.listAssignmentSubmissionValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrAdmin,
    ],
    AssignmentSubmissionController.listAssignmentSubmission
  );

  const upload_updateAssignmentSubmission = FileUploader.upload.fields([
    {
      name: 'attachments',
      maxCount: 10,
    },
  ]);

  app.post(
    '/api/updateAssignmentSubmission/:id',
    (req, res, next) => {
      upload_updateAssignmentSubmission(req, res, (err) => {
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
      AssignmentSubmissionValidation.updateAssignmentSubmissionValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructor,
    ],
    AssignmentSubmissionController.updateAssignmentSubmission
  );
};
