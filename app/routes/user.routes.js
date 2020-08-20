const { AuthJwt } = require('../middleware');
const UserController = require('../controllers/user.controller');

module.exports = function (app, uploader) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.get('/api/test/all', uploader.none(), UserController.allAccess);

  app.get(
    '/api/test/user',
    uploader.none(),
    [AuthJwt.VerifyToken],
    UserController.userBoard
  );

  app.get(
    '/api/test/instructor',
    uploader.none(),
    [AuthJwt.VerifyToken, AuthJwt.isInstructor],
    UserController.instructorBoard
  );

  app.get(
    '/api/test/admin',
    uploader.none(),
    [AuthJwt.VerifyToken, AuthJwt.isAdmin],
    UserController.adminBoard
  );
};
