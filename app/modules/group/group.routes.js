const multer = require('multer');
const { AuthJwt } = require('../../middleware');
const { ValidateResponse } = require('../../common/response.handler');
const GroupValidation = require('./controller/group.validation');
const GroupController = require('./controller/group.controller');
const FileUploader = require('../../common/multerConfig');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.post(
    '/api/addGroup',
    FileUploader.upload.none(),
    [
      GroupValidation.addGroupValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructor,
    ],
    GroupController.addGroup
  );

  app.post(
    '/api/deleteGroup/:id',
    FileUploader.upload.none(),
    [
      GroupValidation.deleteGroupValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructor,
    ],
    GroupController.deleteGroup
  );

  app.post(
    '/api/updateGroup/:id',
    FileUploader.upload.none(),
    [
      GroupValidation.updateGroupValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructor,
    ],
    GroupController.updateGroup
  );

  app.get(
    '/api/listGroupByCourseId/:courseId',
    FileUploader.upload.none(),
    [
      GroupValidation.listGroupByCourseIdValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrAdmin,
    ],
    GroupController.listGroupByCourseId
  );

  app.get(
    '/api/listGroupById/:id',
    FileUploader.upload.none(),
    [
      GroupValidation.listGroupByIdValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrAdmin,
    ],
    GroupController.listGroupById
  );
};
