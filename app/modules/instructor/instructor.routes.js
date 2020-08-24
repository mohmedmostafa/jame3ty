const { AuthJwt } = require('../../middleware');
const InstructorValidation = require('./controller/instructor.validation');
const InstructorController = require('./controller/instructor.controller');
const FileUploader = require('../../common/multerConfig');
const multer = require('multer');
const { ValidateResponse } = require('../../common/response.handler');

module.exports = function (app, Uploader) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  const upload_addInstructor = FileUploader.upload.fields([
    {
      name: FileUploader.validForm_DataParamNames()[0],
      maxCount: 1,
    },
    {
      name: FileUploader.validForm_DataParamNames()[3],
      maxCount: 1,
    },
  ]);

  app.post(
    '/api/addInstructor',
    (req,res,next)=>{FileUploader.validateFileAfterUpdate(req,res,next,upload_addInstructor)},
    [
      InstructorValidation.addInstructorValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    InstructorController.addInstructor
  );

  app.put(
    '/api/updateInstructor/:id',
    (req,res,next)=>{FileUploader.validateFileAfterUpdate(req,res,next,upload_addInstructor)},
    [
      InstructorValidation.updateInstructorValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    InstructorController.updateInstructor
  );

  app.get(
    '/api/listInstructor',
    FileUploader.upload.none(),
    [
      InstructorValidation.listInstructorValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrAdmin,
    ],
    InstructorController.listInstructor
  );

  app.post(
    '/api/deleteInstructor/:id',
    FileUploader.upload.none(),
    [
      InstructorValidation.deleteInstructorValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isAdmin,
    ],
    InstructorController.deleteInstructor
  );
};
