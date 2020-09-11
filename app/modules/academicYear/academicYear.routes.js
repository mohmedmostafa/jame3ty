const multer = require('multer');
const { AuthJwt } = require('../../middleware');
const { ValidateResponse } = require('../../common/response.handler');
const AcademicYearValidation = require('./controller/academicYear.validation');
const AcademicYearController = require('./controller/academicYear.controller');
const FileUploader = require('../../common/multerConfig');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.post(
    '/api/addAcademicYear',
    FileUploader.upload.none(),
    [
      AcademicYearValidation.addAcademicYearValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    AcademicYearController.addAcademicYear
  );

  app.post(
    '/api/deleteAcademicYear/:id',
    FileUploader.upload.none(),
    [
      AcademicYearValidation.deleteAcademicYearValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    AcademicYearController.deleteAcademicYear
  );

  app.post(
    '/api/updateAcademicYear/:id',
    FileUploader.upload.none(),
    [
      AcademicYearValidation.updateAcademicYearValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    AcademicYearController.updateAcademicYear
  );

  app.get(
    '/api/listAcademicYearById/:id',
    FileUploader.upload.none(),
    [
      AcademicYearValidation.listAcademicYearByIdValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    AcademicYearController.listAcademicYearById
  );

  app.get(
    '/api/listAcademicYear',
    FileUploader.upload.none(),
    [
      AcademicYearValidation.listAcademicYearValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    AcademicYearController.listAcademicYear
  );
};
