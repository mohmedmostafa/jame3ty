const multer = require('multer');
const { AuthJwt } = require('../../middleware');
const {
  ValidateResponse,
  ResponseConstants,
} = require('../../common/response/response.handler');
const CourseValidation = require('./controller/courses.validation');
const CourseController = require('./controller/courses.controller');
const FileUploader = require('../../common/attachmentsUpload/multerConfig');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  //name: FileUploader.validForm_DataParamNames()[2], //vedio0

  const upload_addCourse = FileUploader.upload.fields([
    {
      name: 'img',
      maxCount: 2,
    },
    {
      name: 'vedio',
      maxCount: 1,
    },
  ]);

  app.post(
    '/api/addCourse/:method',
    (req, res, next) => {
      FileUploader.validateFileAfterUpdate(req, res, next, upload_addCourse);
    },
    [
      CourseValidation.addCourseValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrAdmin,
    ],
    CourseController.addCourse
  );

  app.post(
    '/api/deleteCourse/:id',
    FileUploader.upload.none(),
    [
      CourseValidation.deleteCourseValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrAdmin,
    ],
    CourseController.deleteCourse
  );

  const upload_updateCourse = FileUploader.upload.fields([
    {
      name: 'img',
      maxCount: 2,
    },
    {
      name: 'vedio',
      maxCount: 1,
    },
  ]);

  app.post(
    '/api/updateCourse/:id',
    (req, res, next) => {
      FileUploader.validateFileAfterUpdate(req, res, next, upload_updateCourse);
    },
    [
      CourseValidation.updateCourseValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrAdmin,
    ],
    CourseController.updateCourse
  );

  app.get(
    '/api/listCourseOriginal',
    FileUploader.upload.none(),
    [
      // CourseValidation.listCourseOriginalValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    CourseController.listCourseOriginal
  );

  app.get(
    '/api/listCourse',
    FileUploader.upload.none(),
    [
      CourseValidation.listCourseValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    CourseController.listCourse
  );

  app.get(
    '/api/listCourseNoDate',
    FileUploader.upload.none(),
    [
      CourseValidation.listCourseNoDateValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    CourseController.listCourseNoDate
  );

  app.get(
    '/api/listCourseNoDateByDepartment/:departmentId',
    FileUploader.upload.none(),
    [
      CourseValidation.listCourseNoDateByDepartmentValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    CourseController.listCourseNoDateByDepartment
  );

  app.get(
    '/api/listCourseNoDateByInstructor/:instructorId',
    FileUploader.upload.none(),
    [
      CourseValidation.listCourseNoDateByInstructorValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    CourseController.listCourseNoDateByInstructor
  );

  app.get(
    '/api/listCourseById/:id',
    FileUploader.upload.none(),
    [
      CourseValidation.listCourseByIdValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    CourseController.listCourseById
  );

  // const testVedioUpload = FileUploader.upload.fields([
  //   {
  //     name: 'vedio',
  //     maxCount: 1,
  //   },
  // ]);

  // app.post(
  //   '/api/uploadVedioVimeo',
  //   (req, res, next) => {
  //     FileUploader.validateFileAfterUpdate(req, res, next, testVedioUpload);
  //   },
  //   CourseController.uploadVedioVimeo
  // );
};
