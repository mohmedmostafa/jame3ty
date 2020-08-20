const { AuthJwt, UniversityValidation } = require('../middleware');
const UniversityController = require('../controllers/university.controller');

module.exports = function (app, uploader) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.post(
    '/api/addUniversity',
    uploader.none(),
    [
      UniversityValidation.addUniversityValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    UniversityController.addUniversity
  );

  app.put(
    '/api/updateUniversity/:id',
    uploader.none(),
    [
      UniversityValidation.updateUniversityValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    UniversityController.updateUniversity
  );

  app.get(
    '/api/listUniversity',
    uploader.none(),
    [
      UniversityValidation.listUniversityValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrAdmin,
    ],
    UniversityController.listUniversity
  );

  app.post(
    '/api/deleteUniversity/:id',
    uploader.none(),
    [
      UniversityValidation.deleteUniversityValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    UniversityController.deleteUniversity
  );
};
