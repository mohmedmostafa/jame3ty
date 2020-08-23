const { AuthJwt } = require('../../middleware');
const { ValidateResponse } = require('../../common/response.handler');
const CourseValidation = require('./controller/courses.validation');
const CourseController = require('./controller/courses.controller');

module.exports = function (app, Uploader) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  const addCourseFileFieldsNames = Uploader.upload.fields([
    {
      name: Uploader.validForm_DataParamNames[0],
      maxCount: 1,
    },
    {
      name: Uploader.validForm_DataParamNames[1],
      maxCount: 1,
    },
  ]);

  app.post(
    '/api/addCourse',
    (req, res, next) => {
      addCourseFileFieldsNames(req, res, (err) => {
        if (err) {
          console.log(err);
          return ValidateResponse(
            res,
            'form-data params names not valid name!. Accepted Param Names are : ' +
              Uploader.validForm_DataParamNames,
            {}
          );
        }
        return next();
      });
    },
    [
      CourseValidation.addCourseValidation,
      Uploader.uploadMultiFields_With_MultiFiles,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrAdmin,
    ],
    CourseController.addCourse
  );

  // app.post(
  //   '/api/updateFaculty/:id',
  //   Uploader.upload.none(),
  //   [
  //     FacultyValidation.updateFacultyValidation,
  //     AuthJwt.VerifyToken,
  //     AuthJwt.isAdmin,
  //   ],
  //   FacultyController.updateFaculty
  // );

  // app.get(
  //   '/api/listFaculty',
  //   Uploader.upload.none(),
  //   [
  //     FacultyValidation.listFacultyValidation,
  //     AuthJwt.VerifyToken,
  //     AuthJwt.isInstructorOrAdmin,
  //   ],
  //   FacultyController.listFaculty
  // );

  // app.post(
  //   '/api/deleteFaculty/:id',
  //   Uploader.upload.none(),
  //   [
  //     FacultyValidation.deleteFacultyValidation,
  //     AuthJwt.VerifyToken,
  //     AuthJwt.isAdmin,
  //   ],
  //   FacultyController.deleteFaculty
  // );
};
