const { AuthJwt } = require('../../middleware');
const InstructorValidation = require('./controller/instructor.validation');
const InstructorController = require('./controller/instructor.controller');

module.exports = function (app, uploader) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.post(
    '/api/addInstructor',
    uploader.none(),
    [
      InstructorValidation.addInstructorValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    InstructorController.addInstructor
  );

  app.put(
    '/api/updateInstructor/:id',
    uploader.none(),
    [
      InstructorValidation.updateInstructorValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    InstructorController.updateInstructor
  );

  app.get(
    '/api/listInstructor',
    uploader.none(),
    [
      InstructorValidation.listInstructorValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrAdmin,
    ],
    InstructorController.listInstructor
  );

  app.post(
    '/api/deleteInstructor/:id',
    uploader.none(),
    [
      InstructorValidation.deleteInstructorValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    InstructorController.deleteInstructor
  );
};
