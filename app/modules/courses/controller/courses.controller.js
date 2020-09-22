const db = require('../..');
const { Sequelize, connection } = require('../..');
const VimeoHelper = require('../../../common/vimeo/vimeoHelper');
const {
  Response,
  ValidateResponse,
  ResponseConstants,
} = require('../../../common/response/response.handler');

const {
  onErrorDeleteFiles,
  deleteFile,
} = require('../../../common/attachmentsUpload/multerConfig');
const moment = require('moment');
const RatingReviewsController = require('../../ratingAndReview/controller/ratingAndReview.controller');
const Helper = require('../../../common/helper');

const QueryTypes = db.Sequelize.QueryTypes;
const Op = db.Sequelize.Op;
const db_University = db.University;
const db_Faculty = db.Faculty;
const db_Course = db.Course;
const db_Group = db.Group;
const db_User = db.User;
const db_GroupSchedule = db.GroupSchedule;
const db_AcademicYear = db.AcademicYear;
const db_Department = db.Department;
const db_Subject = db.Subject;
const db_RatingAndReview = db.RatingAndReview;
const db_connection = db.connection;
const db_CourseSubscribe = db.CourseSubscribe;
const db_Student = db.Student;
const db_Lesson = db.Lesson;
const db_Instructor = db.Instructor;
const db_Payment = db.Payment;

//---------------------------------------------------------------
exports.addCourse = async (req, res) => {
  //Check if the Subject ID is already exsits
  const subject = await db_Subject.findByPk(parseInt(req.body.subjectId));

  if (!subject) {
    console.log('!subject');
    onErrorDeleteFiles(req);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
      ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_SUBJECT
    );
  }

  //Get instructor for the uer in the token
  const instructor = await db_Instructor.findByPk(
    parseInt(req.body.instructorId)
  );

  if (!instructor) {
    console.log('!instructor');
    onErrorDeleteFiles(req);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
      ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_INSTRUCTOR
    );
  }

  console.log(req.files);

  //Create Attachment String
  if (req.files.img) {
    let field_1 = [];
    req.files['img'].forEach((file) => {
      let fileUrl = file.path.replace(/\\/g, '/');
      field_1.push(fileUrl);
    });
    req.body.img = field_1.join();
  }

  //Upload Video to Vimeo
  await VimeoHelper.uploadVideoTOVimeo(req, res)
    .catch((error) => {
      onErrorDeleteFiles(req);
      VimeoHelper.vimeoErrorResHandler(req, res, error);
    })
    .then((uri) => {
      //Add Course
      //If the Course Methiod is 'Recorded Lessons'
      if (req.params.method === '0') {
        addRecordedLessonsCourse(req, res, instructor);
      } else {
        //If the Course Methiod is 'Live Streaming'
        addLiveStreamingCourse(req, res, instructor);
      }
    });
};

//Add Course with 'Recorded Lessons' as a Method
async function addRecordedLessonsCourse(req, res, instructor) {
  try {
    //Save to DB
    const course = await db_Course.create({
      name_ar: req.body.name_ar,
      name_en: req.body.name_en,
      code: req.body.code,
      desc: req.body.desc,
      prerequisiteText: req.body.prerequisiteText,
      whatYouWillLearn: req.body.whatYouWillLearn,
      numOfLessons: req.body.numOfLessons,
      numOfHours: req.body.numOfHours,
      price: req.body.price,
      priceBeforeDiscount: req.body.priceBeforeDiscount,
      startDate: moment.utc(req.body.startDate),
      type: req.body.type,
      method: req.params.method,
      img: req.body.img ? req.body.img : '',
      vedio: req.body.uri ? req.body.uri : '',
      subjectId: parseInt(req.body.subjectId),
      instructorId: instructor.id,
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
    onErrorDeleteFiles(req);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
        .ORM_OPERATION_FAILED,
      ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
    );
  }
}

//Add Course with 'Live Streaming' as a Method
async function addLiveStreamingCourse(req, res, instructor) {
  try {
    //Start "Managed" Transaction
    const course = await db_connection.transaction(async (t) => {
      //Save Course to DB
      const course = await db_Course.create(
        {
          name_ar: req.body.name_ar,
          name_en: req.body.name_en,
          code: req.body.code,
          desc: req.body.desc,
          prerequisiteText: req.body.prerequisiteText,
          whatYouWillLearn: req.body.whatYouWillLearn,
          numOfLessons: req.body.numOfLessons,
          numOfHours: req.body.numOfHours,
          price: req.body.price,
          priceBeforeDiscount: req.body.priceBeforeDiscount,
          startDate: moment.utc(req.body.startDate),
          type: req.body.type,
          method: req.params.method,
          img: req.body.img ? req.body.img : '',
          vedio: req.body.uri ? req.body.uri : '',
          subjectId: parseInt(req.body.subjectId),
          instructorId: instructor.id,
        },
        { transaction: t }
      );

      //Save Group to DB for the course
      const group = await db_Group.create(
        {
          name: req.body.nameGroup,
          maxNumOfStudents: req.body.maxNumOfStudentsGroup,
          startDate: moment.utc(req.body.startDateGroup),
          endDate: moment.utc(req.body.endDateGroup),
          courseId: course.id,
          instructorId: instructor.id,
        },
        { transaction: t }
      );

      //Inject Group Id To Group Schedules Objects
      req.body.groupSchedule.forEach((sch) => {
        sch.groupId = group.id;
      });

      //Save Multi Group Schedule to DB for the group
      const groupSchedule = await db_GroupSchedule.bulkCreate(
        req.body.groupSchedule,
        {
          fields: ['day', 'time', 'groupId'],
          transaction: t,
        }
      );

      return { course, group, groupSchedule };
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
    onErrorDeleteFiles(req);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
        .ORM_OPERATION_FAILED,
      ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
    );
  }
}

//---------------------------------------------------------------
exports.deleteCourse = async (req, res) => {
  try {
    //Check if the Course is already exsits
    let course = await db_Course.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!course) {
      console.log('!course');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_COURSE
      );
    }
    //course = course.get({ plain: true });

    course = await db_Course.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: db_CourseSubscribe,
          where: { paymentResult: 'CAPTURED' },
          include: [{ model: db_Student }],
        },
      ],
    });

    //If Students Subscribe the course then can not delete it
    if (course) {
      if (course.courseSubscribes.length > 0) {
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.CONFLICT.code,
          ResponseConstants.HTTP_STATUS_CODES.CONFLICT.type
            .RESOURCE_HAS_DEPENDENTS,
          ResponseConstants.ERROR_MESSAGES.RESOURCE_HAS_DEPENDENTS
        );
      }
    }

    //Delete
    let deletedCourse = await db_Course.destroy({
      where: { id: req.params.id },
    });

    //If the record Deleted then delete files in img and vedio
    if (deletedCourse) {
      //
      let imgStr = course.getDataValue('img');
      if (imgStr.length > 0) {
        let locations = imgStr.split(',');
        console.log(locations);
        locations.forEach((loc) => {
          deleteFile(loc);
        });
      }

      //
      let vedioStr = course.getDataValue('vedio');
      if (vedioStr.length > 0) {
        let locations = vedioStr.split(',');
        console.log(locations);
        locations.forEach((loc) => {
          deleteFile(loc);
        });
      }
    }

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

//Get Rating AVG and Rating Count for Course
// function getCourseAVGRateAndRateCount(courseId) {
//   return new Promise(async (resolve, reject) => {
//     await db_RatingAndReview
//       .findOne({
//         attributes: [
//           [Sequelize.fn('avg', Sequelize.col('rate')), 'ratingAVG'],
//           [Sequelize.fn('count', '*'), 'ratingCount'],
//         ],
//         include: [
//           {
//             model: db_CourseSubscribe,
//             attributes: [],
//             where: { courseId: courseId, paymentResult: 'CAPTURED' },
//           },
//         ],
//         group: [Sequelize.col('courseId')],
//       })
//       .catch((error) => {
//         console.log(error);
//         return reject(error);
//       })
//       .then((courseAVGRatingAndCount) => {
//         return resolve(courseAVGRatingAndCount);
//       });
//   });
// }

//Add Rating info to each course object
function addCourseRatingIngoToEachCourseInData(data) {
  return new Promise(async (resolve, reject) => {
    //convert data sequelize object to json object
    data = JSON.parse(JSON.stringify(data));

    //add rating info to each course object in data
    var courseMapped = await Promise.all(
      data.rows.map(async function (courseObj) {
        //Calc AVG Rating and Get Rating Count
        let courseAVGRatingAndCount = await RatingReviewsController.getCourseAVGRateAndRateCount(
          courseObj['id']
        ).catch((error) => {
          console.log(error);
          return Response(
            res,
            ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
            ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
              .ORM_OPERATION_FAILED,
            ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
          );
        });

        //Get Plain Object from sequelize object
        if (courseAVGRatingAndCount) {
          courseAVGRatingAndCount = courseAVGRatingAndCount.get({
            plain: true,
          });
        } else {
          courseAVGRatingAndCount = {};
        }

        //add to course object
        let course = Object.assign({}, courseObj, {
          AVGRatingAndCount: courseAVGRatingAndCount,
        });

        return course;
      })
    ).catch((error) => {
      console.log(error);
      reject(error);
    });

    //Change courses in data array to the mapped courses
    data.rows = courseMapped;

    resolve(data);
  });
}
//--------------------------------------------------------------
exports.listCourseById = async (req, res) => {
  try {
    let course = await db_Course.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: db_Instructor,
        },
        {
          model: db_Subject,
          include: [
            {
              model: db_AcademicYear,
              include: [
                {
                  model: db_Department,
                  include: [
                    {
                      model: db_Faculty,
                      include: [
                        {
                          model: db_University,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: db_Group,
          include: [
            {
              model: db_GroupSchedule,
            },
            {
              model: db_Lesson,
            },
            {
              model: db_CourseSubscribe,
              required: false,
              where: { paymentResult: 'CAPTURED' },
              include: [{ model: db_Student }, { model: db_RatingAndReview }],
            },
          ],
        },
        {
          model: db_Lesson,
        },
        {
          model: db_CourseSubscribe,
          required: false,
          where: { paymentResult: 'CAPTURED' },
          include: [
            {
              model: db_Student,
            },
            {
              model: db_RatingAndReview,
            },
          ],
        },
      ],
    });

    if (!course) {
      console.log('!course');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_COURSE
      );
    }

    //Calc AVG Rating and Get Rating Count
    let courseAVGRatingAndCount = await RatingReviewsController.getCourseAVGRateAndRateCount(
      req.params.id
    ).catch((error) => {
      console.log(error);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
          .ORM_OPERATION_FAILED,
        ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
      );
    });

    //add to main object
    course = course.get({ plain: true });
    course.AVGRatingAndCount = courseAVGRatingAndCount
      ? courseAVGRatingAndCount
      : {};

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { course }
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
exports.updateCourse = async (req, res) => {
  try {
    //Check if the Course is already exsits
    let course = await db_Course.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: db_Group,
        },
      ],
    });

    if (!course) {
      console.log('!course');
      onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_COURSE
      );
    }

    //If the course is live streaming course -> then check the new start date of the course to be
    //before the start date of its groups
    if (course.method === 1 && course.groups.length > 0) {
      let minStartDateGroup = await db_Group.findOne({
        where: {
          courseId: req.params.id,
        },
        attributes: [
          [Sequelize.fn('min', Sequelize.col('startDate')), 'minStartDate'],
        ],
      });
      minStartDateGroup = minStartDateGroup.get({ plain: true });

      if (
        moment.utc(req.body.startDate).isAfter(minStartDateGroup.minStartDate)
      ) {
        onErrorDeleteFiles(req);
        return ValidateResponse(
          res,
          ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
            .UNACCEPTABLE_DATE,
          ResponseConstants.ERROR_MESSAGES.UNACCEPTABLE_DATE_COURSE_STARTDATE
        );
      }
    }

    //Create Attachment String
    if (req.files.img) {
      let field_1 = [];
      req.files['img'].forEach((file) => {
        let fileUrl = file.path.replace(/\\/g, '/');
        field_1.push(fileUrl);
      });
      req.body.img = field_1.join();
    }

    //Create Attachment String
    if (req.files.vedio) {
      let field_2 = [];
      req.files['vedio'].forEach((file) => {
        let fileUrl = file.path.replace(/\\/g, '/');
        field_2.push(fileUrl);
      });
      req.body.vedio = field_2.join();
    }

    //Do Update
    let updatedCourse = await db_Course.update(
      {
        name_ar: req.body.name_ar ? req.body.name_ar : course.name_ar,
        name_en: req.body.name_en ? req.body.name_en : course.name_en,
        code: req.body.code ? req.body.code : course.code,
        desc: req.body.desc ? req.body.desc : course.desc,
        prerequisiteText: req.body.prerequisiteText
          ? req.body.prerequisiteText
          : course.prerequisiteText,
        whatYouWillLearn: req.body.whatYouWillLearn
          ? req.body.whatYouWillLearn
          : course.whatYouWillLearn,
        numOfLessons: req.body.numOfLessons
          ? req.body.numOfLessons
          : course.numOfLessons,
        numOfHours: req.body.numOfHours
          ? req.body.numOfHours
          : course.numOfHours,
        price: req.body.price ? req.body.price : course.price,
        priceBeforeDiscount: req.body.priceBeforeDiscount
          ? req.body.priceBeforeDiscount
          : course.priceBeforeDiscount,
        startDate: req.body.startDate
          ? moment.utc(req.body.startDate)
          : moment.utc(course.startDate),
        type: req.body.type ? req.body.type : course.type,
        subjectId: req.body.subjectId ? req.body.subjectId : course.subjectId,
        img: req.body.img ? req.body.img : course.getDataValue('img'),
        vedio: req.body.vedio ? req.body.vedio : course.getDataValue('vedio'),
      },
      { where: { id: req.params.id } }
    );

    //If the record Updated then delete files in img and vedio
    if (updatedCourse && req.body.img) {
      let imgStr = course.getDataValue('img');
      if (imgStr.length > 0) {
        let locations = imgStr.split(',');
        console.log(locations);
        locations.forEach((loc) => {
          deleteFile(loc);
        });
      }
    }

    if (updatedCourse && req.body.vedio) {
      let vedioStr = course.getDataValue('vedio');
      if (vedioStr.length > 0) {
        let locations = vedioStr.split(',');
        console.log(locations);
        locations.forEach((loc) => {
          deleteFile(loc);
        });
      }
    }

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      ResponseConstants.ERROR_MESSAGES.SUCCESS
    );
  } catch (error) {
    console.log(error);
    onErrorDeleteFiles(req);
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
exports.listCourse = async (req, res) => {
  //Check role from token if instructor return courses for that instructor only not all courses
  let instructorEmail = '';
  if (
    req.userId &&
    req.userEmail &&
    req.userRoles &&
    req.userRoles[0] === 'instructor'
  ) {
    instructorEmail = req.userEmail;
  }

  //
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
      if (req.query.method != 'both') {
        //Do Pagination & Method 1 or 0
        data = await listCourse_DoPagination_Method_1_or_0(
          req,
          instructorEmail,
          skip,
          _limit
        );
      } else {
        //Do Pagination & Both
        data = await listCourse_DoPagination_Method_Both(
          req,
          instructorEmail,
          skip,
          _limit
        );
      }
    } else {
      if (req.query.method != 'both') {
        //NO Pagination & Method 1 or 0
        data = await listCourse_NOPagination_Method_1_or_0(
          req,
          instructorEmail
        );
      } else {
        //NO Pagination & Method Both
        data = await listCourse_NOPagination_Method_Both(req, instructorEmail);
      }
    }

    //Add Rating info to each course in the data array
    data = await addCourseRatingIngoToEachCourseInData(data).catch((error) => {
      console.log(error);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
          .ORM_OPERATION_FAILED,
        ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
      );
    });

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

function listCourse_DoPagination_Method_Both(
  req,
  instructorEmail,
  skip,
  _limit
) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name_ar: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
                {
                  name_en: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
              ],
            },
            {
              method: {
                [Op.in]: ['0', '1'],
              },
            },
            {
              startDate: {
                [Op.between]: [
                  moment.utc(req.query.startFrom),
                  moment.utc(req.query.startTo),
                ],
              },
            },
          ],
        },
        include: [
          {
            model: db_Instructor,
            required: true,
            where: {
              email: {
                [Op.substring]: instructorEmail,
              },
            },
          },
          {
            model: db_Subject,
            include: [
              {
                model: db_AcademicYear,
                include: [
                  {
                    model: db_Department,
                    include: [
                      {
                        model: db_Faculty,
                        include: [
                          {
                            model: db_University,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_Group,
            include: [
              {
                model: db_GroupSchedule,
              },
              {
                model: db_Lesson,
              },
              {
                model: db_CourseSubscribe,
                required: false,
                where: { paymentResult: 'CAPTURED' },
                include: [
                  {
                    model: db_Student,
                  },
                  {
                    model: db_RatingAndReview,
                  },
                ],
              },
            ],
          },
          {
            model: db_Lesson,
          },
          {
            model: db_CourseSubscribe,
            required: false,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Student,
              },
              {
                model: db_RatingAndReview,
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

function listCourse_DoPagination_Method_1_or_0(
  req,
  instructorEmail,
  skip,
  _limit
) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name_ar: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
                {
                  name_en: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
              ],
            },
            {
              method: req.query.method,
            },
            {
              startDate: {
                [Op.between]: [
                  moment.utc(req.query.startFrom),
                  moment.utc(req.query.startTo),
                ],
              },
            },
          ],
        },
        include: [
          {
            model: db_Instructor,
            required: true,
            where: {
              email: {
                [Op.substring]: instructorEmail,
              },
            },
          },
          {
            model: db_Subject,
            include: [
              {
                model: db_AcademicYear,
                include: [
                  {
                    model: db_Department,
                    include: [
                      {
                        model: db_Faculty,
                        include: [
                          {
                            model: db_University,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_Group,
            include: [
              {
                model: db_GroupSchedule,
              },
              {
                model: db_Lesson,
              },
              {
                model: db_CourseSubscribe,
                required: false,
                where: { paymentResult: 'CAPTURED' },
                include: [
                  {
                    model: db_Student,
                  },
                  {
                    model: db_RatingAndReview,
                  },
                ],
              },
            ],
          },
          {
            model: db_Lesson,
          },
          {
            model: db_CourseSubscribe,
            required: false,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Student,
              },
              {
                model: db_RatingAndReview,
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

function listCourse_NOPagination_Method_Both(req, instructorEmail) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name_ar: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
                {
                  name_en: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
              ],
            },
            {
              method: {
                [Op.in]: ['0', '1'],
              },
            },
            {
              startDate: {
                [Op.between]: [
                  moment.utc(req.query.startFrom),
                  moment.utc(req.query.startTo),
                ],
              },
            },
          ],
        },
        include: [
          {
            model: db_Instructor,
            required: true,
            where: {
              email: {
                [Op.substring]: instructorEmail,
              },
            },
          },
          {
            model: db_Subject,
            include: [
              {
                model: db_AcademicYear,
                include: [
                  {
                    model: db_Department,
                    include: [
                      {
                        model: db_Faculty,
                        include: [
                          {
                            model: db_University,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_Group,
            include: [
              {
                model: db_GroupSchedule,
              },
              {
                model: db_Lesson,
              },
              {
                model: db_CourseSubscribe,
                required: false,
                where: { paymentResult: 'CAPTURED' },
                include: [
                  {
                    model: db_Student,
                  },
                  {
                    model: db_RatingAndReview,
                  },
                ],
              },
            ],
          },
          {
            model: db_Lesson,
          },
          {
            model: db_CourseSubscribe,
            required: false,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Student,
              },
              {
                model: db_RatingAndReview,
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

function listCourse_NOPagination_Method_1_or_0(req, instructorEmail) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name_ar: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
                {
                  name_en: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
              ],
            },
            {
              method: req.query.method,
            },
            {
              startDate: {
                [Op.between]: [
                  moment.utc(req.query.startFrom),
                  moment.utc(req.query.startTo),
                ],
              },
            },
          ],
        },
        include: [
          {
            model: db_Instructor,
            required: true,
            where: {
              email: {
                [Op.substring]: instructorEmail,
              },
            },
          },
          {
            model: db_Subject,
            include: [
              {
                model: db_AcademicYear,
                include: [
                  {
                    model: db_Department,
                    include: [
                      {
                        model: db_Faculty,
                        include: [
                          {
                            model: db_University,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_Group,
            include: [
              {
                model: db_GroupSchedule,
              },
              {
                model: db_Lesson,
              },
              {
                model: db_CourseSubscribe,
                required: false,
                where: { paymentResult: 'CAPTURED' },
                include: [
                  {
                    model: db_Student,
                  },
                  {
                    model: db_RatingAndReview,
                  },
                ],
              },
            ],
          },
          {
            model: db_Lesson,
          },
          {
            model: db_CourseSubscribe,
            required: false,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Student,
              },
              {
                model: db_RatingAndReview,
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

//---------------------------------------------------------------
//List Course NO Date
//---------------------------------------------------------------
exports.listCourseNoDate = async (req, res) => {
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
      if (req.query.method != 'both') {
        //Do Pagination & Method 1 or 0
        data = await listCourseNoDate_DoPagination_Method_1_or_0(
          req,
          skip,
          _limit
        );
      } else {
        //Do Pagination & Both
        data = await listCourseNoDate_DoPagination_Method_Both(
          req,
          skip,
          _limit
        );
      }
    } else {
      if (req.query.method != 'both') {
        //NO Pagination & Method 1 or 0
        data = await listCourseNoDate_NOPagination_Method_1_or_0(req);
      } else {
        //NO Pagination & Method Both
        data = await listCourseNoDate_NOPagination_Method_Both(req);
      }
    }

    //Add Rating info to each course in the data array
    data = await addCourseRatingIngoToEachCourseInData(data).catch((error) => {
      console.log(error);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
          .ORM_OPERATION_FAILED,
        ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
      );
    });

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

function listCourseNoDate_DoPagination_Method_Both(req, skip, _limit) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name_ar: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
                {
                  name_en: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
              ],
            },
            {
              method: {
                [Op.in]: ['0', '1'],
              },
            },
          ],
        },
        include: [
          {
            model: db_Instructor,
          },
          {
            model: db_Subject,
            include: [
              {
                model: db_AcademicYear,
                include: [
                  {
                    model: db_Department,
                    include: [
                      {
                        model: db_Faculty,
                        include: [
                          {
                            model: db_University,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_Group,
            include: [
              {
                model: db_GroupSchedule,
              },
              {
                model: db_Lesson,
              },
              {
                model: db_CourseSubscribe,
                required: false,
                where: { paymentResult: 'CAPTURED' },
                include: [
                  {
                    model: db_Student,
                  },
                  {
                    model: db_RatingAndReview,
                  },
                ],
              },
            ],
          },
          {
            model: db_Lesson,
          },
          {
            model: db_CourseSubscribe,
            required: false,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Student,
              },
              {
                model: db_RatingAndReview,
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

function listCourseNoDate_DoPagination_Method_1_or_0(req, skip, _limit) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name_ar: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
                {
                  name_en: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
              ],
            },
            {
              method: req.query.method,
            },
          ],
        },
        include: [
          {
            model: db_Instructor,
          },
          {
            model: db_Subject,
            include: [
              {
                model: db_AcademicYear,
                include: [
                  {
                    model: db_Department,
                    include: [
                      {
                        model: db_Faculty,
                        include: [
                          {
                            model: db_University,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_Group,
            include: [
              {
                model: db_GroupSchedule,
              },
              {
                model: db_Lesson,
              },
              {
                model: db_CourseSubscribe,
                required: false,
                where: { paymentResult: 'CAPTURED' },
                include: [
                  {
                    model: db_Student,
                  },
                  {
                    model: db_RatingAndReview,
                  },
                ],
              },
            ],
          },
          {
            model: db_Lesson,
          },
          {
            model: db_CourseSubscribe,
            required: false,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Student,
              },
              {
                model: db_RatingAndReview,
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

function listCourseNoDate_NOPagination_Method_Both(req) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name_ar: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
                {
                  name_en: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
              ],
            },
            {
              method: {
                [Op.in]: ['0', '1'],
              },
            },
          ],
        },
        include: [
          {
            model: db_Instructor,
          },
          {
            model: db_Subject,
            include: [
              {
                model: db_AcademicYear,
                include: [
                  {
                    model: db_Department,
                    include: [
                      {
                        model: db_Faculty,
                        include: [
                          {
                            model: db_University,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_Group,
            include: [
              {
                model: db_GroupSchedule,
              },
              {
                model: db_Lesson,
              },
              {
                model: db_CourseSubscribe,
                required: false,
                where: { paymentResult: 'CAPTURED' },
                include: [
                  {
                    model: db_Student,
                  },
                  {
                    model: db_RatingAndReview,
                  },
                ],
              },
            ],
          },
          {
            model: db_Lesson,
          },
          {
            model: db_CourseSubscribe,
            required: false,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Student,
              },
              {
                model: db_RatingAndReview,
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

function listCourseNoDate_NOPagination_Method_1_or_0(req) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name_ar: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
                {
                  name_en: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
              ],
            },
            {
              method: req.query.method,
            },
          ],
        },
        include: [
          {
            model: db_Instructor,
          },
          {
            model: db_Subject,
            include: [
              {
                model: db_AcademicYear,
                include: [
                  {
                    model: db_Department,
                    include: [
                      {
                        model: db_Faculty,
                        include: [
                          {
                            model: db_University,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_Group,
            include: [
              {
                model: db_GroupSchedule,
              },
              {
                model: db_Lesson,
              },
              {
                model: db_CourseSubscribe,
                required: false,
                where: { paymentResult: 'CAPTURED' },
                include: [
                  {
                    model: db_Student,
                  },
                  {
                    model: db_RatingAndReview,
                  },
                ],
              },
            ],
          },
          {
            model: db_Lesson,
          },
          {
            model: db_CourseSubscribe,
            required: false,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Student,
              },
              {
                model: db_RatingAndReview,
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

//---------------------------------------------------------------
//List Course NO Date By Department
//---------------------------------------------------------------
exports.listCourseNoDateByDepartment = async (req, res) => {
  //Check if the Dept is already exsits
  let dept = await db_Department.findOne({
    where: {
      id: req.params.departmentId,
    },
  });

  if (!dept) {
    console.log('!department');
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
      ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_DEPARTMENT
    );
  }

  //
  let orderBy = '';
  if (req.query.orderBy) {
    orderBy =
      req.query.orderBy.trim() === 'DESC' ? 'createdAt DESC' : 'createdAt ASC';
  } else {
    orderBy = 'createdAt ASC';
  }

  //
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
      if (req.query.method != 'both') {
        //Do Pagination & Method 1 or 0
        data = await listCourseNoDateByDepartment_DoPagination_Method_1_or_0(
          req,
          skip,
          _limit,
          orderBy
        );
      } else {
        //Do Pagination & Both
        data = await listCourseNoDateByDepartment_DoPagination_Method_Both(
          req,
          skip,
          _limit,
          orderBy
        );
      }
    } else {
      if (req.query.method != 'both') {
        //NO Pagination & Method 1 or 0
        data = await listCourseNoDateByDepartment_NOPagination_Method_1_or_0(
          req,
          orderBy
        );
      } else {
        //NO Pagination & Method Both
        data = await listCourseNoDateByDepartment_NOPagination_Method_Both(
          req,
          orderBy
        );
      }
    }

    //Add Rating info to each course in the data array
    data = await addCourseRatingIngoToEachCourseInData(data).catch((error) => {
      console.log(error);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
          .ORM_OPERATION_FAILED,
        ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
      );
    });

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

function listCourseNoDateByDepartment_DoPagination_Method_1_or_0(
  req,
  skip,
  _limit,
  orderBy
) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name_ar: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
                {
                  name_en: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
              ],
            },
            {
              method: req.query.method,
            },
          ],
        },
        include: [
          {
            model: db_Instructor,
          },
          {
            model: db_Subject,
            required: true,
            include: [
              {
                model: db_AcademicYear,
                required: true,
                include: [
                  {
                    model: db_Department,
                    required: true,
                    where: {
                      id: req.params.departmentId,
                    },
                    include: [
                      {
                        model: db_Faculty,
                        include: [
                          {
                            model: db_University,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_Group,
            include: [
              {
                model: db_GroupSchedule,
              },
              {
                model: db_Lesson,
              },
              {
                model: db_CourseSubscribe,
                required: false,
                where: { paymentResult: 'CAPTURED' },
                include: [
                  {
                    model: db_Student,
                  },
                  {
                    model: db_RatingAndReview,
                  },
                ],
              },
            ],
          },
          {
            model: db_Lesson,
          },
          {
            model: db_CourseSubscribe,
            required: false,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Student,
              },
              {
                model: db_RatingAndReview,
              },
            ],
          },
        ],
        distinct: true,
        offset: skip,
        limit: _limit,
        order: Sequelize.literal(orderBy),
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

function listCourseNoDateByDepartment_DoPagination_Method_Both(
  req,
  skip,
  _limit,
  orderBy
) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name_ar: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
                {
                  name_en: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
              ],
            },
            {
              method: {
                [Op.in]: ['0', '1'],
              },
            },
          ],
        },

        include: [
          {
            model: db_Instructor,
          },
          {
            model: db_Subject,
            required: true,
            include: [
              {
                model: db_AcademicYear,
                required: true,
                include: [
                  {
                    model: db_Department,
                    required: true,
                    where: {
                      id: req.params.departmentId,
                    },
                    include: [
                      {
                        model: db_Faculty,
                        include: [
                          {
                            model: db_University,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_Group,
            include: [
              {
                model: db_GroupSchedule,
              },
              {
                model: db_Lesson,
              },
              {
                model: db_CourseSubscribe,
                required: false,
                where: { paymentResult: 'CAPTURED' },
                include: [
                  {
                    model: db_Student,
                  },
                  {
                    model: db_RatingAndReview,
                  },
                ],
              },
            ],
          },
          {
            model: db_Lesson,
          },
          {
            model: db_CourseSubscribe,
            required: false,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Student,
              },
              {
                model: db_RatingAndReview,
              },
            ],
          },
        ],
        distinct: true,
        offset: skip,
        limit: _limit,
        order: Sequelize.literal(orderBy),
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

function listCourseNoDateByDepartment_NOPagination_Method_1_or_0(req, orderBy) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name_ar: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
                {
                  name_en: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
              ],
            },
            {
              method: req.query.method,
            },
          ],
        },

        include: [
          {
            model: db_Instructor,
          },
          {
            model: db_Subject,
            required: true,
            include: [
              {
                model: db_AcademicYear,
                required: true,
                include: [
                  {
                    model: db_Department,
                    required: true,
                    where: {
                      id: req.params.departmentId,
                    },
                    include: [
                      {
                        model: db_Faculty,
                        include: [
                          {
                            model: db_University,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_Group,
            include: [
              {
                model: db_GroupSchedule,
              },
              {
                model: db_Lesson,
              },
              {
                model: db_CourseSubscribe,
                required: false,
                where: { paymentResult: 'CAPTURED' },
                include: [
                  {
                    model: db_Student,
                  },
                  {
                    model: db_RatingAndReview,
                  },
                ],
              },
            ],
          },
          {
            model: db_Lesson,
          },
          {
            model: db_CourseSubscribe,
            required: false,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Student,
              },
              {
                model: db_RatingAndReview,
              },
            ],
          },
        ],
        distinct: true,
        order: Sequelize.literal(orderBy),
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

function listCourseNoDateByDepartment_NOPagination_Method_Both(req, orderBy) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name_ar: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
                {
                  name_en: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
              ],
            },
            {
              method: {
                [Op.in]: ['0', '1'],
              },
            },
          ],
        },

        include: [
          {
            model: db_Instructor,
          },
          {
            model: db_Subject,
            required: true,
            include: [
              {
                model: db_AcademicYear,
                required: true,
                include: [
                  {
                    model: db_Department,
                    required: true,
                    where: {
                      id: req.params.departmentId,
                    },
                    include: [
                      {
                        model: db_Faculty,
                        include: [
                          {
                            model: db_University,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_Group,
            include: [
              {
                model: db_GroupSchedule,
              },
              {
                model: db_Lesson,
              },
              {
                model: db_CourseSubscribe,
                required: false,
                where: { paymentResult: 'CAPTURED' },
                include: [
                  {
                    model: db_Student,
                  },
                  {
                    model: db_RatingAndReview,
                  },
                ],
              },
            ],
          },
          {
            model: db_Lesson,
          },
          {
            model: db_CourseSubscribe,
            required: false,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Student,
              },
              {
                model: db_RatingAndReview,
              },
            ],
          },
        ],
        distinct: true,
        order: Sequelize.literal(orderBy),
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

//---------------------------------------------------------------
//List Course NO Date By Instructor
//---------------------------------------------------------------
exports.listCourseNoDateByInstructor = async (req, res) => {
  //Check if the inst is already exsits
  let instructor = await db_Instructor.findOne({
    where: {
      id: req.params.instructorId,
    },
  });

  if (!instructor) {
    console.log('!instructor');
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
      ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_INSTRUCTOR
    );
  }

  //
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
      if (req.query.method != 'both') {
        //Do Pagination & Method 1 or 0
        data = await listCourseNoDateByInstructor_DoPagination_Method_1_or_0(
          req,
          skip,
          _limit
        );
      } else {
        //Do Pagination & Both
        data = await listCourseNoDateByInstructor_DoPagination_Method_Both(
          req,
          skip,
          _limit
        );
      }
    } else {
      if (req.query.method != 'both') {
        //NO Pagination & Method 1 or 0
        data = await listCourseNoDateByInstructor_NOPagination_Method_1_or_0(
          req
        );
      } else {
        //NO Pagination & Method Both
        data = await listCourseNoDateByInstructor_NOPagination_Method_Both(req);
      }
    }

    //Add Rating info to each course in the data array
    data = await addCourseRatingIngoToEachCourseInData(data).catch((error) => {
      console.log(error);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
          .ORM_OPERATION_FAILED,
        ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
      );
    });

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

function listCourseNoDateByInstructor_DoPagination_Method_1_or_0(
  req,
  skip,
  _limit
) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name_ar: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
                {
                  name_en: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
              ],
            },
            {
              method: req.query.method,
            },
          ],
        },
        include: [
          {
            model: db_Instructor,
            required: true,
            where: {
              id: req.params.instructorId,
            },
          },
          {
            model: db_Subject,
            include: [
              {
                model: db_AcademicYear,
                include: [
                  {
                    model: db_Department,
                    include: [
                      {
                        model: db_Faculty,
                        include: [
                          {
                            model: db_University,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_Group,
            include: [
              {
                model: db_GroupSchedule,
              },
              {
                model: db_Lesson,
              },
              {
                model: db_CourseSubscribe,
                required: false,
                where: { paymentResult: 'CAPTURED' },
                include: [
                  {
                    model: db_Student,
                  },
                  {
                    model: db_RatingAndReview,
                  },
                ],
              },
            ],
          },
          {
            model: db_Lesson,
          },
          {
            model: db_CourseSubscribe,
            required: false,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Student,
              },
              {
                model: db_RatingAndReview,
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

function listCourseNoDateByInstructor_DoPagination_Method_Both(
  req,
  skip,
  _limit
) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name_ar: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
                {
                  name_en: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
              ],
            },
            {
              method: {
                [Op.in]: ['0', '1'],
              },
            },
          ],
        },
        include: [
          {
            model: db_Instructor,
            required: true,
            where: {
              id: req.params.instructorId,
            },
          },
          {
            model: db_Subject,
            include: [
              {
                model: db_AcademicYear,
                include: [
                  {
                    model: db_Department,
                    include: [
                      {
                        model: db_Faculty,
                        include: [
                          {
                            model: db_University,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_Group,
            include: [
              {
                model: db_GroupSchedule,
              },
              {
                model: db_Lesson,
              },
              {
                model: db_CourseSubscribe,
                required: false,
                where: { paymentResult: 'CAPTURED' },
                include: [
                  {
                    model: db_Student,
                  },
                  {
                    model: db_RatingAndReview,
                  },
                ],
              },
            ],
          },
          {
            model: db_Lesson,
          },
          {
            model: db_CourseSubscribe,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Student,
              },
              {
                model: db_RatingAndReview,
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

function listCourseNoDateByInstructor_NOPagination_Method_1_or_0(req) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name_ar: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
                {
                  name_en: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
              ],
            },
            {
              method: req.query.method,
            },
          ],
        },
        include: [
          {
            model: db_Instructor,
            required: true,
            where: {
              id: req.params.instructorId,
            },
          },
          {
            model: db_Subject,
            include: [
              {
                model: db_AcademicYear,
                include: [
                  {
                    model: db_Department,
                    include: [
                      {
                        model: db_Faculty,
                        include: [
                          {
                            model: db_University,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_Group,
            include: [
              {
                model: db_GroupSchedule,
              },
              {
                model: db_Lesson,
              },
              {
                model: db_CourseSubscribe,
                where: { paymentResult: 'CAPTURED' },
                include: [
                  {
                    model: db_Student,
                  },
                  {
                    model: db_RatingAndReview,
                  },
                ],
              },
            ],
          },
          {
            model: db_Lesson,
          },
          {
            model: db_CourseSubscribe,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Student,
              },
              {
                model: db_RatingAndReview,
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

function listCourseNoDateByInstructor_NOPagination_Method_Both(req) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name_ar: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
                {
                  name_en: {
                    [Op.substring]: req.query.searchKey,
                  },
                },
              ],
            },
            {
              method: {
                [Op.in]: ['0', '1'],
              },
            },
          ],
        },
        include: [
          {
            model: db_Instructor,
            required: true,
            where: {
              id: req.params.instructorId,
            },
          },
          {
            model: db_Subject,
            include: [
              {
                model: db_AcademicYear,
                include: [
                  {
                    model: db_Department,
                    include: [
                      {
                        model: db_Faculty,
                        include: [
                          {
                            model: db_University,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_Group,
            include: [
              {
                model: db_GroupSchedule,
              },
              {
                model: db_Lesson,
              },
              {
                model: db_CourseSubscribe,
                where: { paymentResult: 'CAPTURED' },
                include: [
                  {
                    model: db_Student,
                  },
                  {
                    model: db_RatingAndReview,
                  },
                ],
              },
            ],
          },
          {
            model: db_Lesson,
          },
          {
            model: db_CourseSubscribe,
            where: { paymentResult: 'CAPTURED' },
            include: [
              {
                model: db_Student,
              },
              {
                model: db_RatingAndReview,
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

////////////////////////////////////
///////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////

//---------------------------------------------------------------
exports.listCourseOriginal = async (req, res) => {
  //Filters
  let searchKey = req.query.searchKey ? req.query.searchKey : '%%';
  let type = req.query.type ? req.query.type : '%%';
  let method = req.query.method ? req.query.method : '%%';
  let universityId = req.query.universityId ? req.query.universityId : '%%';
  let facultyId = req.query.facultyId ? req.query.facultyId : '%%';
  let departmentId = req.query.departmentId ? req.query.departmentId : '%%';
  let academicYearId = req.query.academicYearId
    ? req.query.academicYearId
    : '%%';
  let subjectId = req.query.subjectId ? req.query.subjectId : '%%';

  //Filter with date range or without date range for courses start Date
  let startFrom;
  let startTo;
  let startDateMinMaxDate;
  if (req.query.startFrom && req.query.startTo) {
    startFrom = req.query.startFrom;
    startTo = req.query.startTo;
  } else {
    //Set startFrom and startTo to min and max date of the table
    startDateMinMaxDate = await Helper.getColumnMinMax(
      Sequelize,
      db_Course,
      'startDate'
    );
    startDateMinMaxDate = startDateMinMaxDate.get({ plain: true });
    startFrom = startDateMinMaxDate.min;
    startTo = startDateMinMaxDate.max;
  }

  //Check role from token if instructor return courses for that instructor only not all courses
  let instructorId;
  if (req.userRoles && req.userRoles[0] === 'instructor') {
    instructorId = req.instructorId;
  } else {
    instructorId = req.query.instructorId ? req.query.instructorId : '%%';
  }

  //Order Data Based on created At of course
  let orderBy = '';
  if (req.query.orderBy) {
    orderBy =
      req.query.orderBy.trim() === 'DESC'
        ? 'courses.createdAt DESC'
        : 'courses.createdAt ASC';
  } else {
    orderBy = 'courses.createdAt ASC';
  }

  //
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
      //Do Pagination
      data = await listCourseOriginal_DoPagination(
        req,
        searchKey,
        type,
        method,
        instructorId,
        universityId,
        facultyId,
        departmentId,
        academicYearId,
        subjectId,
        startFrom,
        startTo,
        skip,
        _limit,
        orderBy
      ).catch((error) => {
        console.log(error);
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
            .ORM_OPERATION_FAILED,
          ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
        );
      });
    } else {
      //NO Pagination
      data = await listCourseOriginal_NOPagination(
        req,
        searchKey,
        type,
        method,
        instructorId,
        universityId,
        facultyId,
        departmentId,
        academicYearId,
        subjectId,
        startFrom,
        startTo,
        orderBy
      ).catch((error) => {
        console.log(error);
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
            .ORM_OPERATION_FAILED,
          ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
        );
      });
    }

    //Add Rating info to each course in the data array
    data = await addCourseRatingIngoToEachCourseInData(data).catch((error) => {
      console.log(error);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
          .ORM_OPERATION_FAILED,
        ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
      );
    });

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

function listCourseOriginal_NOPagination(
  req,
  searchKey,
  type,
  method,
  instructorId,
  universityId,
  facultyId,
  departmentId,
  academicYearId,
  subjectId,
  startFrom,
  startTo,
  orderBy
) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name_ar: {
                    [Op.substring]: searchKey,
                  },
                },
                {
                  name_en: {
                    [Op.substring]: searchKey,
                  },
                },
              ],
            },
            {
              type: {
                [Op.like]: type,
              },
            },
            {
              method: {
                [Op.like]: method,
              },
            },
            {
              startDate: {
                [Op.between]: [startFrom, startTo],
              },
            },
          ],
        },
        include: [
          {
            model: db_Instructor,
            where: {
              id: { [Op.like]: instructorId },
            },
          },
          {
            model: db_Subject,
            where: { id: { [Op.like]: subjectId } },
            include: [
              {
                model: db_AcademicYear,
                where: { id: { [Op.like]: academicYearId } },
                include: [
                  {
                    model: db_Department,
                    where: { id: { [Op.like]: departmentId } },
                    include: [
                      {
                        model: db_Faculty,
                        where: { id: { [Op.like]: facultyId } },
                        include: [
                          {
                            model: db_University,
                            where: { id: { [Op.like]: universityId } },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_Group,
            include: [
              {
                model: db_GroupSchedule,
              },
              {
                model: db_Lesson,
              },
            ],
          },
          {
            model: db_Lesson,
          },
        ],
        distinct: true,
        order: Sequelize.literal(orderBy),
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

function listCourseOriginal_DoPagination(
  req,
  searchKey,
  type,
  method,
  instructorId,
  universityId,
  facultyId,
  departmentId,
  academicYearId,
  subjectId,
  startFrom,
  startTo,
  skip,
  _limit,
  orderBy
) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name_ar: {
                    [Op.substring]: searchKey,
                  },
                },
                {
                  name_en: {
                    [Op.substring]: searchKey,
                  },
                },
              ],
            },
            {
              type: {
                [Op.like]: type,
              },
            },
            {
              method: {
                [Op.like]: method,
              },
            },
            {
              startDate: {
                [Op.between]: [startFrom, startTo],
              },
            },
          ],
        },
        include: [
          {
            model: db_Instructor,
            where: {
              id: { [Op.like]: instructorId },
            },
          },
          {
            model: db_Subject,
            where: { id: { [Op.like]: subjectId } },
            include: [
              {
                model: db_AcademicYear,
                where: { id: { [Op.like]: academicYearId } },
                include: [
                  {
                    model: db_Department,
                    where: { id: { [Op.like]: departmentId } },
                    include: [
                      {
                        model: db_Faculty,
                        where: { id: { [Op.like]: facultyId } },
                        include: [
                          {
                            model: db_University,
                            where: { id: { [Op.like]: universityId } },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_Group,
            include: [
              {
                model: db_GroupSchedule,
              },
              {
                model: db_Lesson,
              },
            ],
          },
          {
            model: db_Lesson,
          },
        ],
        distinct: true,
        offset: skip,
        limit: _limit,
        order: Sequelize.literal(orderBy),
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
