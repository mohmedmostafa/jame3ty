const { AuthJwt } = require('../../middleware');
const UserController = require('../../modules/user/controller/user.controller');

module.exports = function (app, Uploader) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.get('/api/test/all', Uploader.upload.none(), UserController.allAccess);

  app.get(
    '/api/test/user',
    Uploader.upload.none(),
    [AuthJwt.VerifyToken],
    UserController.userBoard
  );

  app.get(
    '/api/test/instructor',
    Uploader.upload.none(),
    [AuthJwt.VerifyToken, AuthJwt.isInstructor],
    UserController.instructorBoard
  );

  app.get(
    '/api/test/admin',
    Uploader.upload.none(),
    [AuthJwt.VerifyToken, AuthJwt.isAdmin],
    UserController.adminBoard
  );
};
