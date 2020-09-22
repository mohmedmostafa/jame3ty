const { AuthJwt } = require('../../middleware');
const FileUploader = require('../../common/attachmentsUpload/multerConfig');
const lessonDiscussionCommentsValidation = require('./controller/lessonDiscussionComments.validation');
const lessonDiscussionCommentsController = require('./controller/lessonDiscussionComments.controller');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.post(
    '/api/addlessonDiscussionComments',
    FileUploader.upload.none(),
    [
      lessonDiscussionCommentsValidation.addlessonDiscussionCommentsValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudent,
    ],
    lessonDiscussionCommentsController.addlessonDiscussionComments
  );

  app.put(
    '/api/updatelessonDiscussionComments/:id',
    FileUploader.upload.none(),
    [
      lessonDiscussionCommentsValidation.updatelessonDiscussionCommentsValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudent,
    ],
    lessonDiscussionCommentsController.updatelessonDiscussionComments
  );

  app.put(
    '/api/updatelessonDiscussion/:id',
    FileUploader.upload.none(),
    [
      lessonDiscussionCommentsValidation.updatelessonDiscussionCommentsValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudent,
    ],
    lessonDiscussionCommentsController.updatelessonDiscussion
  );

  app.get(
    '/api/listlessonDiscussionComments',
    FileUploader.upload.none(),
    [
      lessonDiscussionCommentsValidation.listlessonDiscussionCommentsValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    lessonDiscussionCommentsController.listlessonDiscussionComments
  );

  app.get(
    '/api/listlessonDiscussionById/:id',
    FileUploader.upload.none(),
    [
      lessonDiscussionCommentsValidation.listlessonDiscussionCommentsValidationById,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    lessonDiscussionCommentsController.listlessonDiscussionById
  );
  app.get(
    '/api/listlessonDiscussionCommentsById/:id',
    FileUploader.upload.none(),
    [
      lessonDiscussionCommentsValidation.listlessonDiscussionCommentsValidationById,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    lessonDiscussionCommentsController.listlessonDiscussionCommentsById
  );

  app.post(
    '/api/deletelessonDiscussionComments/:id',
    FileUploader.upload.none(),
    [
      lessonDiscussionCommentsValidation.deletelessonDiscussionCommentsValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudent,
    ],
    lessonDiscussionCommentsController.deletelessonDiscussionComments
  );

  app.post(
    '/api/deletelessonDiscussion/:id',
    FileUploader.upload.none(),
    [
      lessonDiscussionCommentsValidation.deletelessonDiscussionCommentsValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudent,
    ],
    lessonDiscussionCommentsController.deletelessonDiscussion
  );

  app.get(
    '/api/listlessonDiscussionByCourseId/:courseId',
    FileUploader.upload.none(),
    [
      lessonDiscussionCommentsValidation.listlessonDiscussionByCourseIdValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    lessonDiscussionCommentsController.listlessonDiscussionByCourseId
  );

  app.get(
    '/api/listLessonDiscussion',
    FileUploader.upload.none(),
    [
      lessonDiscussionCommentsValidation.listLessonDiscussionValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    lessonDiscussionCommentsController.listLessonDiscussion
  );
};
