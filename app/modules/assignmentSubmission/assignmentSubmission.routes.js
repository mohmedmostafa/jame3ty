const multer = require('multer');
const { AuthJwt } = require('../../middleware');
const {
  ValidateResponse,
  ResponseConstants,
} = require('../../common/response/response.handler');
const AssignmentSubmissionValidation = require('./controller/assignmentSubmission.validation');
const AssignmentSubmissionController = require('./controller/assignmentSubmission.controller');
const FileUploader = require('../../common/attachmentsUpload/multerConfig');

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
      FileUploader.validateFileAfterUpdate(
        req,
        res,
        next,
        upload_addAssignmentSubmission
      );
    },
    [
      AssignmentSubmissionValidation.addAssignmentSubmissionValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isStudent,
    ],
    AssignmentSubmissionController.addAssignmentSubmission
  );

  app.post(
    '/api/deleteAssignmentSubmission/:id',
    FileUploader.upload.none(),
    [
      AssignmentSubmissionValidation.deleteAssignmentSubmissionValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isStudent,
    ],
    AssignmentSubmissionController.deleteAssignmentSubmission
  );

  app.post(
    '/api/deleteAssignmentSubmissionAttachment/:id',
    FileUploader.upload.none(),
    [
      AssignmentSubmissionValidation.deleteAssignmentSubmissionAttachmentValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isStudent,
    ],
    AssignmentSubmissionController.deleteAttachment
  );

  app.get(
    '/api/listAssignmentSubmissionById/:id',
    FileUploader.upload.none(),
    [
      AssignmentSubmissionValidation.listAssignmentSubmissionByIdValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    AssignmentSubmissionController.listAssignmentSubmissionById
  );

  app.get(
    '/api/listAssignmentsSubmission',
    FileUploader.upload.none(),
    [
      AssignmentSubmissionValidation.listAssignmentsSubmissionValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    AssignmentSubmissionController.listAssignmentsSubmission
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
      FileUploader.validateFileAfterUpdate(
        req,
        res,
        next,
        upload_updateAssignmentSubmission
      );
    },
    [
      AssignmentSubmissionValidation.updateAssignmentSubmissionValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isStudent,
    ],
    AssignmentSubmissionController.updateAssignmentSubmission
  );
};
