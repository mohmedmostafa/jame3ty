const db = require('../..');
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
const { Sequelize, connection } = require('../..');

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
const db_connection = db.connection;
const db_CourseSubscribe = db.CourseSubscribe;
const db_Student = db.Student;
const db_Lesson = db.Lesson;
const db_Instructor = db.Instructor;

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
      ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
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
      ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
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

  //Create Attachment String
  if (req.files.vedio) {
    let field_2 = [];
    req.files['vedio'].forEach((file) => {
      let fileUrl = file.path.replace(/\\/g, '/');
      field_2.push(fileUrl);
    });
    req.body.vedio = field_2.join();
  }

  console.log(req.body);

  //If the Course Methiod is 'Recorded Lessons'
  if (req.params.method === '0') {
    addRecordedLessonsCourse(req, res, instructor);
  } else {
    //If the Course Methiod is 'Live Streaming'
    addLiveStreamingCourse(req, res, instructor);
  }
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
      startDate: req.body.startDate,
      type: req.body.type,
      method: req.params.method,
      img: req.body.img ? req.body.img : '',
      vedio: req.body.vedio ? req.body.vedio : '',
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
          startDate: req.body.startDate,
          type: req.body.type,
          method: req.params.method,
          img: req.body.img ? req.body.img : '',
          vedio: req.body.vedio ? req.body.vedio : '',
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
          startDate: req.body.startDateGroup,
          endDate: req.body.endDateGroup,
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
      include: [
        {
          model: db_CourseSubscribe,
          include: [{ model: db_Student }],
        },
      ],
    });

    if (!course) {
      console.log('!course');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
      );
    }
    //course = course.get({ plain: true });

    console.log(course);

    //If Students Subscribe the course then can not delete it
    if (course.courseSubscribes.length > 0) {
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.code,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.type
          .RESOURCE_HAS_DEPENDENTS,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_HAS_DEPENDENTS
      );
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
              include: [
                {
                  model: db_Student,
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
          include: [
            {
              model: db_Student,
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
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
      );
    }

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
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
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

      if (moment(req.body.startDate).isAfter(minStartDateGroup.minStartDate)) {
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
        startDate: req.body.startDate ? req.body.startDate : course.startDate,
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
  const doPagination = parseInt(req.query.doPagination);

  //Query
  try {
    let data;
    if (doPagination) {
      if (req.query.method != 'both') {
        //Do Pagination & Method 1 or 0
        data = await listCourse_DoPagination_Method_1_or_0(
          req,
          db_Course,
          db_Group,
          db_GroupSchedule
        );
      } else {
        //Do Pagination & Both
        data = await listCourse_DoPagination_Method_Both(
          req,
          db_Course,
          db_Group,
          db_GroupSchedule
        );
      }
    } else {
      if (req.query.method != 'both') {
        //NO Pagination & Method 1 or 0
        data = await listCourse_NOPagination_Method_1_or_0(
          req,
          db_Course,
          db_Group,
          db_GroupSchedule
        );
      } else {
        //NO Pagination & Method Both
        data = await listCourse_NOPagination_Method_Both(
          req,
          db_Course,
          db_Group,
          db_GroupSchedule
        );
      }
    }

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { data }
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
  db_Course,
  db_Group,
  db_GroupSchedule
) {
  return new Promise(async (resolve, reject) => {
    const doPagination = parseInt(req.query.doPagination);
    const numPerPage = parseInt(req.query.numPerPage);
    const page = parseInt(req.query.page);

    //Count all rows
    let numRows = await db_Course
      .count({
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
                [Op.between]: [req.query.startFrom, req.query.startTo],
              },
            },
          ],
        },
      })
      .catch((error) => {
        console.log(error);
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
            .ORM_OPERATION_FAILED,
          ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
        );
      });
    numRows = parseInt(numRows);

    //Total num of valid pages
    let numPages = Math.ceil(numRows / numPerPage);

    //Calc skip or offset to be used in limit
    let skip = (page - 1) * numPerPage;
    let _limit = numPerPage;

    //
    let data = await db_Course
      .findAll({
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
                [Op.between]: [req.query.startFrom, req.query.startTo],
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
                include: [
                  {
                    model: db_Student,
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
        console.log(err);
        return reject(err);
      });

    let result = {
      doPagination,
      numRows,
      numPerPage,
      numPages,
      page,
      data,
    };

    return resolve(result);
  });
}

function listCourse_DoPagination_Method_1_or_0(
  req,
  db_Course,
  db_Group,
  db_GroupSchedule
) {
  return new Promise(async (resolve, reject) => {
    const doPagination = parseInt(req.query.doPagination);
    const numPerPage = parseInt(req.query.numPerPage);
    const page = parseInt(req.query.page);

    //Count all rows
    let numRows = await db_Course
      .count({
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
                [Op.between]: [req.query.startFrom, req.query.startTo],
              },
            },
          ],
        },
      })
      .catch((error) => {
        console.log(error);
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
            .ORM_OPERATION_FAILED,
          ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
        );
      });
    numRows = parseInt(numRows);

    //Total num of valid pages
    let numPages = Math.ceil(numRows / numPerPage);

    //Calc skip or offset to be used in limit
    let skip = (page - 1) * numPerPage;
    let _limit = numPerPage;

    //
    let data = await db_Course
      .findAll({
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
                [Op.between]: [req.query.startFrom, req.query.startTo],
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
                include: [
                  {
                    model: db_Student,
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
        console.log(err);
        return reject(err);
      });

    let result = {
      doPagination,
      numRows,
      numPerPage,
      numPages,
      page,
      data,
    };

    return resolve(result);
  });
}

function listCourse_NOPagination_Method_Both(
  req,
  db_Course,
  db_Group,
  db_GroupSchedule
) {
  return new Promise(async (resolve, reject) => {
    const doPagination = parseInt(req.query.doPagination);
    const numPerPage = parseInt(req.query.numPerPage);
    const page = parseInt(req.query.page);

    //Count all rows
    let numRows = await db_Course
      .count({
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
                [Op.between]: [req.query.startFrom, req.query.startTo],
              },
            },
          ],
        },
      })
      .catch((error) => {
        console.log(error);
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
            .ORM_OPERATION_FAILED,
          ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
        );
      });
    numRows = parseInt(numRows);

    //Total num of valid pages
    let numPages = Math.ceil(numRows / numPerPage);

    //Calc skip or offset to be used in limit
    let skip = (page - 1) * numPerPage;
    let _limit = numPerPage;

    //
    let data = await db_Course
      .findAll({
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
                [Op.between]: [req.query.startFrom, req.query.startTo],
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
                include: [
                  {
                    model: db_Student,
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
            include: [
              {
                model: db_Student,
              },
            ],
          },
        ],
      })
      .catch((err) => {
        console.log(err);
        return reject(err);
      });

    let result = {
      doPagination,
      numRows,
      numPerPage,
      numPages,
      page,
      data,
    };

    return resolve(result);
  });
}

function listCourse_NOPagination_Method_1_or_0(
  req,
  db_Course,
  db_Group,
  db_GroupSchedule
) {
  return new Promise(async (resolve, reject) => {
    const doPagination = parseInt(req.query.doPagination);
    const numPerPage = parseInt(req.query.numPerPage);
    const page = parseInt(req.query.page);

    //Count all rows
    let numRows = await db_Course
      .count({
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
                [Op.between]: [req.query.startFrom, req.query.startTo],
              },
            },
          ],
        },
      })
      .catch((error) => {
        console.log(error);
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
            .ORM_OPERATION_FAILED,
          ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
        );
      });
    numRows = parseInt(numRows);

    //Total num of valid pages
    let numPages = Math.ceil(numRows / numPerPage);

    //Calc skip or offset to be used in limit
    let skip = (page - 1) * numPerPage;
    let _limit = numPerPage;

    //
    let data = await db_Course
      .findAll({
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
                [Op.between]: [req.query.startFrom, req.query.startTo],
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
                include: [
                  {
                    model: db_Student,
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
            include: [
              {
                model: db_Student,
              },
            ],
          },
        ],
      })
      .catch((err) => {
        console.log(err);
        return reject(err);
      });

    let result = {
      doPagination,
      numRows,
      numPerPage,
      numPages,
      page,
      data,
    };

    return resolve(result);
  });
}

//---------------------------------------------------------------
//List Course NO Date
//---------------------------------------------------------------
exports.listCourseNoDate = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);

  //Query
  try {
    let data;
    if (doPagination) {
      if (req.query.method != 'both') {
        //Do Pagination & Method 1 or 0
        data = await listCourseNoDate_DoPagination_Method_1_or_0(
          req,
          res,
          db_Course,
          db_Group,
          db_GroupSchedule
        );
      } else {
        //Do Pagination & Both
        data = await listCourseNoDate_DoPagination_Method_Both(
          req,
          res,
          db_Course,
          db_Group,
          db_GroupSchedule
        );
      }
    } else {
      if (req.query.method != 'both') {
        //NO Pagination & Method 1 or 0
        data = await listCourseNoDate_NOPagination_Method_1_or_0(
          req,
          res,
          db_Course,
          db_Group,
          db_GroupSchedule
        );
      } else {
        //NO Pagination & Method Both
        data = await listCourseNoDate_NOPagination_Method_Both(
          req,
          res,
          db_Course,
          db_Group,
          db_GroupSchedule
        );
      }
    }

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { data }
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

function listCourseNoDate_DoPagination_Method_Both(
  req,
  res,
  db_Course,
  db_Group,
  db_GroupSchedule
) {
  return new Promise(async (resolve, reject) => {
    const doPagination = parseInt(req.query.doPagination);
    const numPerPage = parseInt(req.query.numPerPage);
    const page = parseInt(req.query.page);

    //Count all rows
    let numRows = await db_Course
      .count({
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
      })
      .catch((error) => {
        console.log(error);
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
            .ORM_OPERATION_FAILED,
          ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
        );
      });
    numRows = parseInt(numRows);

    //Total num of valid pages
    let numPages = Math.ceil(numRows / numPerPage);

    //Calc skip or offset to be used in limit
    let skip = (page - 1) * numPerPage;
    let _limit = numPerPage;

    //
    let data = await db_Course
      .findAll({
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
                include: [
                  {
                    model: db_Student,
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
        console.log(err);
        return reject(err);
      });

    let result = {
      doPagination,
      numRows,
      numPerPage,
      numPages,
      page,
      data,
    };

    return resolve(result);
  });
}

function listCourseNoDate_DoPagination_Method_1_or_0(
  req,
  res,
  db_Course,
  db_Group,
  db_GroupSchedule
) {
  return new Promise(async (resolve, reject) => {
    const doPagination = parseInt(req.query.doPagination);
    const numPerPage = parseInt(req.query.numPerPage);
    const page = parseInt(req.query.page);

    //Count all rows
    let numRows = await db_Course
      .count({
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
      })
      .catch((error) => {
        console.log(error);
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
            .ORM_OPERATION_FAILED,
          ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
        );
      });
    numRows = parseInt(numRows);

    //Total num of valid pages
    let numPages = Math.ceil(numRows / numPerPage);

    //Calc skip or offset to be used in limit
    let skip = (page - 1) * numPerPage;
    let _limit = numPerPage;

    //
    let data = await db_Course
      .findAll({
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
                include: [
                  {
                    model: db_Student,
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
        console.log(err);
        return reject(err);
      });

    let result = {
      doPagination,
      numRows,
      numPerPage,
      numPages,
      page,
      data,
    };

    return resolve(result);
  });
}

function listCourseNoDate_NOPagination_Method_Both(
  req,
  res,
  db_Course,
  db_Group,
  db_GroupSchedule
) {
  return new Promise(async (resolve, reject) => {
    const doPagination = parseInt(req.query.doPagination);
    const numPerPage = parseInt(req.query.numPerPage);
    const page = parseInt(req.query.page);

    //Count all rows
    let numRows = await db_Course
      .count({
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
      })
      .catch((error) => {
        console.log(error);
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
            .ORM_OPERATION_FAILED,
          ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
        );
      });
    numRows = parseInt(numRows);

    //Total num of valid pages
    let numPages = Math.ceil(numRows / numPerPage);

    //Calc skip or offset to be used in limit
    let skip = (page - 1) * numPerPage;
    let _limit = numPerPage;

    //
    let data = await db_Course
      .findAll({
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
                include: [
                  {
                    model: db_Student,
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
            include: [
              {
                model: db_Student,
              },
            ],
          },
        ],
      })
      .catch((err) => {
        console.log(err);
        return reject(err);
      });

    let result = {
      doPagination,
      numRows,
      numPerPage,
      numPages,
      page,
      data,
    };

    return resolve(result);
  });
}

function listCourseNoDate_NOPagination_Method_1_or_0(
  req,
  res,
  db_Course,
  db_Group,
  db_GroupSchedule
) {
  return new Promise(async (resolve, reject) => {
    const doPagination = parseInt(req.query.doPagination);
    const numPerPage = parseInt(req.query.numPerPage);
    const page = parseInt(req.query.page);

    //Count all rows
    let numRows = await db_Course
      .count({
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
      })
      .catch((error) => {
        console.log(error);
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
            .ORM_OPERATION_FAILED,
          ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
        );
      });
    numRows = parseInt(numRows);

    //Total num of valid pages
    let numPages = Math.ceil(numRows / numPerPage);

    //Calc skip or offset to be used in limit
    let skip = (page - 1) * numPerPage;
    let _limit = numPerPage;

    //
    let data = await db_Course
      .findAll({
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
                include: [
                  {
                    model: db_Student,
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
            include: [
              {
                model: db_Student,
              },
            ],
          },
        ],
      })
      .catch((err) => {
        console.log(err);
        return reject(err);
      });

    let result = {
      doPagination,
      numRows,
      numPerPage,
      numPages,
      page,
      data,
    };

    return resolve(result);
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
      ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
    );
  }

  //
  const doPagination = parseInt(req.query.doPagination);

  //Query
  try {
    let data;
    if (doPagination) {
      if (req.query.method != 'both') {
        //Do Pagination & Method 1 or 0
        data = await listCourseNoDateByDepartment_DoPagination_Method_1_or_0(
          req,
          res
        );
      } else {
        //Do Pagination & Both
        data = await listCourseNoDateByDepartment_DoPagination_Method_Both(
          req,
          res
        );
      }
    } else {
      if (req.query.method != 'both') {
        //NO Pagination & Method 1 or 0
        data = await listCourseNoDateByDepartment_NOPagination_Method_1_or_0(
          req,
          res
        );
      } else {
        //NO Pagination & Method Both
        data = await listCourseNoDateByDepartment_NOPagination_Method_Both(
          req,
          res
        );
      }
    }

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { data }
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

function listCourseNoDateByDepartment_DoPagination_Method_1_or_0(req, res) {
  return new Promise(async (resolve, reject) => {
    const doPagination = parseInt(req.query.doPagination);
    const numPerPage = parseInt(req.query.numPerPage);
    const page = parseInt(req.query.page);

    //Count all rows
    const sql =
      'select count(*) as count from courses cr \
      inner join subjects sub on sub.id = cr.subjectId \
      inner join academicYears acy on acy.id = sub.academicYearId \
      inner join departments dept on dept.id = acy.departmentId \
      where dept.id = ? and (cr.name_ar like ? or cr.name_en like ?) and cr.method = ?';

    let numRows = await connection
      .query(sql, {
        replacements: [
          req.params.departmentId,
          `%${req.query.searchKey}%`,
          `%${req.query.searchKey}%`,
          req.query.method,
        ],
        logging: console.log,
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
      })
      .catch((error) => {
        console.log(error);
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
            .ORM_OPERATION_FAILED,
          ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
        );
      });
    console.log(numRows);
    numRows = parseInt(numRows.count);

    //Total num of valid pages
    let numPages = Math.ceil(numRows / numPerPage);

    //Calc skip or offset to be used in limit
    let skip = (page - 1) * numPerPage;
    let _limit = numPerPage;

    //
    let data = await db_Course
      .findAll({
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
        /*include: [
          {
            model: db_Group,
            include: [{ model: db_GroupSchedule }],
          },
          {
            model: db_Subject,
            required: true,
            attributes: [],
            include: [
              {
                model: db_AcademicYear,
                required: true,
                attributes: [],
                include: [
                  {
                    model: db_Department,
                    required: true,
                    attributes: [],
                    where: {
                      id: req.params.departmentId,
                    },
                  },
                ],
              },
            ],
          },
        ],*/
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
                include: [
                  {
                    model: db_Student,
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
        console.log(err);
        return reject(err);
      });

    let result = {
      doPagination,
      numRows,
      numPerPage,
      numPages,
      page,
      data,
    };

    return resolve(result);
  });
}

function listCourseNoDateByDepartment_DoPagination_Method_Both(req, res) {
  return new Promise(async (resolve, reject) => {
    const doPagination = parseInt(req.query.doPagination);
    const numPerPage = parseInt(req.query.numPerPage);
    const page = parseInt(req.query.page);

    //Count all rows
    const sql =
      'select count(*) as count from courses cr \
      inner join subjects sub on sub.id = cr.subjectId \
      inner join academicYears acy on acy.id = sub.academicYearId \
      inner join departments dept on dept.id = acy.departmentId \
      where dept.id = ? and (cr.name_ar like ? or cr.name_en like ?) and cr.method in (?,?)';

    let numRows = await connection
      .query(sql, {
        replacements: [
          req.params.departmentId,
          `%${req.query.searchKey}%`,
          `%${req.query.searchKey}%`,
          1,
          0,
        ],
        logging: console.log,
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
      })
      .catch((error) => {
        console.log(error);
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
            .ORM_OPERATION_FAILED,
          ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
        );
      });
    console.log(numRows);
    numRows = parseInt(numRows.count);

    //Total num of valid pages
    let numPages = Math.ceil(numRows / numPerPage);

    //Calc skip or offset to be used in limit
    let skip = (page - 1) * numPerPage;
    let _limit = numPerPage;

    //
    let data = await db_Course
      .findAll({
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
        /*include: [
          {
            model: db_Group,
            include: [{ model: db_GroupSchedule }],
          },
          {
            model: db_Subject,
            required: true,
            attributes: [],
            include: [
              {
                model: db_AcademicYear,
                required: true,
                attributes: [],
                include: [
                  {
                    model: db_Department,
                    required: true,
                    attributes: [],
                    where: {
                      id: req.params.departmentId,
                    },
                  },
                ],
              },
            ],
          },
        ],*/
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
                include: [
                  {
                    model: db_Student,
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
        console.log(err);
        return reject(err);
      });

    let result = {
      doPagination,
      numRows,
      numPerPage,
      numPages,
      page,
      data,
    };

    return resolve(result);
  });
}

function listCourseNoDateByDepartment_NOPagination_Method_1_or_0(req, res) {
  return new Promise(async (resolve, reject) => {
    const doPagination = parseInt(req.query.doPagination);
    const numPerPage = parseInt(req.query.numPerPage);
    const page = parseInt(req.query.page);

    //Count all rows
    const sql =
      'select count(*) as count from courses cr \
      inner join subjects sub on sub.id = cr.subjectId \
      inner join academicYears acy on acy.id = sub.academicYearId \
      inner join departments dept on dept.id = acy.departmentId \
      where dept.id = ? and (cr.name_ar like ? or cr.name_en like ?) and cr.method = ?';

    let numRows = await connection
      .query(sql, {
        replacements: [
          req.params.departmentId,
          `%${req.query.searchKey}%`,
          `%${req.query.searchKey}%`,
          req.query.method,
        ],
        logging: console.log,
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
      })
      .catch((error) => {
        console.log(error);
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
            .ORM_OPERATION_FAILED,
          ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
        );
      });
    console.log(numRows);
    numRows = parseInt(numRows.count);

    //Total num of valid pages
    let numPages = Math.ceil(numRows / numPerPage);

    //Calc skip or offset to be used in limit
    let skip = (page - 1) * numPerPage;
    let _limit = numPerPage;

    //
    let data = await db_Course
      .findAll({
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
        /*include: [
          {
            model: db_Group,
            include: [{ model: db_GroupSchedule }],
          },
          {
            model: db_Subject,
            required: true,
            attributes: [],
            include: [
              {
                model: db_AcademicYear,
                required: true,
                attributes: [],
                include: [
                  {
                    model: db_Department,
                    required: true,
                    attributes: [],
                    where: {
                      id: req.params.departmentId,
                    },
                  },
                ],
              },
            ],
          },
        ],*/
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
                include: [
                  {
                    model: db_Student,
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
            include: [
              {
                model: db_Student,
              },
            ],
          },
        ],
      })
      .catch((err) => {
        console.log(err);
        return reject(err);
      });

    let result = {
      doPagination,
      numRows,
      numPerPage,
      numPages,
      page,
      data,
    };

    return resolve(result);
  });
}

function listCourseNoDateByDepartment_NOPagination_Method_Both(req, res) {
  return new Promise(async (resolve, reject) => {
    const doPagination = parseInt(req.query.doPagination);
    const numPerPage = parseInt(req.query.numPerPage);
    const page = parseInt(req.query.page);

    //Count all rows
    const sql =
      'select count(*) as count from courses cr \
      inner join subjects sub on sub.id = cr.subjectId \
      inner join academicYears acy on acy.id = sub.academicYearId \
      inner join departments dept on dept.id = acy.departmentId \
      where dept.id = ? and (cr.name_ar like ? or cr.name_en like ?) and cr.method in (?,?)';

    let numRows = await connection
      .query(sql, {
        replacements: [
          req.params.departmentId,
          `%${req.query.searchKey}%`,
          `%${req.query.searchKey}%`,
          1,
          0,
        ],
        logging: console.log,
        raw: true,
        plain: true,
        type: QueryTypes.SELECT,
      })
      .catch((error) => {
        console.log(error);
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
            .ORM_OPERATION_FAILED,
          ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
        );
      });
    console.log(numRows);
    numRows = parseInt(numRows.count);

    //Total num of valid pages
    let numPages = Math.ceil(numRows / numPerPage);

    //Calc skip or offset to be used in limit
    let skip = (page - 1) * numPerPage;
    let _limit = numPerPage;

    //
    let data = await db_Course
      .findAll({
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
        /*include: [
          {
            model: db_Group,
            include: [{ model: db_GroupSchedule }],
          },
          {
            model: db_Subject,
            required: true,
            attributes: [],
            include: [
              {
                model: db_AcademicYear,
                required: true,
                attributes: [],
                include: [
                  {
                    model: db_Department,
                    required: true,
                    attributes: [],
                    where: {
                      id: req.params.departmentId,
                    },
                  },
                ],
              },
            ],
          },
        ],*/
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
                include: [
                  {
                    model: db_Student,
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
            include: [
              {
                model: db_Student,
              },
            ],
          },
        ],
      })
      .catch((err) => {
        console.log(err);
        return reject(err);
      });

    let result = {
      doPagination,
      numRows,
      numPerPage,
      numPages,
      page,
      data,
    };

    return resolve(result);
  });
}
