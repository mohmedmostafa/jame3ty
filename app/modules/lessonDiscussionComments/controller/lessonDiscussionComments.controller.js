const db = require('../../../modules');
const { Sequelize, connection } = require('../..');

const {
  Response,
  ResponseConstants,
} = require('../../../common/response/response.handler');
const Helper = require('../../../common/helper');

const { ref, date } = require('joi');
const { User } = require('../../../modules');

const Op = db.Sequelize.Op;
const QueryTypes = db.Sequelize.QueryTypes;
const db_connection = db.connection;
const db_lessonDiscussionComments = db.lessonDiscussionComment;
const db_lessonDiscussion = db.LessonDiscussion;
const db_lesson = db.Lesson;
const db_Course = db.Course;
const db_User = db.User;
const db_Role = db.Role;
const db_UserRole = db.UserRole;
const db_Student = db.Student;
const db_Instructor = db.Instructor;

//---------------------------------------------------------------
exports.addlessonDiscussionComments = async (req, res) => {
  const user = await db_User.findByPk(req.body.userId);

  console.log('test', user);
  if (!user) {
    console.log('!user');
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
      ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_USER
    );
  }

  //add post
  if (req.body.lessonId) {
    const lesson = await db_lesson.findByPk(req.body.lessonId);

    if (!lesson) {
      console.log('!lesson');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_LESSON
      );
    }

    const post = await addPost(req, user, lesson).catch((err) => {
      console.log(err);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
          .ORM_OPERATION_FAILED,
        ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
      );
    });

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { post }
    );
  } else {
    //add comment
    const lessonDiscussion = await db_lessonDiscussion.findByPk(
      req.body.lessonDiscussionId
    );

    if (!lessonDiscussion) {
      console.log('!lessonDiscussion');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_LESSON_DISCUSSION
      );
    }

    const comment = await addComment(req, user, lessonDiscussion).catch(
      (err) => {
        console.log(err);
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
          ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
            .ORM_OPERATION_FAILED,
          ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
        );
      }
    );

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { comment }
    );
  }
};

function addPost(req, user, lesson) {
  const response = new Promise(async (res, rej) => {
    try {
      const post = await db_connection.transaction(async (t) => {
        //Save TO DB
        const uni = await db_lessonDiscussion.create(
          {
            text: req.body.text,
          },
          { transaction: t }
        );

        await uni.setUser(user, { transaction: t });
        await uni.setLesson(lesson, { transaction: t });

        return uni;
      });
      //Success
      return res({ post });
    } catch (error) {
      console.log(error);
      return rej({ error });
    }
  });
  console.log(response);
  return response;
}

function addComment(req, user, lessonDiscussion) {
  const response = new Promise(async (res, rej) => {
    try {
      const comment = await db_connection.transaction(async (t) => {
        //Save TO DB
        const comment = await db_lessonDiscussionComments.create(
          {
            text: req.body.text,
          },
          { transaction: t }
        );

        await comment.setUser(user, { transaction: t });
        await comment.setLessonDiscussion(lessonDiscussion, { transaction: t });

        return comment;
      });
      //Success
      return res({ comment });
    } catch (error) {
      console.log(error);
      return rej({ error });
    }
  });
  console.log('test', response);
  return response;
}

//--------------------------update-------------------------------------
exports.updatelessonDiscussionComments = async (req, res) => {
  try {
    //Check if the lessonDiscussionComments is already exsits
    let lessonDiscussionComments = await db_lessonDiscussionComments.findByPk(
      req.params.id
    );

    if (!lessonDiscussionComments) {
      console.log('!lessonDiscussion');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_LESSON_DISCUSSION
      );
    }

    //get user model
    const user = await db_User.findByPk(req.body.userId);

    if (!user) {
      console.log('!user');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_USER
      );
    }

    //get lesson model
    const lessonDiscussion = await db_lessonDiscussion.findByPk(
      req.body.lessonDiscussionId
    );

    if (!lessonDiscussion) {
      console.log('!lessonDiscussion');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_LESSON_DISCUSSION
      );
    }

    const comment = await db_connection.transaction(async (t) => {
      //Do Update
      _lessonDiscussionComments = await db_lessonDiscussionComments.update(
        {
          text: req.body.text ? req.body.text : lessonDiscussionComments.text,
        },
        { where: { id: req.params.id } },
        { transaction: t }
      );

      await lessonDiscussionComments.setUser(user, { transaction: t });
      await lessonDiscussionComments.setLessonDiscussion(lessonDiscussion, {
        transaction: t,
      });
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

exports.updatelessonDiscussion = async (req, res) => {
  try {
    //Check if the lessonDiscussionComments is already exsits
    let lessonDiscussion = await db_lessonDiscussion.findByPk(req.params.id);

    if (!lessonDiscussion) {
      console.log('!lessonDiscussion');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_LESSON_DISCUSSION
      );
    }

    //get user model
    const user = await db_User.findByPk(req.body.userId);
    console.log('test', user);
    if (!user) {
      console.log('!user');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_USER
      );
    }

    //get lesson model
    const lesson = await db_lesson.findByPk(req.body.lessonId);

    if (!lesson) {
      console.log('!lesson');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_LESSON
      );
    }

    const post = await db_connection.transaction(async (t) => {
      //Do Update
      _lessonDiscussion = await db_lessonDiscussion.update(
        {
          text: req.body.text ? req.body.text : lessonDiscussion.text,
        },
        { where: { id: req.params.id } },
        { transaction: t }
      );

      await lessonDiscussion.setUser(user, { transaction: t });
      await lessonDiscussion.setLesson(lesson, { transaction: t });
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
exports.deletelessonDiscussionComments = async (req, res) => {
  try {
    //Check if the faculty is already exsits
    let lessonDiscussionComments = await db_lessonDiscussionComments.findOne({
      where: { id: req.params.id },
    });

    if (!lessonDiscussionComments) {
      console.log('!lessonDiscussionComments');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES
          .RESOURCE_NOT_FOUND_LESSON_DISCUSSION_COMMENT
      );
    }

    //Delete
    lessonDiscussionComments = await db_lessonDiscussionComments.destroy({
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

exports.deletelessonDiscussion = async (req, res) => {
  try {
    //Check if the faculty is already exsits
    let lessonDiscussion = await db_lessonDiscussion.findOne({
      where: { id: req.params.id },
      // include:{model:db_lessonDiscussionComments}
    });

    if (!lessonDiscussion) {
      console.log('!lessonDiscussion');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_LESSON_DISCUSSION
      );
    }

    const comment = await db_connection.transaction(async (t) => {
      _lessonDiscussionComments = await db_lessonDiscussionComments.destroy(
        {
          where: { lessonDiscussionId: req.params.id },
        },
        { transaction: t }
      );

      _lessonDiscussion = await lessonDiscussion.destroy(
        {
          where: { id: req.params.id },
        },
        { transaction: t }
      );
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
exports.listlessonDiscussionComments = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Calc skip or offset to be used in limit
  let skip = (page - 1) * numPerPage;
  let _limit = numPerPage;

  //Query
  let lessonId = req.query.lessonId ? parseInt(req.query.lessonId) : '';

  try {
    let data = await db_lessonDiscussion.findAndCountAll({
      where: {
        lessonId: { [Op.eq]: lessonId },
      },
      include: {
        model: db_lessonDiscussionComments,
      },
      distinct: true,
      offset: skip,
      order: db.Sequelize.literal('updatedAt DESC'),
      limit: _limit,
    });

    let data_all = await db_lessonDiscussion.findAndCountAll({
      where: {
        lessonId: { [Op.eq]: lessonId },
      },
      include: [
        {
          model: db_User,
          attributes: [
            'id',
            'username',
            'email',
            'isVerified',
            'createdAt',
            'updatedAt',
          ],
          include: [
            {
              model: db_Student,
            },
            {
              model: db_Instructor,
            },
          ],
        },
        {
          model: db_lessonDiscussionComments,
          include: [
            {
              model: db_User,
              attributes: [
                'id',
                'username',
                'email',
                'isVerified',
                'createdAt',
                'updatedAt',
              ],
              include: [
                {
                  model: db_Student,
                },
                {
                  model: db_Instructor,
                },
              ],
            },
          ],
        },
      ],
      distinct: true,
      order: db.Sequelize.literal('updatedAt DESC'),
    });

    data = doPagination ? data : data_all;

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

//---------------------------------listlessonDiscussionById------------------------------
exports.listlessonDiscussionById = async (req, res) => {
  try {
    let lessonDiscussion = await db_lessonDiscussion.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: db_User,
          attributes: [
            'id',
            'username',
            'email',
            'isVerified',
            'createdAt',
            'updatedAt',
          ],
          include: [
            {
              model: db_Student,
            },
            {
              model: db_Instructor,
            },
          ],
        },
        {
          model: db_lessonDiscussionComments,
          include: [
            {
              model: db_User,
              attributes: [
                'id',
                'username',
                'email',
                'isVerified',
                'createdAt',
                'updatedAt',
              ],
              include: [
                {
                  model: db_Student,
                },
                {
                  model: db_Instructor,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!lessonDiscussion) {
      console.log('!lessonDiscussion');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_LESSON_DISCUSSION
      );
    }

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { lessonDiscussion }
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

exports.listlessonDiscussionCommentsById = async (req, res) => {
  try {
    let lessonDiscussionComments = await db_lessonDiscussionComments.findOne({
      where: { id: req.params.id },
    });

    if (!lessonDiscussionComments) {
      console.log('!lessonDiscussionComments');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES
          .RESOURCE_NOT_FOUND_LESSON_DISCUSSION_COMMENT
      );
    }

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { lessonDiscussionComments }
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
exports.listlessonDiscussionByCourseId = async (req, res) => {
  //Check if the Dept is already exsits
  let course = await db_Course.findOne({
    where: {
      id: req.params.courseId,
    },
  });

  if (!course) {
    console.log('!course');
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
      ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_COURSE
    );
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
      data = await listlessonDiscussionByCourseId_DoPagination(
        req,
        skip,
        _limit
      );
    } else {
      data = await listlessonDiscussionByCourseId_NOPagination(req);
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

function listlessonDiscussionByCourseId_DoPagination(req, skip, _limit) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          id: req.params.courseId,
        },
        include: [
          {
            model: db_lesson,
            required: true,
            include: [
              {
                model: db_lessonDiscussion,
                required: true,
                text: {
                  [Op.substring]: req.query.searchKey,
                },
                include: [
                  {
                    model: db_User,
                    attributes: [
                      'id',
                      'username',
                      'email',
                      'isVerified',
                      'createdAt',
                      'updatedAt',
                    ],
                  },
                  {
                    model: db_lessonDiscussionComments,
                    include: [
                      {
                        model: db_User,
                        attributes: [
                          'id',
                          'username',
                          'email',
                          'isVerified',
                          'createdAt',
                          'updatedAt',
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        distinct: true,
        order: [['createdAt', 'DESC']],
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

function listlessonDiscussionByCourseId_NOPagination(req) {
  return new Promise(async (resolve, reject) => {
    await db_Course
      .findAndCountAll({
        where: {
          id: req.params.courseId,
        },
        include: [
          {
            model: db_lesson,
            required: true,
            include: [
              {
                model: db_lessonDiscussion,
                required: true,
                text: {
                  [Op.substring]: req.query.searchKey,
                },
                include: [
                  {
                    model: db_User,
                    attributes: [
                      'id',
                      'username',
                      'email',
                      'isVerified',
                      'createdAt',
                      'updatedAt',
                    ],
                  },
                  {
                    model: db_lessonDiscussionComments,
                    include: [
                      {
                        model: db_User,
                        attributes: [
                          'id',
                          'username',
                          'email',
                          'isVerified',
                          'createdAt',
                          'updatedAt',
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        distinct: true,
        order: [['createdAt', 'DESC']],
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

//-------------------------------------------------
//-------------------------------------------------
//-------------------------------------------------
//-------------------------------------------------

//---------------------------------------------------------------
exports.listLessonDiscussion = async (req, res) => {
  //Filters
  let userId = req.query.userId ? req.query.userId : '%%';
  let lessonId = req.query.lessonId ? req.query.lessonId : '%%';
  let courseId = req.query.courseId ? req.query.courseId : '%%';

  //Filter with date range or without date range for Lesson Discussion Created At
  let createdAtFrom;
  let createdAtTo;
  let createdAtMinMaxDate;
  if (req.query.createdAtFrom && req.query.createdAtTo) {
    createdAtFrom = req.query.createdAtFrom;
    createdAtTo = req.query.createdAtTo;
  } else {
    //Set createdAtFrom and createdAtTo to min and max date of the table
    createdAtMinMaxDate = await Helper.getColumnMinMax(
      Sequelize,
      db_lessonDiscussion,
      'createdAt'
    );
    createdAtMinMaxDate = createdAtMinMaxDate.get({ plain: true });
    createdAtFrom = createdAtMinMaxDate.min;
    createdAtTo = createdAtMinMaxDate.max;
  }

  //Order Data Based on created At of course
  let orderBy = '';
  if (req.query.orderBy) {
    orderBy =
      req.query.orderBy.trim() === 'DESC'
        ? 'lessonDiscussions.createdAt DESC'
        : 'lessonDiscussions.createdAt ASC';
  } else {
    orderBy = 'lessonDiscussions.createdAt ASC';
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
      data = await listLessonDiscussion_DoPagination(
        req,
        userId,
        lessonId,
        courseId,
        createdAtFrom,
        createdAtTo,
        orderBy,
        skip,
        _limit
      );
    } else {
      //NO Pagination
      data = await listLessonDiscussion_NOPagination(
        req,
        userId,
        lessonId,
        courseId,
        createdAtFrom,
        createdAtTo,
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

function listLessonDiscussion_NOPagination(
  req,
  userId,
  lessonId,
  courseId,
  createdAtFrom,
  createdAtTo,
  orderBy
) {
  return new Promise(async (resolve, reject) => {
    await db_lessonDiscussion
      .findAndCountAll({
        where: {
          [Op.and]: [
            { userId: { [Op.like]: userId } },
            { lessonId: { [Op.like]: lessonId } },
            {
              createdAt: {
                [Op.between]: [createdAtFrom, createdAtTo],
              },
            },
          ],
        },
        include: [
          {
            model: db_User,
            required: true,
            attributes: [
              'id',
              'username',
              'email',
              'isVerified',
              'createdAt',
              'updatedAt',
            ],
          },
          {
            model: db_lessonDiscussionComments,
            include: [
              {
                model: db_User,
                attributes: [
                  'id',
                  'username',
                  'email',
                  'isVerified',
                  'createdAt',
                  'updatedAt',
                ],
              },
            ],
          },
          {
            model: db_lesson,
            required: true,
            include: [
              {
                model: db_Course,
                required: true,
                where: {
                  id: { [Op.like]: courseId },
                },
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

function listLessonDiscussion_DoPagination(
  req,
  userId,
  lessonId,
  courseId,
  createdAtFrom,
  createdAtTo,
  orderBy,
  skip,
  _limit
) {
  return new Promise(async (resolve, reject) => {
    await db_AssignmentSubmission
      .findAndCountAll({
        where: {
          [Op.and]: [
            { userId: { [Op.like]: userId } },
            { lessonId: { [Op.like]: lessonId } },
            {
              createdAt: {
                [Op.between]: [createdAtFrom, createdAtTo],
              },
            },
          ],
        },
        include: [
          {
            model: db_User,
            required: true,
            attributes: [
              'id',
              'username',
              'email',
              'isVerified',
              'createdAt',
              'updatedAt',
            ],
          },
          {
            model: db_lessonDiscussionComments,
            include: [
              {
                model: db_User,
                attributes: [
                  'id',
                  'username',
                  'email',
                  'isVerified',
                  'createdAt',
                  'updatedAt',
                ],
              },
            ],
          },
          {
            model: db_lesson,
            required: true,
            include: [
              {
                model: db_Course,
                required: true,
                where: {
                  id: { [Op.like]: courseId },
                },
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
