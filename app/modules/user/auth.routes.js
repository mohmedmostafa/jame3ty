const AuthController = require('../user/controller/auth.controller');
const VerifySignUp = require('./controller/verifySignUp');
const UserValidation = require('./controller/user.validation');
const { upload } = require('../../common/attachmentsUpload/multerConfig');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    return next();
  });

  app.post(
    '/api/auth/signin',
    upload.none(),
    [UserValidation.signinValidation],
    AuthController.signin
  );

  app.post(
    '/api/auth/signup',
    upload.none(),
    [UserValidation.signupValidation, VerifySignUp.checkRolesExisted],
    AuthController.signup
  );

  app.post(
    '/api/auth/verifyEmail',
    upload.none(),
    [UserValidation.verifyEmailValidation],
    AuthController.verifyEmail
  );

  app.post(
    '/api/auth/sendVerificationCode',
    upload.none(),
    [UserValidation.sendVerificationCodeValidation],
    AuthController.sendVerificationCode
  );

  app.post(
    '/api/auth/forgotPassword',
    upload.none(),
    [UserValidation.forgotPasswordValidation],
    AuthController.forgotPassword
  );
};
