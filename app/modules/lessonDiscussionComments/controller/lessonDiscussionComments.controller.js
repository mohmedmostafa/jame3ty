const db = require('../../../modules');
const { Response } = require('../../../common/response/response.handler');
const {
  ResponseConstants,
} = require('../../../common/response/response.constants');

const { ref, date } = require('joi');
const { User } = require('../../../modules');

const Op = db.Sequelize.Op;
const db_connection = db.connection;
const db_lessonDiscussionComments = db.lessonDiscussionComment;
const db_lessonDiscussion = db.LessonDiscussion;
const db_lesson = db.Lesson;
const db_User = db.User;

//---------------------------------------------------------------
exports.addlessonDiscussionComments = async (req, res) => {
  const user = await db_User.findByPk(req.body.userId);
  console.log('test', user);
  if (!user)
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
      ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
      {}
    );

  //add post
  if (req.body.lessonId) {
    const lesson = await db_lesson.findByPk(req.body.lessonId);

    if (!lesson)
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        {}
      );

    const post = await addPost(req, user, lesson).catch((err) => {
      console.log(err);
      return Response(res, 500, 'Fail to Insert!', { err });
    });
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { post }
    );

    //add comment
  } else {
    const lessonDiscussion = await db_lessonDiscussion.findByPk(
      req.body.lessonDiscussionId
    );

    if (!lessonDiscussion)
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        {}
      );

    const comment = await addComment(req, user, lessonDiscussion).catch(
      (err) => {
        console.log(err);
        return Response(res, 500, 'Fail to Insert!', { err });
      }
    );
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
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        {}
      );
    }

    //get user model
    const user = await db_User.findByPk(req.body.userId);

    if (!user)
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        {}
      );

    //get lesson model
    const lessonDiscussion = await db_lessonDiscussion.findByPk(
      req.body.lessonDiscussionId
    );

    if (!lessonDiscussion)
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        {}
      );

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
      { _lessonDiscussionComments }
    );
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
  }
};

exports.updatelessonDiscussion = async (req, res) => {
  try {
    //Check if the lessonDiscussionComments is already exsits
    let lessonDiscussion = await db_lessonDiscussion.findByPk(req.params.id);

    if (!lessonDiscussion) {
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        {}
      );
    }

    //get user model
    const user = await db_User.findByPk(req.body.userId);
    console.log('test', user);
    if (!user)
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        {}
      );

    //get lesson model
    const lesson = await db_lesson.findByPk(req.body.lessonId);

    if (!lesson)
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        {}
      );

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
      { _lessonDiscussion }
    );
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
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
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        {}
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
      { lessonDiscussionComments }
    );
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
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
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        {}
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
      { _lessonDiscussion }
    );
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
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
    let data = await db_lessonDiscussion.findAll({
      where: {
        lessonId: { [Op.eq]: lessonId },
      },
      include: {
        model: db_lessonDiscussionComments,
      },
      offset: skip,
      order: db.Sequelize.literal('updatedAt DESC'),
      limit: _limit,
    });

    let data_all = await db_lessonDiscussion.findAll({
      where: {
        lessonId: { [Op.eq]: lessonId },
      },
      include: {
        model: db_lessonDiscussionComments,
      },
      order: db.Sequelize.literal('updatedAt DESC'),
    });

    let numRows = parseInt(data_all.length);

    // //Total num of valid pages
    let numPages = Math.ceil(numRows / numPerPage);
    data = doPagination ? data : data_all;
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
    return Response(res, 500, 'Fail To Find!', { error });
  }
};

//---------------------------------listlessonDiscussionById------------------------------
exports.listlessonDiscussionById = async (req, res) => {
  try {
    let lessonDiscussion = await db_lessonDiscussion.findOne({
      where: { id: req.params.id },
      include: {
        model: db_lessonDiscussionComments,
      },
    });

    if (!lessonDiscussion) {
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        {}
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
    return Response(res, 500, 'Fail To Find!', { error });
  }
};

exports.listlessonDiscussionCommentsById = async (req, res) => {
  try {
    let lessonDiscussionComments = await db_lessonDiscussionComments.findOne({
      where: { id: req.params.id },
    });

    if (!lessonDiscussionComments) {
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        {}
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
    return Response(res, 500, 'Fail To Find!', { error });
  }
};
