const db = require('../..');
const {
  Response,
  ResponseConstants,
} = require('../../../common/response/response.handler');
const {
  onErrorDeleteFiles,
  deleteFile,
} = require('../../../common/attachmentsUpload/multerConfig');
const Helper = require('../../../common/helper');
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
const db_AssignmentSubmission = db.AssignmentSubmission;
const db_user = db.User;

//---------------------------------------------------------------
exports.addAssignmentSubmission = async (req, res) => {
  try {
    //Check if the Course is already exsits
    let lesson = await db_Lesson.findOne({
      where: { id: parseInt(req.body.lessonId) },
    });

    if (!lesson) {
      console.log('!lesson');
      onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_LESSON
      );
    }

    //Create Attachment String
    if (req.files.attachments) {
      let field_1 = [];
      req.files['attachments'].forEach((file) => {
        let fileUrl = file.path.replace(/\\/g, '/');
        field_1.push(fileUrl);
      });
      req.body.attachments = field_1.join();
    }

    //Get Student Id based on user id from token
    // let student = await db_Student.findOne({
    //   where: { userId: parseInt(req.userId) },
    // });

    //Save to DB
    let assignmentSubmission = db_AssignmentSubmission.create({
      submissionDate: moment.utc(req.body.submissionDate),
      attachments: req.body.attachments,
      studentId: parseInt(req.body.studentId),
      lessonId: parseInt(req.body.lessonId),
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
};

//---------------------------------------------------------------
exports.deleteAssignmentSubmission = async (req, res) => {
  try {
    //Check if the assignmentSubmission is already exsits
    let assignmentSubmission = await db_AssignmentSubmission.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!assignmentSubmission) {
      console.log('!assignmentSubmission');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_ASSIGNMENTSUBMISSION
      );
    }

    //Delete
    let deletedAssignmentSubmission = await db_AssignmentSubmission.destroy({
      where: { id: req.params.id },
    });

    //If the record Deleted then delete files in attachments
    if (deletedAssignmentSubmission) {
      let attachmentsStr = assignmentSubmission.getDataValue('attachments');
      if (attachmentsStr.length > 0) {
        let locations = attachmentsStr.split(',');
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

//---------------------------------------------------------------
exports.deleteAttachment = async (req, res) => {
  try {
    //Check if the Lesson is already exsits
    let assignmentSubmission = await db_AssignmentSubmission.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!assignmentSubmission) {
      console.log('!assignmentSubmission');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_ASSIGNMENTSUBMISSION
      );
    }

    console.log(assignmentSubmission);

    //Read current Attachments
    let attachmentsStr = assignmentSubmission.getDataValue('attachments');
    if (attachmentsStr.length > 0) {
      let locations = attachmentsStr.split(',');
      console.log(locations);
      const index = locations.indexOf(req.body.attachmentPath);
      if (index > -1) {
        deleteFile(locations[index]);
        locations.splice(index, 1);
        locations = locations.join();

        //Update DB
        await db_AssignmentSubmission.update(
          {
            attachments: locations,
          },
          {
            where: { id: req.params.id },
          }
        );
      } else {
        //'Attachemt Not Found!'
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
          ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type
            .NO_ATTACHMENTS_FOUND,
          ResponseConstants.ERROR_MESSAGES.NO_ATTACHMENTS_FOUND
        );
      }
    } else {
      //'AssignmentSubmission has zero attachments!'
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.NO_ATTACHMENTS_FOUND,
        ResponseConstants.ERROR_MESSAGES.NO_ATTACHMENTS_FOUND
      );
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
exports.listAssignmentSubmissionById = async (req, res) => {
  try {
    let assignmentSubmission = await db_AssignmentSubmission.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: db_Student,
        },
        {
          model: db_Lesson,
          include: [
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

    if (!assignmentSubmission) {
      console.log('!assignmentSubmission');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_ASSIGNMENTSUBMISSION
      );
    }

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { assignmentSubmission }
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
exports.updateAssignmentSubmission = async (req, res) => {
  try {
    //Get Student Id based on user id from token
    // let student = await db_Student.findOne({
    //   where: { userId: parseInt(req.userId) },
    // });

    //Check if the Lesson is found
    let assignmentSubmission = await db_AssignmentSubmission.findOne({
      where: {
        [Op.and]: [{ id: parseInt(req.params.id) }],
      },
    });

    if (!assignmentSubmission) {
      console.log('!assignmentSubmission');
      onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_ASSIGNMENTSUBMISSION
      );
    }

    //Append Attachment String
    if (req.files.attachments) {
      //Get Current Paths from DB
      let fieldFilesPaths = assignmentSubmission.getDataValue('attachments');
      if (fieldFilesPaths.length > 0) {
        fieldFilesPaths = fieldFilesPaths.split(',');
      } else {
        fieldFilesPaths = [];
      }

      //Append
      let field_1 = [];
      req.files['attachments'].forEach((file) => {
        let fileUrl = file.path.replace(/\\/g, '/');
        field_1.push(fileUrl);
      });

      //
      fieldFilesPaths = fieldFilesPaths.concat(field_1);
      req.body.attachments = fieldFilesPaths.join();
    }

    //Do Update
    let updatedAssignmentSubmission = await db_AssignmentSubmission.update(
      {
        attachments: req.body.attachments
          ? req.body.attachments
          : lesson.getDataValue('attachments'),
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
exports.listAssignmentsSubmission = async (req, res) => {
  //Filters
  let instructorId = req.query.instructorId ? req.query.instructorId : '%%';
  let studentId = req.query.studentId ? req.query.studentId : '%%';
  let lessonId = req.query.lessonId ? req.query.lessonId : '%%';
  let courseId = req.query.courseId ? req.query.courseId : '%%';

  //Filter with date range or without date range for Assignment submission Date
  let submissionStartFrom;
  let submissionStartTo;
  let submissionDateMinMaxDate;
  if (req.query.submissionStartFrom && req.query.submissionStartTo) {
    submissionStartFrom = req.query.submissionStartFrom;
    submissionStartTo = req.query.submissionStartTo;
  } else {
    //Set submissionStartFrom and submissionStartTo to min and max date of the table
    submissionDateMinMaxDate = await Helper.getColumnMinMax(
      Sequelize,
      db_AssignmentSubmission,
      'submissionDate'
    );
    submissionDateMinMaxDate = submissionDateMinMaxDate.get({ plain: true });
    submissionStartFrom = submissionDateMinMaxDate.min;
    submissionStartTo = submissionDateMinMaxDate.max;
  }

  //Order Data Based on created At of course
  let orderBy = '';
  if (req.query.orderBy) {
    orderBy =
      req.query.orderBy.trim() === 'DESC'
        ? 'assignmentsSubmission.submissionDate DESC'
        : 'assignmentsSubmission.submissionDate ASC';
  } else {
    orderBy = 'assignmentsSubmission.submissionDate ASC';
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
      data = await listAssignmentsSubmission_DoPagination(
        req,
        instructorId,
        studentId,
        lessonId,
        courseId,
        submissionStartFrom,
        submissionStartTo,
        orderBy,
        skip,
        _limit
      );
    } else {
      //NO Pagination
      data = await listAssignmentsSubmission_NOPagination(
        req,
        instructorId,
        studentId,
        lessonId,
        courseId,
        submissionStartFrom,
        submissionStartTo,
        orderBy
      );
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

function listAssignmentsSubmission_NOPagination(
  req,
  instructorId,
  studentId,
  lessonId,
  courseId,
  submissionStartFrom,
  submissionStartTo,
  orderBy
) {
  return new Promise(async (resolve, reject) => {
    await db_AssignmentSubmission
      .findAndCountAll({
        where: {
          [Op.and]: [
            { studentId: { [Op.like]: studentId } },
            { lessonId: { [Op.like]: lessonId } },
            {
              submissionDate: {
                [Op.between]: [submissionStartFrom, submissionStartTo],
              },
            },
          ],
        },
        include: [
          {
            model: db_Student,
          },
          {
            model: db_Lesson,
            required: true,
            include: [
              {
                model: db_Course,
                required: true,
                where: {
                  id: { [Op.like]: courseId },
                },
                include: [
                  {
                    model: db_Instructor,
                    required: true,
                    where: {
                      id: { [Op.like]: instructorId },
                    },
                  },
                ],
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

function listAssignmentsSubmission_DoPagination(
  req,
  instructorId,
  studentId,
  lessonId,
  courseId,
  submissionStartFrom,
  submissionStartTo,
  orderBy,
  skip,
  _limit
) {
  return new Promise(async (resolve, reject) => {
    await db_AssignmentSubmission
      .findAndCountAll({
        where: {
          [Op.and]: [
            { studentId: { [Op.like]: studentId } },
            { lessonId: { [Op.like]: lessonId } },
            {
              submissionDate: {
                [Op.between]: [submissionStartFrom, submissionStartTo],
              },
            },
          ],
        },
        include: [
          {
            model: db_Student,
          },
          {
            model: db_Lesson,
            include: [
              {
                model: db_Course,
                where: {
                  id: { [Op.like]: courseId },
                },
                include: [
                  {
                    model: db_Instructor,
                    where: {
                      id: { [Op.like]: instructorId },
                    },
                  },
                ],
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
