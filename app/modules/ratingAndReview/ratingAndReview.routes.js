const { AuthJwt } = require('../../middleware');
const RatingAndReviewValidation = require('./controller/ratingAndReview.validation');
const RatingAndReviewController = require('./controller/ratingAndReview.controller');
const { upload } = require('../../common/attachmentsUpload/multerConfig');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.post(
    '/api/addRatingAndReview',
    upload.none(),
    [
      RatingAndReviewValidation.addRatingAndReviewValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isStudent,
    ],
    RatingAndReviewController.addRatingAndReview
  );

  app.post(
    '/api/updateRatingAndReview/:id',
    upload.none(),
    [
      RatingAndReviewValidation.updateRatingAndReviewValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isStudent,
    ],
    RatingAndReviewController.updateRatingAndReview
  );

  app.get(
    '/api/listRatingAndReview',
    upload.none(),
    [
      RatingAndReviewValidation.listRatingAndReviewValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    RatingAndReviewController.listRatingAndReview
  );

  app.get(
    '/api/listRatingAndReviewByCourseId/:courseId',
    upload.none(),
    [
      RatingAndReviewValidation.listRatingAndReviewByCourseIdValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    RatingAndReviewController.listRatingAndReviewByCourseId
  );

  app.get(
    '/api/listRatingAndReviewById/:id',
    upload.none(),
    [
      RatingAndReviewValidation.listRatingAndReviewByIdValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isInstructorOrStudentorOrAdmin,
    ],
    RatingAndReviewController.listRatingAndReviewById
  );

  app.post(
    '/api/deleteRatingAndReview/:id',
    upload.none(),
    [
      RatingAndReviewValidation.deleteRatingAndReviewValidation,
      AuthJwt.VerifyToken,
      AuthJwt.isStudentorOrAdmin,
    ],
    RatingAndReviewController.deleteRatingAndReview
  );
};
