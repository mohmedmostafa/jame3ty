const db = require('../../../modules');
const { Response } = require('../../../common/response.handler');
const { ValidateResponse } = require('../../../common/response.handler');
const bcrypt = require('bcryptjs');
const { number } = require('joi');
const helper = require('../../../common/helper');
const email = require('../../../common/email');
const moment = require('moment');

const {
  onErrorDeleteFiles,
  deleteFile,
} = require('../../../common/multerConfig');

const request = require('request');
const { PORT, HOST } = require('../../../config/env.config');

const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

const Op = db.Sequelize.Op;
const db_connection = db.connection;
const db_Instructor = db.Instructor;
const db_User = db.User;
const db_Role = db.Role;
const db_User_Role = db.UserRole;
const db_Course = db.Course;
const db_Group = db.Group;
const db_GroupSchedule = db.GroupSchedule;

//---------------------------------------------------------------
exports.addInstructor = async (req, res) => {
  try {
    //check captch
    // if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null)
    // {
    //    return Response(res, 400, 'Fail to validate recaptcha',  {"responseError" : "something goes to wrong" });

    // }
    // console.log(req.body['g-recaptcha-response']);
    // const secretKey = "6Lc82cIZAAAAAG0yX5SrfKAbOPw2J1XVgq4UDkJ1";

    // const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

    // request(verificationURL,function(error,response,body) {
    //   body = JSON.parse(body);

    //   if(body.success !== undefined && !body.success) {
    //     return Response(res, 400, 'Fail to validate recaptcha',  {"responseError" : "Failed captcha verification" });
    //   }
    //   // res.json({"responseSuccess" : "Sucess"});
    // });
    //
    //--------------------
    //Check if not Unique
    let userF = await db_User.findOne({
      where: {
        username: req.body.email,
      },
    });

    if (userF) {
      onErrorDeleteFiles(req);
      return Response(res, 409, 'Username already exists!', {});
    }

    //
    userF = await db_User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (userF) {
      onErrorDeleteFiles(req);
      return Response(res, 409, 'Email already exists!', {});
    }

    //
    let instructorF = await db_Instructor.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (instructorF) {
      onErrorDeleteFiles(req);
      return Response(res, 409, 'Email already exists!', {});
    }

    //
    instructorF = await db_Instructor.findOne({
      where: {
        mobile: req.body.mobile,
      },
    });

    if (instructorF) {
      onErrorDeleteFiles(req);
      return Response(res, 409, 'Mobile already exists!', {});
    }
    //--------------------

    //Save TO DB
    const instructor = await db_connection.transaction(async (t) => {
      const randomToken = await email.generateRandomToken({ byteLength: 10 });

      //
      const inst = await db_Instructor.create(
        {
          name_ar: req.body.name_ar,
          name_en: req.body.name_en,
          bio: req.body.bio,
          mobile: req.body.mobile,
          email: req.body.email,
          img: req.files['img'] ? req.files['img'][0].path : null,
          cv: req.files['file'] ? req.files['file'][0].path : null,
        },
        { transaction: t }
      );

      const user = await db_User.create(
        {
          email: req.body.email,
          username: req.body.email,
          password: bcrypt.hashSync(req.body.password, 8),
          isVerified: 0,
          lastVerificationCodeSend: randomToken,
          lasVerificationCodeCreatedAt: moment(),
          lasVerificationCodeExpireAt: moment().add(1, 'd'),
        },
        { transaction: t }
      );
      inst.setUser(user, { transaction: t });

      const roles = await db_Role.findOne({
        where: {
          name_en: {
            [Op.eq]: ['instructor'],
          },
        },
      });

      await user.addRole(roles, { transaction: t });

      return { inst, randomToken };
    });

    //Send Verification Email with Code
    await email
      .sendSignupCerificationEmail(instructor.randomToken)
      .catch((err) => {
        console.error(err.message);
      });

    //Success
    return Response(res, 200, 'Success!', { instructor });
  } catch (error) {
    console.log(error);
    onErrorDeleteFiles(req);
    return Response(res, 500, 'Fail to Add', { error });
  }
};

//---------------------------------------------------------------
exports.updateInstructor = async (req, res) => {
  console.log('m8');
  try {
    //Check if already exsits
    let Instructor = await db_Instructor.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: db_User,
        },
      ],
    });

    if (!Instructor) {
      onErrorDeleteFiles(req);
      return Response(res, 404, 'Instructor Not Found!', {});
    }

    console.log(Instructor);

    //--------------------
    //Check if not Unique
    let user = await db_User.findOne({
      where: {
        email: req.body.email,
        id: { [Op.ne]: Instructor.user.id },
      },
    });

    if (user) {
      onErrorDeleteFiles(req);
      return Response(res, 409, 'Email already exists!', {});
    }

    user = await db_User.findOne({
      where: {
        username: req.body.email,
        id: { [Op.ne]: Instructor.user.id },
      },
    });

    if (user) {
      onErrorDeleteFiles(req);
      return Response(res, 409, 'Username already exists!', {});
    }

    let inst = await db_Instructor.findOne({
      where: {
        email: req.body.email,
        id: {
          [Op.ne]: req.params.id,
        },
      },
    });

    if (inst) {
      onErrorDeleteFiles(req);
      return Response(res, 409, 'Email already exists!', {});
    }

    //
    inst = await db_Instructor.findOne({
      where: {
        mobile: req.body.mobile,
        id: {
          [Op.ne]: req.params.id,
        },
      },
    });

    if (inst) {
      onErrorDeleteFiles(req);
      return Response(res, 409, 'Mobile already exists!', {});
    }
    //--------------------

    //Do Update
    const instructor = await db_connection.transaction(async (t) => {
      _Instructor = await db_Instructor.update(
        {
          name_ar: req.body.name_ar ? req.body.name_ar : Instructor.name_ar,
          name_en: req.body.name_en ? req.body.name_en : Instructor.name_en,
          bio: req.body.bio ? req.body.name_en : Instructor.bio,
          mobile: req.body.mobile ? req.body.mobile : Instructor.mobile,
          email: req.body.email ? req.body.email : Instructor.email,
          img: req.files['img'] ? req.files['img'][0].path : Instructor.img,
          cv: req.files['file'] ? req.files['file'][0].path : Instructor.cv,
        },
        { where: { id: req.params.id } },
        { transaction: t }
      );
      //delete file
      if (Instructor.img) {
        unlinkAsync(Instructor.getDataValue('img'));
      }

      if (Instructor.cv) {
        unlinkAsync(Instructor.getDataValue('cv'));
      }

      let User = await db_Instructor.findByPk(Instructor.userId);

      _User = await db_User.update(
        {
          username: req.body.email ? req.body.email : User.email,
          password: req.body.password
            ? bcrypt.hashSync(req.body.password, 8)
            : User.password,
          email: req.body.email ? req.body.email : User.email,
        },
        { where: { id: Instructor.userId } },
        { transaction: t }
      );
    });
    //Success
    return Response(res, 200, 'Success!', [_Instructor, _User]);
  } catch (error) {
    console.log(error);
    onErrorDeleteFiles(req);
    return Response(res, 500, 'Fail to Udpate!', { error });
  }
};

//---------------------------------------------------------------
exports.deleteInstructor = async (req, res) => {
  try {
    //Check if the faculty is already exsits
    let Instructor = await db_Instructor.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: db_User,
        },
        { model: db_Course },
        { model: db_Group },
      ],
    });

    if (!Instructor) {
      return Response(res, 404, 'Instructor Not Found!', {});
    }

    //Check if it has course or group
    if (Instructor.courses.length > 0) {
      return Response(
        res,
        409,
        "Can't Delete. The Instructor has courses created",
        {
          Instructor,
        }
      );
    }

    if (Instructor.groups.length > 0) {
      return Response(
        res,
        409,
        "Can't Delete. The Instructor has group created",
        {
          Instructor,
        }
      );
    }

    let instructorUserId = Instructor.userId;
    let user_id = Instructor.user.id;
    // //Delete
    const instructor = await db_connection.transaction(async (t) => {
      Instructor = await db_Instructor.destroy(
        {
          where: { id: req.params.id },
        },
        { transaction: t }
      );
      //delete images
      if (Instructor.img) {
        unlinkAsync(Instructor.getDataValue('img'));
      }

      if (Instructor.cv) {
        unlinkAsync(Instructor.getDataValue('cv'));
      }

      role = await db_User_Role.destroy(
        { where: { userId: user_id } },
        { transaction: t }
      );
      user = await db_User.destroy(
        { where: { id: instructorUserId } },
        { transaction: t }
      );
    });
    //Success
    return Response(res, 200, 'Success!', [Instructor, role, user]);
  } catch (error) {
    console.log(error);

    return Response(res, 500, 'Fail to Udpate!', { error });
  }
};

//---------------------------------------------------------------
exports.listInstructor = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Calc skip or offset to be used in limit
  let skip = (page - 1) * numPerPage;
  let _limit = numPerPage;

  //Query
  let name_ar = req.query.name_ar ? req.query.name_ar : '';
  let name_en = req.query.name_en ? req.query.name_en : '';
  let mobile = req.query.mobile ? req.query.mobile : '';

  //check if
  const userData = await helper.getUserdata(req, res).catch((err) => {
    return Response(res, 500, 'Error in Retrieve some data', {
      err,
    });
  });
  console.log(userData);

  //if there no user data returned
  if (
    userData.type == 'instructor' &&
    (userData.data == null || userData.data.id != req.params.id)
  ) {
    return Response(res, 403, 'You have no permission to open this page', {});
  }

  try {
    let data = await db_Instructor.findAll({
      where: {
        [Op.or]: [
          {
            name_ar: {
              [Op.substring]: name_ar,
            },
          },
          {
            name_en: {
              [Op.substring]: name_en,
            },
          },
          {
            mobile: {
              [Op.substring]: mobile,
            },
          },
        ],
      },
      offset: skip,
      limit: _limit,
    });

    let data_all = await db_Instructor.findAll({
      where: {
        [Op.or]: [
          {
            name_ar: {
              [Op.substring]: name_ar,
            },
          },

          {
            name_en: {
              [Op.substring]: name_en,
            },
          },
          {
            mobile: {
              [Op.substring]: mobile,
            },
          },
        ],
      },
    });

    //Total num of all rows
    let numRows = parseInt(data_all.length);

    //Total num of valid pages
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
    return Response(res, 200, 'Success!', { result });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail To Find!', { error });
  }
};
//---------------------------------------------------------------
exports.listInstructorById = async (req, res) => {
  try {
    let Instructor = await db_Instructor.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: db_User,
        },
        { model: db_Course },
        { model: db_Group },
      ],
    });

    if (!Instructor) {
      return Response(res, 404, 'Instructor Not Found!', {});
    }

    const userData = await helper.getUserdata(req, res).catch((err) => {
      console.log(err);
      return Response(res, 500, 'Error in Retrieve some data', {
        err,
      });
    });

    if (
      userData.type == 'instructor' &&
      (userData.data == null || userData.data.id != req.params.id)
    ) {
      return Response(res, 403, 'You have no permission to open this page', {});
    }

    //Success
    return Response(res, 200, 'Success!', { Instructor });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail To Find!', { error });
  }
};
