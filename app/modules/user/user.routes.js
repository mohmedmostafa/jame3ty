const { AuthJwt } = require('../../middleware');
const UserController = require('../../modules/user/controller/user.controller');
const { upload } = require('../../common/multerConfig');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.get('/api/test/all', upload.none(), UserController.allAccess);

  app.get(
    '/api/test/user',
    upload.none(),
    [AuthJwt.VerifyToken],
    UserController.userBoard
  );

  app.get(
    '/api/test/instructor',
    upload.none(),
    [AuthJwt.VerifyToken, AuthJwt.isInstructor],
    UserController.instructorBoard
  );

  app.get(
    '/api/test/admin',
    upload.none(),
    [AuthJwt.VerifyToken, AuthJwt.isAdmin],
    UserController.adminBoard
  );
};
