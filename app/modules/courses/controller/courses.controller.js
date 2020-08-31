const db = require('../..');
const { Response } = require('../../../common/response.handler');
const {
  onErrorDeleteFiles,
  deleteFile,
} = require('../../../common/multerConfig');
const moment = require('moment');
const { Sequelize } = require('../..');

const Op = db.Sequelize.Op;
const db_University = db.University;
const db_Faculty = db.Faculty;
const db_Course = db.Course;
const db_Group = db.Group;
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
    onErrorDeleteFiles(req);
    return Response(res, 400, 'Subject Not Found!', {});
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
    addRecordedLessonsCourse(req, res);
  } else {
    //If the Course Methiod is 'Live Streaming'
    addLiveStreamingCourse(req, res);
  }
};

//Add Course with 'Recorded Lessons' as a Method
async function addRecordedLessonsCourse(req, res) {
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
      price: req.body.price,
      priceBeforeDiscount: req.body.priceBeforeDiscount,
      startDate: req.body.startDate,
      type: req.body.type,
      method: req.params.method,
      img: req.body.img ? req.body.img : '',
      vedio: req.body.vedio ? req.body.vedio : '',
      subjectId: parseInt(req.body.subjectId),
      instructorId: req.userId,
    });

    //Success
    return Response(res, 200, 'Success!', { course });
  } catch (error) {
    console.log(error);
    onErrorDeleteFiles(req);
    return Response(res, 500, 'Fail to Add', { error });
  }
}

//Add Course with 'Live Streaming' as a Method
async function addLiveStreamingCourse(req, res) {
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
          price: req.body.price,
          priceBeforeDiscount: req.body.priceBeforeDiscount,
          startDate: req.body.startDate,
          type: req.body.type,
          method: req.params.method,
          img: req.body.img ? req.body.img : '',
          vedio: req.body.vedio ? req.body.vedio : '',
          subjectId: parseInt(req.body.subjectId),
          instructorId: req.userId,
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
          instructorId: req.userId,
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
    return Response(res, 200, 'Success!', { course });
  } catch (error) {
    onErrorDeleteFiles(req);
    return Response(res, 500, 'Fail to add', { error });
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
      return Response(res, 400, 'Course Not Found!', {});
    }
    //course = course.get({ plain: true });

    console.log(course);

    //If Students Subscribe the course then can not delete it
    if (course.coursesSubscribes.length > 0) {
      return Response(
        res,
        400,
        "Can't delete the course, The Course has subscription!",
        { course }
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
    return Response(res, 200, 'Success!', { course });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Delete!', { error });
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
        },
        {
          model: db_Group,
          include: [
            {
              model: db_Lesson,
            },
            {
              model: db_GroupSchedule,
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
          include: [
            {
              model: db_Group,
              include: [
                {
                  model: db_GroupSchedule,
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
          ],
        },
      ],
    });

    if (!course) {
      return Response(res, 400, 'Course Not Found!', {});
    }

    //Success
    return Response(res, 200, 'Success!', { course });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Delete!', { error });
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
      onErrorDeleteFiles(req);
      return Response(res, 400, 'Course Not Found!', {});
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
        return Response(
          res,
          400,
          "Startdate isn't valid, it must be before all start dates of all groups",
          { minStartDateGroup }
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
    return Response(res, 200, 'Success!', {});
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
  }
};

//---------------------------------------------------------------
exports.listCourse = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Count all rows
  let numRows = await db_Course.count({}).catch((error) => {
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
      if (req.query.method != 'both') {
        //Do Pagination & Method 1 or 0
        data = await listCourse_DoPagination_Method_1_or_0(
          req,
          db_Course,
          db_Group,
          db_GroupSchedule,
          skip,
          _limit
        );
      } else {
        //Do Pagination & Both
        data = await listCourse_DoPagination_Method_Both(
          req,
          db_Course,
          db_Group,
          db_GroupSchedule,
          skip,
          _limit
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

    let result = {
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

function listCourse_DoPagination_Method_Both(
  req,
  db_Course,
  db_Group,
  db_GroupSchedule,
  skip,
  _limit
) {
  return new Promise(async (resolve, reject) => {
    await db_Course
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
            model: db_Group,
            include: [{ model: db_GroupSchedule }],
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

function listCourse_DoPagination_Method_1_or_0(
  req,
  db_Course,
  db_Group,
  db_GroupSchedule,
  skip,
  _limit
) {
  return new Promise(async (resolve, reject) => {
    await db_Course
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
            model: db_Group,
            include: [{ model: db_GroupSchedule }],
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

function listCourse_NOPagination_Method_Both(
  req,
  db_Course,
  db_Group,
  db_GroupSchedule
) {
  return new Promise(async (resolve, reject) => {
    await db_Course
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
              startDate: {
                [Op.between]: [req.query.startFrom, req.query.startTo],
              },
            },
          ],
        },
        include: [
          {
            model: db_Group,
            include: [{ model: db_GroupSchedule }],
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

function listCourse_NOPagination_Method_1_or_0(
  req,
  db_Course,
  db_Group,
  db_GroupSchedule
) {
  return new Promise(async (resolve, reject) => {
    await db_Course
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
            model: db_Group,
            include: [{ model: db_GroupSchedule }],
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
