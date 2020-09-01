const db = require('../..');
const { Response } = require('../../../common/response.handler');
const { onErrorDeleteFiles } = require('../../../common/multerConfig');
const moment = require('moment');

const Op = db.Sequelize.Op;
const db_Course = db.Course;
const db_Group = db.Group;
const db_GroupSchedule = db.GroupSchedule;
const db_connection = db.connection;
const db_CourseSubscribe = db.CourseSubscribe;
const db_Student = db.Student;
const db_Lesson = db.Lesson;
const db_Instructor = db.Instructor;

//---------------------------------------------------------------
exports.addGroup = async (req, res) => {
  //Check if the Course ID is already exsits & method = 1 which means 1:Live Streaming
  const course = await db_Course.findOne({
    where: {
      id: parseInt(req.body.courseId),
      method: '1',
    },
  });

  if (!course) {
    //onErrorDeleteFiles(req);
    return Response(res, 400, 'Course Not Found or Not Live Streaming', {});
  }

  //Check startDate of Group - Must be greater than Course Start Date which belongs to.
  if (moment(req.body.startDateGroup) < moment(course.startDate)) {
    return Response(
      res,
      400,
      'Start Date of the Group must be greater than start date of the Course which belongs to!',
      { course }
    );
  }

  try {
    //Start "Managed" Transaction
    const group = await db_connection.transaction(async (t) => {
      //Save Group to DB
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

      console.log(req.body);

      //Save Multi Group Schedule to DB for the group
      const groupSchedule = await db_GroupSchedule.bulkCreate(
        req.body.groupSchedule,
        {
          fields: ['day', 'time', 'groupId'],
          transaction: t,
        }
      );

      return { group, groupSchedule };
    });

    //Success
    return Response(res, 200, 'Success!', { group });
  } catch (error) {
    return Response(res, 500, 'Fail to add', { error });
  }
};

//---------------------------------------------------------------
exports.updateGroup = async (req, res) => {
  try {
    //Check if the Course ID is already exsits & method = 1 which means 1:Live Streaming
    const course = await db_Course.findOne({
      where: {
        id: parseInt(req.body.courseId),
        method: '1',
      },
      include: [
        {
          model: db_Group,
          where: {
            id: parseInt(req.params.id),
          },
          include: [
            {
              model: db_CourseSubscribe,
            },
            {
              model: db_GroupSchedule,
            },
          ],
        },
      ],
    });

    if (!course) {
      //onErrorDeleteFiles(req);
      return Response(
        res,
        400,
        'Course with that group is Not Found or Not Live Streaming',
        {}
      );
    }

    //Check startDate of Group - Must be greater than Course Start Date which belongs to.
    if (moment(req.body.startDateGroup) < moment(course.startDate)) {
      return Response(
        res,
        400,
        'Start Date of the Group must be greater than start date of the Course which belongs to!',
        { course }
      );
    }

    //Check that maxNumOfStudentsGroup not less than the current course register in the group
    if (
      req.body.maxNumOfStudentsGroup < course.groups[0].courseSubscribes.length
    ) {
      return Response(
        res,
        400,
        "The max number of students per group can't be less than the current number of student subsciptions for that group!, Count of registered students = " +
          course.groups[0].courseSubscribes.length,
        { course }
      );
    }

    //ٍStart Transaction
    let group = await db_connection.transaction(async (t) => {
      //Update Group
      const group = await db_Group.update(
        {
          name: req.body.nameGroup ? req.body.nameGroup : course.groups[0].name,
          maxNumOfStudents: req.body.maxNumOfStudentsGroup
            ? req.body.maxNumOfStudentsGroup
            : course.groups[0].maxNumOfStudents,
          startDate: req.body.startDateGroup
            ? req.body.startDateGroup
            : course.groups[0].startDate,
          endDate: req.body.endDateGroup
            ? req.body.endDateGroup
            : course.groups[0].endDate,
        },
        { where: { id: req.params.id } },
        { transaction: t }
      );

      if (course.groups[0].groupSchedules.length > 0) {
        //If the group has group schedules then remove them
        await db_GroupSchedule.destroy({
          where: {
            groupId: req.params.id,
          },
        });

        //Inject Group Id To Group Schedules Objects
        req.body.groupSchedule.forEach((sch) => {
          sch.groupId = req.params.id;
        });

        console.log(req.body);

        //Save Multi Group Schedule to DB for the group
        var groupSchedule = await db_GroupSchedule.bulkCreate(
          req.body.groupSchedule,
          {
            fields: ['day', 'time', 'groupId'],
            transaction: t,
          }
        );
      }
      return { group, groupSchedule };
    });

    console.log(group);

    //Success
    return Response(res, 200, 'Success!', { group });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Delete!', { error });
  }
};

//---------------------------------------------------------------
exports.deleteGroup = async (req, res) => {
  try {
    //Check if the Group is already exsits
    let group = await db_Group.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: db_CourseSubscribe,
          include: [{ model: db_Student }],
        },
        {
          model: db_GroupSchedule,
        },
      ],
    });

    if (!group) {
      return Response(res, 400, 'Group Not Found!', {});
    }
    //course = course.get({ plain: true });

    console.log(group);

    //If Students Subscribe the course then can not delete it
    if (group.courseSubscribes.length > 0) {
      return Response(
        res,
        400,
        "Can't delete the group, The Course Group has subscription!",
        { group }
      );
    }

    // //Delete
    let deletedGroup = await db_Group.destroy({
      where: { id: req.params.id },
    });

    //Success
    return Response(res, 200, 'Success!', { group });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Delete!', { error });
  }
};

//---------------------------------------------------------------
exports.listGroupByCourseId = async (req, res) => {
  //Check if the Course ID is already exsits & method = 1 which means 1:Live Streaming
  const course = await db_Course.findOne({
    where: {
      id: parseInt(req.params.courseId),
    },
  });

  if (!course) {
    return Response(res, 400, 'Course Not Found!', {});
  }

  //
  const doPagination = parseInt(req.query.doPagination);
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Count all rows
  let numRows = await db_Group
    .count({
      where: {
        courseId: req.params.courseId,
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
      //Do Pagination
      data = await listGroupByCourseId_DoPagination(
        req,
        db_Group,
        db_Instructor,
        db_Course,
        db_GroupSchedule,
        db_CourseSubscribe,
        db_Student,
        skip,
        _limit
      );
    } else {
      //NO Pagination
      data = await listGroupByCourseId_NOPagination(
        req,
        db_Group,
        db_Instructor,
        db_Course,
        db_GroupSchedule,
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

function listGroupByCourseId_DoPagination(
  req,
  db_Group,
  db_Instructor,
  db_Course,
  db_GroupSchedule,
  db_CourseSubscribe,
  db_Student,
  skip,
  _limit
) {
  return new Promise(async (resolve, reject) => {
    await db_Group
      .findOne({
        where: {
          courseId: req.params.courseId,
        },
        include: [
          {
            model: db_Instructor,
          },
          {
            model: db_Course,
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
function listGroupByCourseId_NOPagination(
  req,
  db_Group,
  db_Instructor,
  db_Course,
  db_GroupSchedule,
  db_CourseSubscribe,
  db_Student,
  skip,
  _limit
) {
  return new Promise(async (resolve, reject) => {
    await db_Group
      .findOne({
        where: {
          courseId: req.params.courseId,
        },
        include: [
          {
            model: db_Instructor,
          },
          {
            model: db_Course,
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
      })
      .catch((err) => {
        return reject(err);
      })
      .then((data) => {
        return resolve(data);
      });
  });
}

//--------------------------------------------------------------
exports.listGroupById = async (req, res) => {
  try {
    let group = await db_Group.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: db_Instructor,
        },
        {
          model: db_Course,
        },
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
    });

    if (!group) {
      return Response(res, 400, 'Group Not Found!', {});
    }

    //Success
    return Response(res, 200, 'Success!', { group });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Delete!', { error });
  }
};
