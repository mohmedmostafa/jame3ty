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
const db_AssignmentSubmission = db.AssignmentSubmission;

//---------------------------------------------------------------
exports.addAssignmentSubmission = async (req, res) => {
  try {
    //Check if the Course is already exsits
    let lesson = await db_Lesson.findOne({
      where: { id: parseInt(req.body.lessonId) },
    });

    if (!lesson) {
      onErrorDeleteFiles(req);
      return Response(res, 400, 'Lesson Not Found!', {});
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
    let student = await db_Student.findOne({
      where: { userId: parseInt(req.userId) },
    });

    //Save to DB
    let assignmentSubmission = db_AssignmentSubmission.create({
      submissionDate: req.body.submissionDate,
      attachments: req.body.attachments,
      studentId: student.id,
      lessonId: parseInt(req.body.lessonId),
    });

    //Success
    return Response(res, 200, 'Success!', { assignmentSubmission });
  } catch (error) {
    console.log(error);
    onErrorDeleteFiles(req);
    return Response(res, 500, 'Fail to Add!', { error });
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
      return Response(res, 400, 'AssignmentSubmission Not Found!', {});
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
    return Response(res, 200, 'Success!', { deletedAssignmentSubmission });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Delete!', { error });
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
      return Response(res, 400, 'AssignmentSubmission Not Found!', {});
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
        return Response(res, 400, 'Attachemt Not Found!', {
          assignmentSubmission,
        });
      }
    } else {
      return Response(res, 400, 'AssignmentSubmission has zero attachments!', {
        assignmentSubmission,
      });
    }

    //Success
    return Response(res, 200, 'Success!', { assignmentSubmission });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Delete Attachment!', { error });
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
        },
      ],
    });

    if (!assignmentSubmission) {
      return Response(res, 400, 'AssignmentSubmission Not Found!', {});
    }

    //Success
    return Response(res, 200, 'Success!', { assignmentSubmission });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Find!', { error });
  }
};

//---------------------------------------------------------------
exports.updateAssignmentSubmission = async (req, res) => {
  try {
    //Get Student Id based on user id from token
    let student = await db_Student.findOne({
      where: { userId: parseInt(req.userId) },
    });

    //Check if the Lesson is found
    let assignmentSubmission = await db_AssignmentSubmission.findOne({
      where: {
        [Op.and]: [{ id: parseInt(req.params.id) }, { studentId: student.id }],
      },
    });

    if (!assignmentSubmission) {
      onErrorDeleteFiles(req);
      return Response(res, 400, 'Student Assignment Submission Not Found!', {});
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
    return Response(res, 200, 'Success!', { updatedAssignmentSubmission });
  } catch (error) {
    console.log(error);
    onErrorDeleteFiles(req);
    return Response(res, 500, 'Fail to Udpate!', { error });
  }
};

//---------------------------------------------------------------
/*
exports.listAssignmentSubmission = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Count all rows
  let numRows = await db_AssignmentSubmission
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
*/
