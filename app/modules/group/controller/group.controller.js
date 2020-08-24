const db = require('../..');
const { Response } = require('../../../common/response.handler');
const { onErrorDeleteFiles } = require('../../../common/multerConfig');
const moment = require('moment');

const Op = db.Sequelize.Op;
const db_Course = db.Course;
const db_Group = db.Group;
const db_GroupSchedule = db.GroupSchedule;
const db_connection = db.connection;

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

