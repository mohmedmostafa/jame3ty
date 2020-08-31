const { AuthJwt } = require('../../middleware');
const UserController = require('../../modules/user/controller/user.controller');
const UserValidation = require('./controller/user.validation');

const FileUploader = require('../../common/multerConfig');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.put(
    '/api/updateUser/:id',
    FileUploader.upload.none(),
    [ AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
      UserValidation.updateUserValidation,
     
    ],
    UserController.updateUser
  );

  app.get(
    '/api/listUser',
    FileUploader.upload.none(),
    [AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
      UserValidation.listUserValidation,
      
    ],
    UserController.listUser
  );

  app.get(
    '/api/listUserById/:id',
    FileUploader.upload.none(),
    [
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
      UserValidation.listUserIdValidation,
    ],
    UserController.listUserById
  );

  app.post(
    '/api/deleteUser/:id',
    FileUploader.upload.none(),
    [AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
      UserValidation.deleteUserValidation,
      
    ],
    UserController.deleteUser
  );


  // app.get('/api/test/all', upload.none(), UserController.allAccess);

  // app.get(
  //   '/api/test/user',
  //   FileUploader.upload.none(),
  //   [AuthJwt.VerifyToken],
  //   UserController.userBoard
  // );

  // app.get(
  //   '/api/test/User',
  //   upload.none(),
  //   [AuthJwt.VerifyToken, AuthJwt.isUser],
  //   UserController.UserBoard
  // );

  // app.get(
  //   '/api/test/admin',
  //   upload.none(),
  //   [AuthJwt.VerifyToken, AuthJwt.isAdmin],
  //   UserController.adminBoard
  // );
};
