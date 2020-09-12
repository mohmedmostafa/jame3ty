const db = require('../..');
const { Response } = require('../../../response/response.handler');

const Op = db.Sequelize.Op;
const db_University = db.University;
const db_Faculty = db.Faculty;
const db_Department = db.Department;
const db_CourseSubscribe = db.CourseSubscribe;
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
      return Response(res, 404, 'Course Subscribe Not Found!', {});
    }

    //Save to DB
    const ratingAndReview = await db_RatingAndReview.create({
      date: req.body.date,
      reviewText: req.body.reviewText,
      rate: req.body.rate,
      courseSubscribeId: parseInt(req.body.courseSubscribeId),
    });

    //Success
    return Response(res, 200, 'Success!', { ratingAndReview });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Add', { error });
  }
};

//---------------------------------------------------------------
exports.updateRatingAndReview = async (req, res) => {
  try {
    //Check if the faculty is already exsits
    let ratingAndReview = await db_RatingAndReview.findByPk(req.params.id);

    if (!ratingAndReview) {
      return Response(res, 404, 'Rating And Review Not Found!', {});
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
    return Response(res, 200, 'Success!', { ratingAndReview });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
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
        },
      ],
    });

    if (!ratingAndReview) {
      return Response(res, 404, 'RatingAndReview Not Found!', {});
    }

    //Delete
    ratingAndReview = await db_RatingAndReview.destroy({
      where: { id: req.params.id },
    });

    //Success
    return Response(res, 200, 'Success!', { ratingAndReview });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
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
          include: [
            {
              model: db_Student,
            },
          ],
        },
      ],
    });

    if (!ratingAndReview) {
      return Response(res, 404, 'RatingAndReview Not Found!', {});
    }

    //Success
    return Response(res, 200, 'Success!', { ratingAndReview });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Find!', { error });
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
          },
        },
      ],
    });

    if (!ratingAndReview) {
      return Response(res, 404, 'RatingAndReview  Not Found!', {});
    }

    //Success
    return Response(res, 200, 'Success!', { ratingAndReview });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Find!', { error });
  }
};

//---------------------------------------------------------------
exports.listRatingAndReview = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Count all rows
  let numRows = await db_RatingAndReview
    .count({
      where: {
        rate: {
          [Op.eq]: req.query.searchKey,
        },
      },
    })
    .catch((error) => {
      return Response(res, 500, 'Fail to Count!', { error });
    });
  numRows = parseInt(numRows);

  //Total num of valid pages
  let numPages = Math.ceil(numRows / numPerPage);

  //Calc skip or offset to be used in limit
  let skip = (page - 1) * numPerPage;
  let _limit = numPerPage;

  //Query
  try {
    let data;
    if (doPagination) {
      data = await listRatingAndReview_DoPagination(
        req,
        db_RatingAndReview,
        db_CourseSubscribe,
        db_Student,
        skip,
        _limit
      );
    } else {
      data = await listRatingAndReview_NOPagination(
        req,
        db_RatingAndReview,
        db_CourseSubscribe,
        db_Student
      );
    }

    let result = {
      doPagination,
      numRows,
      numPerPage,
      numPages,
      page,
      data,
    };

    //Success
    return Response(res, 200, 'Success!', { result });
  } catch (error) {
    return Response(res, 500, 'Fail To Find!', { error });
  }
};

function listRatingAndReview_DoPagination(
  req,
  db_RatingAndReview,
  db_CourseSubscribe,
  db_Student,
  skip,
  _limit
) {
  return new Promise(async (resolve, reject) => {
    await db_RatingAndReview
      .findAll({
        where: {
          rate: {
            [Op.eq]: req.query.searchKey,
          },
        },
        include: [
          {
            model: db_CourseSubscribe,
            include: [
              {
                model: db_Student,
              },
            ],
          },
        ],
        offset: skip,
        limit: _limit,
      })
      .catch((err) => {
        return reject(err);
      })
      .then((data) => {
        return resolve(data);
      });
  });
}

function listRatingAndReview_NOPagination(
  req,
  db_RatingAndReview,
  db_CourseSubscribe,
  db_Student
) {
  return new Promise(async (resolve, reject) => {
    await db_RatingAndReview
      .findAll({
        where: {
          rate: {
            [Op.eq]: req.query.searchKey,
          },
        },
        include: [
          {
            model: db_CourseSubscribe,
            include: [
              {
                model: db_Student,
              },
            ],
          },
        ],
      })
      .catch((err) => {
        return reject(err);
      })
      .then((data) => {
        return resolve(data);
      });
  });
}
