const db = require('../..');
const {
  Response,
  ValidateResponse,
  ResponseConstants,
} = require('../../../common/response/response.handler');
const VimeoHelper = require('../../../common/vimeo/vimeoHelper');

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
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_COURSE
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
          ResponseConstants.ERROR_MESSAGES
            .RESOURCE_NOT_FOUND_COURSE_WITH_GROUP_NOT_FOUND
        );
      }
    }

    //Check if liveStreamingEndTime is after liveStreamingTime or not
    if (req.body.isLiveStreaming === '1') {
      if (
        moment
          .utc(req.body.liveStreamingTime)
          .isAfter(moment.utc(req.body.liveStreamingEndTime))
      ) {
        onErrorDeleteFiles(req);
        return ValidateResponse(
          res,
          ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
            .UNACCEPTABLE_DATE,
          ResponseConstants.ERROR_MESSAGES
            .UNACCEPTABLE_DATE_LESSON_LIVESTREAMINGENDTIME
        );
      }
    }

    console.log(req.files);

    //Validation
    if (req.body.isAssostatedWithGroup === '0') {
      req.body.groupId = null;
    }

    if (req.body.isLiveStreaming === '0') {
      req.body.liveStreamingInfo = '';
      req.body.liveStreamingTime = '0000-00-00 00:00:00';
      req.body.liveStreamingEndTime = '0000-00-00 00:00:00';
    }

    if (req.body.type === '1') {
      req.body.assignmentDeadLineDate = '0000-00-00 00:00:00';
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

    let cont = 1;
    if (req.files.vedio) {
      //Upload Video to Vimeo
      await VimeoHelper.uploadVideoTOVimeo(req, res).catch((error) => {
        cont = 0;
        onErrorDeleteFiles(req);
        VimeoHelper.vimeoErrorResHandler(req, res, error);
      });
    }

    if (cont) {
      //Save to DB
      let lesson = await db_Lesson.create({
        name_ar: req.body.name_ar,
        name_en: req.body.name_en,
        desc: req.body.desc,
        type: req.body.type,
        assignmentDeadLineDate: moment.utc(req.body.assignmentDeadLineDate),
        isLiveStreaming: req.body.isLiveStreaming,
        liveStreamingInfo: req.body.liveStreamingInfo,
        liveStreamingTime: moment.utc(req.body.liveStreamingTime),
        liveStreamingEndTime: moment.utc(req.body.liveStreamingEndTime),
        isAssostatedWithGroup: req.body.isAssostatedWithGroup,
        groupId: req.body.groupId,
        courseId: req.body.courseId,
        vedio: req.body.uri ? req.body.uri : '',
        attachments: req.body.attachments ? req.body.attachments : '',
      });

      //Success
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.CREATED.code,
        ResponseConstants.HTTP_STATUS_CODES.CREATED.type.RECOURSE_CREATED,
        ResponseConstants.ERROR_MESSAGES.RECOURSE_CREATED
      );
    }
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
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_LESSON
      );
    }

    console.log(lesson);

    //Delete
    let deletedLesson = await db_Lesson.destroy({
      where: { id: req.params.id },
    });

    //If the record Deleted then delete files in attachments
    if (deletedLesson) {
      //remove attachments
      let attachmentsStr = lesson.getDataValue('attachments');
      if (attachmentsStr.length > 0) {
        let locations = attachmentsStr.split(',');
        console.log(locations);
        locations.forEach((loc) => {
          deleteFile(loc);
        });
      }

      //remove video from vimeo
      let vedioStr = lesson.getDataValue('vedio');
      if (vedioStr.length > 0) {
        let locations = vedioStr.split(',');
        console.log(locations);
        await VimeoHelper.removeVideoTOVimeo(locations);
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
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_LESSON
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
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_LESSON
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
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_LESSON
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
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_COURSE
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
          ResponseConstants.ERROR_MESSAGES
            .RESOURCE_NOT_FOUND_COURSE_WITH_GROUP_NOT_FOUND
        );
      }
    }

    //Check if liveStreamingEndTime is after liveStreamingTime or not
    if (req.body.isLiveStreaming === '1') {
      if (
        moment
          .utc(req.body.liveStreamingTime)
          .isAfter(moment.utc(req.body.liveStreamingEndTime))
      ) {
        onErrorDeleteFiles(req);
        return ValidateResponse(
          res,
          ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
            .UNACCEPTABLE_DATE,
          ResponseConstants.ERROR_MESSAGES
            .UNACCEPTABLE_DATE_LESSON_LIVESTREAMINGENDTIME
        );
      }
    }

    //Validation
    if (req.body.isAssostatedWithGroup === '0') {
      req.body.groupId = null;
    }

    if (req.body.isLiveStreaming === '0') {
      req.body.liveStreamingInfo = '';
      req.body.liveStreamingTime = '0000-00-00 00:00:00';
      req.body.liveStreamingEndTime = '0000-00-00 00:00:00';
    }

    if (req.body.type === '1') {
      req.body.assignmentDeadLineDate = '0000-00-00 00:00:00';
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

    let cont = 1;
    if (req.files.vedio) {
      let vedioStr = lesson.getDataValue('vedio');
      //If already has video
      if (vedioStr.length > 0) {
        let locations = vedioStr.split(',');
        console.log(locations);
        //Replace Vimeo Video
        await VimeoHelper.replaceVideoTOVimeo(req, res, locations).catch(
          (error) => {
            cont = 0;
            onErrorDeleteFiles(req);
            VimeoHelper.vimeoErrorResHandler(req, res, error);
          }
        );
      } else {
        //Upload Video to Vimeo
        await VimeoHelper.uploadVideoTOVimeo(req, res).catch((error) => {
          cont = 0;
          onErrorDeleteFiles(req);
          VimeoHelper.vimeoErrorResHandler(req, res, error);
        });
      }
    }

    if (cont) {
      //Do Update
      let updatedLesson = await db_Lesson.update(
        {
          name_ar: req.body.name_ar ? req.body.name_ar : lesson.name_ar,
          name_en: req.body.name_en ? req.body.name_en : lesson.name_en,
          desc: req.body.desc ? req.body.desc : lesson.desc,
          type: req.body.type ? req.body.type : lesson.type,
          assignmentDeadLineDate: req.body.assignmentDeadLineDate
            ? moment.utc(req.body.assignmentDeadLineDate)
            : moment.utc(lesson.assignmentDeadLineDate),
          isLiveStreaming: req.body.isLiveStreaming
            ? req.body.isLiveStreaming
            : lesson.isLiveStreaming,
          liveStreamingInfo: req.body.liveStreamingInfo
            ? req.body.liveStreamingInfo
            : lesson.liveStreamingInfo,
          liveStreamingTime: req.body.liveStreamingTime
            ? moment.utc(req.body.liveStreamingTime)
            : moment.utc(lesson.liveStreamingTime),
          liveStreamingEndTime: req.body.liveStreamingEndTime
            ? moment.utc(req.body.liveStreamingEndTime)
            : moment.utc(lesson.liveStreamingEndTime),
          isAssostatedWithGroup: req.body.isAssostatedWithGroup
            ? req.body.isAssostatedWithGroup
            : lesson.isAssostatedWithGroup,
          groupId: req.body.groupId ? req.body.groupId : lesson.groupId,
          courseId: req.body.courseId ? req.body.courseId : lesson.courseId,
          vedio: req.body.uri ? req.body.uri : lesson.getDataValue('vedio'),
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
    }
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
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Calc skip or offset to be used in limit
  let skip = (page - 1) * numPerPage;
  let _limit = numPerPage;

  //Query
  try {
    let data;
    if (doPagination) {
      if (req.query.type != 'both') {
        //Do Pagination & Type 1 or 0
        data = await listLesson_DoPagination_Type_1_or_0(req, skip, _limit);
      } else {
        //Do Pagination & Type Both
        data = await listLesson_DoPagination_Type_Both(req, skip, _limit);
      }
    } else {
      if (req.query.type != 'both') {
        //NO Pagination & Type 1 or 0
        data = await listLesson_NOPagination_Type_1_or_0(req);
      } else {
        //NO Pagination & Type Both
        data = await listLesson_NOPagination_Type_Both(req);
      }
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

function listLesson_DoPagination_Type_Both(req, skip, _limit) {
  return new Promise(async (resolve, reject) => {
    await db_Lesson
      .findAndCountAll({
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
        distinct: true,
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

function listLesson_DoPagination_Type_1_or_0(req, skip, _limit) {
  return new Promise(async (resolve, reject) => {
    await db_Lesson
      .findAndCountAll({
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
        distinct: true,
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

function listLesson_NOPagination_Type_Both(req) {
  return new Promise(async (resolve, reject) => {
    await db_Lesson
      .findAndCountAll({
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
        distinct: true,
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

function listLesson_NOPagination_Type_1_or_0(req) {
  return new Promise(async (resolve, reject) => {
    await db_Lesson
      .findAndCountAll({
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
        distinct: true,
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
