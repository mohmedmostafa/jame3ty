const AuthJwt = require('./authJwt');
const VerifySignUp = require('./verifySignUp');
const UserValidation = require('./validation/user.validation');
const UniversityValidation = require('./validation/university.validation');

module.exports = {
  AuthJwt,
  VerifySignUp,
  UserValidation,
  UniversityValidation,
};
