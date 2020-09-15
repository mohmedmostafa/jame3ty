const db = require('../..');
const {
  Response,
  ValidateResponse,
  ResponseConstants,
} = require('../../../common/response/response.handler');

const {
  onErrorDeleteFiles,
} = require('../../../common/attachmentsUpload/multerConfig');
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
    console.log('!course');
    //onErrorDeleteFiles(req);
    //'Course Not Found or Not Live Streaming'
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
      ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
    );
  }

  //Check startDate of Group - Must be greater than Course Start Date which belongs to.
  if (moment.utc(req.body.startDateGroup) < moment.utc(course.startDate)) {
    return ValidateResponse(
      res,
      ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
        .UNACCEPTABLE_DATE,
      ResponseConstants.ERROR_MESSAGES.UNACCEPTABLE_DATE_GROUP_STARTDATE
    );
  }

  //Get instructor for the uer in the token
  const instructor = await db_Instructor.findOne({
    where: {
      id: req.body.instructorId,
    },
  });

  if (!instructor) {
    console.log('!instructor');
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
      ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
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
          startDate: moment.utc(req.body.startDateGroup),
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
      console.log('!course');
      //onErrorDeleteFiles(req);
      //'Course with that group is Not Found or Not Live Streaming'
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
      );
    }

    //Check startDate of Group - Must be greater than Course Start Date which belongs to.
    if (moment.utc(req.body.startDateGroup) < moment.utc(course.startDate)) {
      return ValidateResponse(
        res,
        ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
          .UNACCEPTABLE_DATE,
        ResponseConstants.ERROR_MESSAGES.UNACCEPTABLE_DATE_GROUP_STARTDATE
      );
    }

    //Check that maxNumOfStudentsGroup not less than the current course register in the group
    if (
      req.body.maxNumOfStudentsGroup < course.groups[0].courseSubscribes.length
    ) {
      return ValidateResponse(
        res,
        ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
          .UNACCEPTABLE_NUMBER,
        ResponseConstants.ERROR_MESSAGES
          .UNACCEPTABLE_MAX_STUDENT_NUMBER_IN_GROUP
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
            ? moment.utc(req.body.startDateGroup)
            : moment.utc(course.groups[0].startDate),
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
      console.log('!group');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
      );
    }
    //course = course.get({ plain: true });

    console.log(group);

    //If Students Subscribe the course then can not delete it
    if (group.courseSubscribes.length > 0) {
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.code,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.type
          .RESOURCE_HAS_DEPENDENTS,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_HAS_DEPENDENTS
      );
    }

    // //Delete
    let deletedGroup = await db_Group.destroy({
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

//---------------------------------------------------------------
exports.listGroupByCourseId = async (req, res) => {
  //Check if the Course ID is already exsits & method = 1 which means 1:Live Streaming
  const course = await db_Course.findOne({
    where: {
      id: parseInt(req.params.courseId),
    },
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
      .findِAll({
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
        console.log(err);
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
      .findِAll({
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
        console.log(err);
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
      console.log('!group');
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
      { group }
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
