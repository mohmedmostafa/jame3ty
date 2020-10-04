const db = require('../..');
const { Sequelize, connection } = require('../..');
const {
  Response,
  ResponseConstants,
} = require('../../../common/response/response.handler');

const QueryTypes = db.Sequelize.QueryTypes;
const Op = db.Sequelize.Op;
const db_University = db.University;
const db_Faculty = db.Faculty;
const db_Department = db.Department;
const db_CourseSubscribe = db.CourseSubscribe;
const db_Course = db.Course;
const db_Instructor = db.Instructor;
const db_RatingAndReview = db.RatingAndReview;
const db_Student = db.Student;
const db_connection = db.connection;

//---------------------------------------------------------------
exports.addRatingAndReview = async (req, res) => {
  try {
    //Check if the University is already exsits
    const courseSubscribe = await db_CourseSubscribe.findByPk(
      parseInt(req.body.courseSubscribeId)
    );

    if (!courseSubscribe) {
      console.log('!courseSubscribe');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
      );
    }

    //Save to DB
    const ratingAndReview = await db_RatingAndReview.create({
      date: req.body.date,
      reviewText: req.body.reviewText,
      rate: req.body.rate,
      courseSubscribeId: parseInt(req.body.courseSubscribeId),
    });

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.CREATED.code,
      ResponseConstants.HTTP_STATUS_CODES.CREATED.type.RECOURSE_CREATED,
      ResponseConstants.ERROR_MESSAGES.RECOURSE_CREATED
    );
  } catch (error) {
    console.log(error);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
        .ORM_OPERATION_FAILED,
      ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
    );
  }
};

//---------------------------------------------------------------
exports.updateRatingAndReview = async (req, res) => {
  try {
    //Check if the faculty is already exsits
    let ratingAndReview = await db_RatingAndReview.findByPk(req.params.id);

    if (!ratingAndReview) {
      console.log('!ratingAndReview');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_RATINGREVIEW
      );
    }

    //Do Update
    ratingAndReview = await db_RatingAndReview.update(
      {
        reviewText: req.body.reviewText
          ? req.body.reviewText
          : ratingAndReview.reviewText,
        rate: req.body.rate ? req.body.rate : ratingAndReview.rate,
      },
      { where: { id: req.params.id } }
    );

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      ResponseConstants.ERROR_MESSAGES.SUCCESS
    );
  } catch (error) {
    console.log(error);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
        .ORM_OPERATION_FAILED,
      ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
    );
  }
};

//---------------------------------------------------------------
exports.deleteRatingAndReview = async (req, res) => {
  try {
    //Check if the faculty is already exsits
    let ratingAndReview = await db_RatingAndReview.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: db_CourseSubscribe,
          where: { paymentResult: 'CAPTURED' },
        },
      ],
    });

    if (!ratingAndReview) {
      console.log('!ratingAndReview');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_RATINGREVIEW
      );
    }

    //Delete
    ratingAndReview = await db_RatingAndReview.destroy({
      where: { id: req.params.id },
    });

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      ResponseConstants.ERROR_MESSAGES.SUCCESS
    );
  } catch (error) {
    console.log(error);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
        .ORM_OPERATION_FAILED,
      ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
    );
  }
};

//--------------------------------------------------------------
exports.listRatingAndReviewById = async (req, res) => {
  try {
    //Check if found
    const ratingAndReview = await db_RatingAndReview.findOne({
      where: { id: parseInt(req.params.id) },
      include: [
        {
          model: db_CourseSubscribe,
          where: { paymentResult: 'CAPTURED' },
          include: [
            {
              model: db_Student,
            },
          ],
        },
      ],
    });

    if (!ratingAndReview) {
      console.log('!ratingAndReview');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_RATINGREVIEW
      );
    }

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { ratingAndReview }
    );
  } catch (error) {
    console.log(error);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
        .ORM_OPERATION_FAILED,
      ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
    );
  }
};

//--------------------------------------------------------------
exports.listRatingAndReviewByCourseId = async (req, res) => {
  try {
    //Check if found
    const ratingAndReview = await db_RatingAndReview.findAll({
      include: [
        {
          model: db_CourseSubscribe,
          where: {
            courseId: req.params.courseId,
            paymentResult: 'CAPTURED',
          },
          include: [
            {
              model: db_Student,
            },
            {
              model: db_Course,
              include: [
                {
                  model: db_Instructor,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!ratingAndReview) {
      console.log('!ratingAndReview');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_RATINGREVIEW
      );
    }

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { ratingAndReview }
    );
  } catch (error) {
    console.log(error);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
        .ORM_OPERATION_FAILED,
      ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
    );
  }
};

//---------------------------------------------------------------
exports.listRatingAndReview = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Calc skip or offset to be used in limit
  let skip = (page - 1) * numPerPage;
  let _limit = numPerPage;

  //Query
  try {
    let data;
    if (doPagination) {
      data = await listRatingAndReview_DoPagination(req, skip, _limit);
    } else {
      data = await listRatingAndReview_NOPagination(req);
    }

    //Total num of valid pages
    let numPages = Math.ceil(data.count / numPerPage);
    let result = {
      doPagination,
      numRows: data.count,
      numPerPage,
      numPages,
      page,
      data: data.rows,
    };

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { result }
    );
  } catch (error) {
    console.log(error);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
        .ORM_OPERATION_FAILED,
      ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
    );
  }
};

function listRatingAndReview_DoPagination(req, skip, _limit) {
  return new Promise(async (resolve, reject) => {
    await db_RatingAndReview
      .findAndCountAll({
        where: {
          rate: {
            [Op.eq]: req.query.searchKey,
          },
        },
        include: [
          {
            model: db_CourseSubscribe,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Student,
              },
            ],
          },
        ],
        distinct: true,
        offset: skip,
        limit: _limit,
      })
      .catch((err) => {
        console.log(err);
        return reject(err);
      })
      .then((data) => {
        return resolve(data);
      });
  });
}

function listRatingAndReview_NOPagination(req) {
  return new Promise(async (resolve, reject) => {
    await db_RatingAndReview
      .findAndCountAll({
        where: {
          rate: {
            [Op.eq]: req.query.searchKey,
          },
        },
        include: [
          {
            model: db_CourseSubscribe,
            required: false,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Student,
              },
            ],
          },
        ],
        distinct: true,
      })
      .catch((err) => {
        console.log(err);
        return reject(err);
      })
      .then((data) => {
        return resolve(data);
      });
  });
}

//-----------------------------------------------
//-----------------------------------------------
//-----------------------------------------------
//Get Rating AVG and Rating Count for Course
exports.getCourseAVGRateAndRateCount = function (courseId) {
  return new Promise(async (resolve, reject) => {
    await db_RatingAndReview
      .findOne({
        attributes: [
          [Sequelize.fn('avg', Sequelize.col('rate')), 'ratingAVG'],
          [Sequelize.fn('count', '*'), 'ratingCount'],
        ],
        include: [
          {
            model: db_CourseSubscribe,
            attributes: [],
            where: { courseId: courseId, paymentResult: 'CAPTURED' },
          },
        ],
        group: [Sequelize.col('courseId')],
      })
      .catch((error) => {
        console.log(error);
        return reject(error);
      })
      .then((courseAVGRatingAndCount) => {
        return resolve(courseAVGRatingAndCount);
      });
  });
};

//Get Instructor AVG Rating and Count Rating for all courses for this instructor
exports.getInstructorAVGRateAndRateCount = function (instructorId) {
  return new Promise(async (resolve, reject) => {
    await db_RatingAndReview
      .findOne({
        attributes: [
          [Sequelize.fn('avg', Sequelize.col('rate')), 'ratingAVG'],
          [Sequelize.fn('count', '*'), 'ratingCount'],
        ],
        include: [
          {
            model: db_CourseSubscribe,
            attributes: [],
            required: true,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Course,
                required: true,
                where: { instructorId: instructorId },
              },
            ],
          },
        ],
        // group: [Sequelize.col('instructorId')],
      })
      .catch((error) => {
        console.log(error);
        return reject(error);
      })
      .then((instructorAVGRatingAndCount) => {
        return resolve(instructorAVGRatingAndCount);
      });
  });
};
