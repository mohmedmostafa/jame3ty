const db = require('../..');
const { Response } = require('../../../common/response.handler');
const { onErrorDeleteFiles } = require('../../../common/multerConfig');
const moment = require('moment');

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
    return Response(res, 500, 'Fail to add', { error });
  }
}

//---------------------------------------------------------------
exports.updateFaculty = async (req, res) => {
  try {
    //Check if the faculty is already exsits
    let faculty = await db_Faculty.findByPk(req.params.id);
    faculty = faculty.get({ plain: true });

    if (!faculty) {
      return Response(res, 400, 'Faculty Not Found!', {});
    }

    //Check the universityId is changed
    if (req.body.universityId != faculty.universityId) {
      //Check if the University is already exsits
      const university = await db_University.findByPk(
        parseInt(req.body.universityId)
      );

      if (!university) {
        return Response(res, 400, 'University Not Found!', {});
      }
    }

    //Do Update
    faculty = await db_Faculty.update(
      {
        name_ar: req.body.name_ar ? req.body.name_ar : faculty.name_ar,
        name_en: req.body.name_en ? req.body.name_en : faculty.name_en,
        universityId: req.body.universityId
          ? req.body.universityId
          : faculty.universityId,
      },
      { where: { id: req.params.id } }
    );

    //Success
    return Response(res, 200, 'Success!', { faculty });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
  }
};

//---------------------------------------------------------------
exports.deleteFaculty = async (req, res) => {
  try {
    //Check if the faculty is already exsits
    let faculty = await db_Faculty.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: db_AcademicYear,
        },
        {
          model: db_Department,
        },
      ],
    });

    if (!faculty) {
      return Response(res, 400, 'Faculty Not Found!', {});
    }

    faculty = faculty.get({ plain: true });

    //Check if the Universtiy has Faculty
    if (faculty.academicYears.length > 0 || faculty.departments.length > 0) {
      return Response(res, 400, "Can't Delete. Has Childs", {
        faculty,
      });
    }

    //Delete
    faculty = await db_Faculty.destroy({
      where: { id: req.params.id },
    });

    //Success
    return Response(res, 200, 'Success!', { faculty });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
  }
};

//---------------------------------------------------------------
exports.listFaculty = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Count all rows
  let numRows = await db_Faculty.count({}).catch((error) => {
    return Response(res, 500, 'Fail to Count!', { error });
  });
  numRows = parseInt(numRows);

  //Total num of valid pages
  let numPages = Math.ceil(numRows / numPerPage);

  //Calc skip or offset to be used in limit
  let skip = (page - 1) * numPerPage;
  let _limit = numPerPage;

  //Query
  let name_ar = req.query.name_ar ? req.query.name_ar : '';
  let name_en = req.query.name_en ? req.query.name_en : '';

  try {
    let data;
    if (doPagination) {
      data = await db_Faculty.findAll({
        where: {
          [Op.or]: [
            {
              name_ar: {
                [Op.substring]: name_ar,
              },
            },
            {
              name_en: {
                [Op.substring]: name_en,
              },
            },
          ],
        },
        include: [
          {
            model: db_AcademicYear,
          },
          {
            model: db_Department,
          },
        ],
        offset: skip,
        limit: _limit,
      });
    } else {
      data = await db_Faculty.findAll({
        where: {
          [Op.or]: [
            {
              name_ar: {
                [Op.substring]: name_ar,
              },
            },
            {
              name_en: {
                [Op.substring]: name_en,
              },
            },
          ],
        },
        include: [
          {
            model: db_AcademicYear,
          },
          {
            model: db_Department,
          },
        ],
      });
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
