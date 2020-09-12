const { AuthJwt } = require('../../middleware');
const FacultyValidation = require('./controller/faculty.validation');
const FacultyController = require('./controller/faculty.controller');
const { upload } = require('../../common/attachmentsUpload/multerConfig');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.post(
    '/api/addFaculty',
    upload.none(),
    [
      FacultyValidation.addFacultyValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    FacultyController.addFaculty
  );

  app.post(
    '/api/updateFaculty/:id',
    upload.none(),
    [
      FacultyValidation.updateFacultyValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    FacultyController.updateFaculty
  );

  app.get(
    '/api/listFaculty',
    upload.none(),
    [
      FacultyValidation.listFacultyValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    FacultyController.listFaculty
  );

  app.get(
    '/api/listFacultyById/:id',
    upload.none(),
    [
      FacultyValidation.listFacultyByIdValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    FacultyController.listFacultyById
  );

  app.post(
    '/api/deleteFaculty/:id',
    upload.none(),
    [
      FacultyValidation.deleteFacultyValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    FacultyController.deleteFaculty
  );
};
