const db = require('../..');
const {
  Response,
  ResponseConstants,
} = require('../../../common/response/response.handler');

const {
  onErrorDeleteFiles,
  deleteFile,
} = require('../../../common/attachmentsUpload/multerConfig');
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
exports.addLesson = async (req, res) => {
  try {
    //Check if the Course is already exsits
    let course = await db_Course.findOne({
      where: { id: parseInt(req.body.courseId) },
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

    //Check if the Group is under that course
    if (
      req.body.isAssostatedWithGroup &&
      req.body.isAssostatedWithGroup === '1'
    ) {
      course = await db_Course.findOne({
        where: { id: parseInt(req.body.courseId) },
        include: [
          {
            model: db_Group,
            where: {
              id: parseInt(req.body.groupId),
            },
          },
        ],
      });

      if (!course) {
        console.log('!course');
        onErrorDeleteFiles(req);
        //'Course with that group Not Found!'
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
          ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
          ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
        );
      }
    }

    console.log(req.files);

    //Create Attachment String
    if (req.files.attachments) {
      let field_1 = [];
      req.files['attachments'].forEach((file) => {
        let fileUrl = file.path.replace(/\\/g, '/');
        field_1.push(fileUrl);
      });
      req.body.attachments = field_1.join();
    }

    //Validation
    if (req.body.isAssostatedWithGroup === '0') {
      req.body.groupId = null;
    }

    if (req.body.isLiveStreaming === '0') {
      req.body.liveStreamingInfo = null;
    }

    //Save to DB
    let lesson = db_Lesson.create({
      name_ar: req.body.name_ar,
      name_en: req.body.name_en,
      desc: req.body.desc,
      type: req.body.type,
      isLiveStreaming: req.body.isLiveStreaming,
      liveStreamingInfo: req.body.liveStreamingInfo,
      isAssostatedWithGroup: req.body.isAssostatedWithGroup,
      groupId: req.body.groupId,
      courseId: req.body.courseId,
      youtubeLink: req.body.youtubeLink,
      attachments: req.body.attachments,
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
exports.deleteLesson = async (req, res) => {
  try {
    //Check if the Lesson is already exsits
    let lesson = await db_Lesson.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!lesson) {
      console.log('!lesson');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
      );
    }

    console.log(lesson);

    //Delete
    let deletedLesson = await db_Lesson.destroy({
      where: { id: req.params.id },
    });

    //If the record Deleted then delete files in attachments
    if (deletedLesson) {
      let attachmentsStr = lesson.getDataValue('attachments');
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
    let lesson = await db_Lesson.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!lesson) {
      console.log('!lesson');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
      );
    }

    console.log(lesson);

    //Read current Attachments
    let attachmentsStr = lesson.getDataValue('attachments');
    if (attachmentsStr.length > 0) {
      let locations = attachmentsStr.split(',');
      console.log(locations);

      const index = locations.indexOf(req.body.attachmentPath);
      if (index > -1) {
        deleteFile(locations[index]);
        locations.splice(index, 1);
        locations = locations.join();

        //Update DB
        await db_Lesson.update(
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
      //'Lesson has zero attachments!'
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
        .ATTACHMENT_DELETION_FAILED,
      ResponseConstants.ERROR_MESSAGES.ATTACHMENT_DELETION_FAILED
    );
  }
};

//--------------------------------------------------------------
exports.listLessonById = async (req, res) => {
  try {
    let lesson = await db_Lesson.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: db_Course,
        },
        {
          model: db_Group,
        },
      ],
    });

    if (!lesson) {
      console.log('!lesson');
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
      { lesson }
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
exports.updateLesson = async (req, res) => {
  try {
    //Check if the Lesson is found
    let lesson = await db_Lesson.findOne({
      where: { id: parseInt(req.params.id) },
    });

    if (!lesson) {
      console.log('!lesson');
      onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
      );
    }

    //Check if the Course is already exsits
    let course = await db_Course.findOne({
      where: { id: parseInt(req.body.courseId) },
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

    //Check if the Group is under that course
    if (
      req.body.isAssostatedWithGroup &&
      req.body.isAssostatedWithGroup === '1'
    ) {
      course = await db_Course.findOne({
        where: { id: parseInt(req.body.courseId) },
        include: [
          {
            model: db_Group,
            where: {
              id: parseInt(req.body.groupId),
            },
          },
        ],
      });

      if (!course) {
        console.log('!course');
        onErrorDeleteFiles(req);
        //'Course with that group Not Found!'
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
          ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
          ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
        );
      }
    }

    //Append Attachment String
    if (req.files.attachments) {
      //Get Current Paths from DB
      let fieldFilesPaths = lesson.getDataValue('attachments');
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

    //Validation
    if (req.body.isAssostatedWithGroup === '0') {
      req.body.groupId = null;
    }

    if (req.body.isLiveStreaming === '0') {
      req.body.liveStreamingInfo = null;
    }

    console.log(req.body);

    //Do Update
    let updatedLesson = await db_Lesson.update(
      {
        name_ar: req.body.name_ar ? req.body.name_ar : lesson.name_ar,
        name_en: req.body.name_en ? req.body.name_en : lesson.name_en,
        desc: req.body.desc ? req.body.desc : lesson.desc,
        type: req.body.type ? req.body.type : lesson.type,
        isLiveStreaming: req.body.isLiveStreaming
          ? req.body.isLiveStreaming
          : lesson.isLiveStreaming,
        liveStreamingInfo: req.body.liveStreamingInfo
          ? req.body.liveStreamingInfo
          : lesson.liveStreamingInfo,
        isAssostatedWithGroup: req.body.isAssostatedWithGroup
          ? req.body.isAssostatedWithGroup
          : lesson.isAssostatedWithGroup,
        groupId: req.body.groupId ? req.body.groupId : lesson.groupId,
        courseId: req.body.courseId ? req.body.courseId : lesson.courseId,
        youtubeLink: req.body.youtubeLink
          ? req.body.youtubeLink
          : lesson.youtubeLink,
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
exports.listLesson = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);

  //Query
  try {
    let data;
    if (doPagination) {
      if (req.query.method != 'both') {
        //Do Pagination & Type 1 or 0
        data = await listLesson_DoPagination_Type_1_or_0(
          req,
          db_Lesson,
          db_Course,
          db_Group
        );
      } else {
        //Do Pagination & Type Both
        data = await listLesson_DoPagination_Type_Both(
          req,
          db_Lesson,
          db_Course,
          db_Group
        );
      }
    } else {
      if (req.query.method != 'both') {
        //NO Pagination & Type 1 or 0
        data = await listLesson_NOPagination_Type_1_or_0(
          req,
          db_Lesson,
          db_Course,
          db_Group
        );
      } else {
        //NO Pagination & Type Both
        data = await listLesson_NOPagination_Type_Both(
          req,
          db_Lesson,
          db_Course,
          db_Group
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
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
        .ORM_OPERATION_FAILED,
      ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
    );
  }
};

function listLesson_DoPagination_Type_Both(
  req,
  db_Lesson,
  db_Course,
  db_Group
) {
  return new Promise(async (resolve, reject) => {
    const doPagination = parseInt(req.query.doPagination);
    const numPerPage = parseInt(req.query.numPerPage);
    const page = parseInt(req.query.page);

    //Count all rows
    let numRows = await db_Lesson
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
              type: {
                [Op.in]: ['0', '1'],
              },
            },
          ],
        },
      })
      .catch((error) => {
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
    let data = await db_Lesson
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
              type: {
                [Op.in]: ['0', '1'],
              },
            },
          ],
        },
        include: [
          {
            model: db_Course,
          },
          {
            model: db_Group,
          },
        ],
        offset: skip,
        limit: _limit,
      })
      .catch((err) => {
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

function listLesson_DoPagination_Type_1_or_0(
  req,
  db_Lesson,
  db_Course,
  db_Group
) {
  return new Promise(async (resolve, reject) => {
    const doPagination = parseInt(req.query.doPagination);
    const numPerPage = parseInt(req.query.numPerPage);
    const page = parseInt(req.query.page);

    //Count all rows
    let numRows = await db_Lesson
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
              type: req.query.type,
            },
          ],
        },
      })
      .catch((error) => {
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
    let data = await db_Lesson
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
              type: req.query.type,
            },
          ],
        },
        include: [
          {
            model: db_Course,
          },
          {
            model: db_Group,
          },
        ],
        offset: skip,
        limit: _limit,
      })
      .catch((err) => {
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

function listLesson_NOPagination_Type_Both(
  req,
  db_Lesson,
  db_Course,
  db_Group
) {
  return new Promise(async (resolve, reject) => {
    const doPagination = parseInt(req.query.doPagination);
    const numPerPage = parseInt(req.query.numPerPage);
    const page = parseInt(req.query.page);

    //Count all rows
    let numRows = await db_Lesson
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
          ],
        },
      })
      .catch((error) => {
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
    let data = await db_Lesson
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
          ],
        },
        include: [
          {
            model: db_Course,
          },
          {
            model: db_Group,
          },
        ],
      })
      .catch((err) => {
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

function listLesson_NOPagination_Type_1_or_0(
  req,
  db_Lesson,
  db_Course,
  db_Group
) {
  return new Promise(async (resolve, reject) => {
    const doPagination = parseInt(req.query.doPagination);
    const numPerPage = parseInt(req.query.numPerPage);
    const page = parseInt(req.query.page);

    //Count all rows
    let numRows = await db_Lesson
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
              type: req.query.type,
            },
          ],
        },
      })
      .catch((error) => {
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
    let data = await db_Lesson
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
              type: req.query.type,
            },
          ],
        },
        include: [
          {
            model: db_Course,
          },
          {
            model: db_Group,
          },
        ],
      })
      .catch((err) => {
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
