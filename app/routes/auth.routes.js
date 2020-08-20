const AuthController = require('../controllers/auth.controller');
const { VerifySignUp, UserValidation } = require('../middleware');

module.exports = function (app, uploader) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    return next();
  });

  app.post(
    '/api/auth/signin',
    uploader.none(),
    [UserValidation.signinValidation],
    AuthController.signin
  );

  app.post(
    '/api/auth/signup',
    uploader.none(),
    [
      UserValidation.signupValidation,
      VerifySignUp.checkDuplicateUsernameOrEmail,
      VerifySignUp.checkRolesExisted,
    ],
    AuthController.signup
  );
};
