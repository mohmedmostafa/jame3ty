const multer = require('multer');
const { AuthJwt } = require('../../middleware');
const {
  ValidateResponse,
  ResponseConstants,
} = require('../../common/response/response.handler');
const StudentValidation = require('./controller/student.validation');
const StudentController = require('./controller/student.controller');
const FileUploader = require('../../common/attachmentsUpload/multerConfig');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  const upload_addStudent = FileUploader.upload.fields([
    {
      name: 'img',
      maxCount: 1,
    },
  ]);

  app.post(
    '/api/addStudent',
    (req, res, next) => {
      FileUploader.validateFileAfterUpdate(req, res, next, upload_addStudent);
    },
    [
      StudentValidation.addStudentValidation,
      //AuthJwt.VerifyToken,
      //AuthJwt.isInstructor,
    ],
    StudentController.addStudent
  );

  app.post(
    '/api/deleteStudent/:id',
    FileUploader.upload.none(),
    [
      StudentValidation.deleteStudentValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isStudentorOrAdmin,
    ],
    StudentController.deleteStudent
  );

  const upload_updateStudent = FileUploader.upload.fields([
    {
      name: 'img',
      maxCount: 1,
    },
  ]);

  app.post(
    '/api/updateStudent/:id',
    (req, res, next) => {
      FileUploader.validateFileAfterUpdate(
        req,
        res,
        next,
        upload_updateStudent
      );
    },
    [
      StudentValidation.updateStudentValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isStudentorOrAdmin,
    ],
    StudentController.updateStudent
  );

  app.get(
    '/api/listStudent',
    FileUploader.upload.none(),
    [
      StudentValidation.listStudentValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    StudentController.listStudent
  );

  app.get(
    '/api/listStudentById/:id',
    FileUploader.upload.none(),
    [
      StudentValidation.listStudentByIdValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    StudentController.listStudentById
  );

  app.get(
    '/api/listStudentByUserId/:userId',
    FileUploader.upload.none(),
    [
      StudentValidation.listStudentByUserIdValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    StudentController.listStudentByUserId
  );
};

/*
(req, res, next) => {
      upload_addStudent(req, res, (err) => {
        if (req.fileVaildMimTypesError) {
          return ValidateResponse(
            res,
            ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
              .FILE_EXTENSION_INVALID,
            [
              ResponseConstants.ERROR_MESSAGES.FILE_EXTENSION_INVALID,
              req.fileVaildMimTypesError,
              err,
            ]
          );
        }

        //If Unexpected field ERROR
        if (
          err instanceof multer.MulterError &&
          err.message === 'Unexpected field'
        ) {
          FileUploader.onErrorDeleteFiles(req);
          return ValidateResponse(
            res,
            err,
            FileUploader.validForm_DataParamNames()
          );
        }

        //Other Errors
        if (err) {
          FileUploader.onErrorDeleteFiles(req);
          return ValidateResponse(res, err, {});
        }

        return next();
      });
    },
*/
