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
};
