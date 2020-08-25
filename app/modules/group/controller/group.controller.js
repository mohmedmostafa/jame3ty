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
    if (group.coursesSubscribes.length > 0) {
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
