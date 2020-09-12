const multer = require('multer');
const { AuthJwt } = require('../../middleware');
const { ValidateResponse } = require('../../response/response.handler');
const SubjectValidation = require('./controller/subject.validation');
const SubjectController = require('./controller/subject.controller');
const FileUploader = require('../../common/attachmentsUpload/multerConfig');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.post(
    '/api/addSubject',
    FileUploader.upload.none(),
    [
      SubjectValidation.addSubjectValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    SubjectController.addSubject
  );

  app.post(
    '/api/deleteSubject/:id',
    FileUploader.upload.none(),
    [
      SubjectValidation.deleteSubjectValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    SubjectController.deleteSubject
  );

  app.post(
    '/api/updateSubject/:id',
    FileUploader.upload.none(),
    [
      SubjectValidation.updateSubjectValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    SubjectController.updateSubject
  );

  app.get(
    '/api/listSubjectById/:id',
    FileUploader.upload.none(),
    [
      SubjectValidation.listSubjectByIdValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    SubjectController.listSubjectById
  );

  app.get(
    '/api/listSubject',
    FileUploader.upload.none(),
    [
      SubjectValidation.listSubjectValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    SubjectController.listSubject
  );
};
