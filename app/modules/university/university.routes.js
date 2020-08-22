const { AuthJwt } = require('../../middleware');
const UniversityValidation = require('./controller/university.validation');
const UniversityController = require('./controller/university.controller');

module.exports = function (app, Uploader) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.post(
    '/api/addUniversity',
    Uploader.upload.none(),
    [
      UniversityValidation.addUniversityValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    UniversityController.addUniversity
  );

  app.put(
    '/api/updateUniversity/:id',
    Uploader.upload.none(),
    [
      UniversityValidation.updateUniversityValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    UniversityController.updateUniversity
  );

  app.get(
    '/api/listUniversity',
    Uploader.upload.none(),
    [
      UniversityValidation.listUniversityValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrAdmin,
    ],
    UniversityController.listUniversity
  );

  app.post(
    '/api/deleteUniversity/:id',
    Uploader.upload.none(),
    [
      UniversityValidation.deleteUniversityValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    UniversityController.deleteUniversity
  );
};
