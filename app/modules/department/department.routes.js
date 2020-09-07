const multer = require('multer');
const { AuthJwt } = require('../../middleware');
const { ValidateResponse } = require('../../common/response.handler');
const DepartmentValidation = require('./controller/department.validation');
const DepartmentController = require('./controller/department.controller');
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
    '/api/addDepartment',
    FileUploader.upload.none(),
    [
      DepartmentValidation.addDepartmentValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructor,
    ],
    DepartmentController.addDepartment
  );

  app.post(
    '/api/deleteDepartment/:id',
    FileUploader.upload.none(),
    [
      DepartmentValidation.deleteDepartmentValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructor,
    ],
    DepartmentController.deleteDepartment
  );

  app.post(
    '/api/updateDepartment/:id',
    FileUploader.upload.none(),
    [
      DepartmentValidation.updateDepartmentValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructor,
    ],
    DepartmentController.updateDepartment
  );

  app.get(
    '/api/listDepartmentById/:id',
    FileUploader.upload.none(),
    [
      DepartmentValidation.listDepartmentByIdValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    DepartmentController.listDepartmentById
  );

  app.get(
    '/api/listDepartment',
    FileUploader.upload.none(),
    [
      DepartmentValidation.listDepartmentValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    DepartmentController.listDepartment
  );
};
