const { AuthJwt } = require('../../middleware');
const FacultyValidation = require('./controller/faculty.validation');
const FacultyController = require('./controller/faculty.controller');

module.exports = function (app, Uploader) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.post(
    '/api/addFaculty',
    Uploader.upload.none(),
    [
      FacultyValidation.addFacultyValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    FacultyController.addFaculty
  );

  app.post(
    '/api/updateFaculty/:id',
    Uploader.upload.none(),
    [
      FacultyValidation.updateFacultyValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    FacultyController.updateFaculty
  );

  app.get(
    '/api/listFaculty',
    Uploader.upload.none(),
    [
      FacultyValidation.listFacultyValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrAdmin,
    ],
    FacultyController.listFaculty
  );

  app.post(
    '/api/deleteFaculty/:id',
    Uploader.upload.none(),
    [
      FacultyValidation.deleteFacultyValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    FacultyController.deleteFaculty
  );
};
