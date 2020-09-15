const db = require('../../../modules');
const {
  Response,
  ValidateResponse,
  ResponseConstants,
} = require('../../../common/response/response.handler');

const bcrypt = require('bcryptjs');
const { number } = require('joi');
const helper = require('../../../common/helper');
const email = require('../../../common/email');
const moment = require('moment');

const {
  onErrorDeleteFiles,
  deleteFile,
} = require('../../../common/attachmentsUpload/multerConfig');

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
        username: req.body.username,
      },
    });

    if (userF) {
      onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.code,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.type.RESOURCE_CONFLICT,
        ResponseConstants.ERROR_MESSAGES.USERNAME_EXISTS
      );
    }

    //
    userF = await db_User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (userF) {
      onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.code,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.type.RESOURCE_CONFLICT,
        ResponseConstants.ERROR_MESSAGES.EMAIL_EXISTS
      );
    }

    //
    let instructorF = await db_Instructor.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (instructorF) {
      onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.code,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.type.RESOURCE_CONFLICT,
        ResponseConstants.ERROR_MESSAGES.EMAIL_EXISTS
      );
    }

    //
    instructorF = await db_Instructor.findOne({
      where: {
        mobile: req.body.mobile,
      },
    });

    if (instructorF) {
      onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.code,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.type.RESOURCE_CONFLICT,
        ResponseConstants.ERROR_MESSAGES.MOBILE_EXISTS
      );
    }
    //--------------------
    //Create Attachment String
    if (req.files.img) {
      let field_1 = [];
      req.files['img'].forEach((file) => {
        let fileUrl = file.path.replace(/\\/g, '/');
        field_1.push(fileUrl);
      });
      req.body.img = field_1.join();
    }

    //Create Attachment String
    if (req.files.file) {
      let field_1 = [];
      req.files['file'].forEach((file) => {
        let fileUrl = file.path.replace(/\\/g, '/');
        field_1.push(fileUrl);
      });
      req.body.file = field_1.join();
    }

    //Save TO DB
    const instructor = await db_connection.transaction(async (t) => {
      //const randomToken = await email.generateRandomToken({ byteLength: 10 });
      const randomToken = Math.floor(100000 + Math.random() * 900000);

      //
      const inst = await db_Instructor.create(
        {
          name_ar: req.body.name_ar,
          name_en: req.body.name_en,
          bio: req.body.bio,
          mobile: req.body.mobile,
          email: req.body.email,
          img: req.body.img,
          cv: req.body.file,
        },
        { transaction: t }
      );

      const user = await db_User.create(
        {
          email: req.body.email,
          username: req.body.username,
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
      .sendSignupVerificationEmail(instructor.randomToken, req.body.email)
      .catch((err) => {
        console.log(err);
        console.error(err.message);
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.BAD_GATEWAY.code,
          ResponseConstants.HTTP_STATUS_CODES.BAD_GATEWAY.type
            .VERIFICATION_EMAIL_SEND_FAILED,
          ResponseConstants.ERROR_MESSAGES.VERIFICATION_EMAIL_SEND_FAILED
        );
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
      console.log('!instructor');
      onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
      );
    }

    console.log(req.body.password ? true : false, 'dsasasdasd');

    //--------------------
    //Check if not Unique
    let inst = await db_Instructor.findOne({
      where: {
        mobile: req.body.mobile,
        id: {
          [Op.ne]: req.params.id,
        },
      },
    });

    if (inst) {
      onErrorDeleteFiles(req);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.code,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.type.RESOURCE_CONFLICT,
        ResponseConstants.ERROR_MESSAGES.MOBILE_EXISTS
      );
    }

    //--------------------
    //Create Attachment String
    if (req.files.img) {
      let field_1 = [];
      req.files['img'].forEach((file) => {
        let fileUrl = file.path.replace(/\\/g, '/');
        field_1.push(fileUrl);
      });
      req.body.img = field_1.join();
    }

    //Create Attachment String
    if (req.files.file) {
      let field_1 = [];
      req.files['file'].forEach((file) => {
        let fileUrl = file.path.replace(/\\/g, '/');
        field_1.push(fileUrl);
      });
      req.body.file = field_1.join();
    }

    //Do Update
    const instructor = await db_connection.transaction(async (t) => {
      _Instructor = await db_Instructor.update(
        {
          name_ar: req.body.name_ar ? req.body.name_ar : Instructor.name_ar,
          name_en: req.body.name_en ? req.body.name_en : Instructor.name_en,
          bio: req.body.bio ? req.body.name_en : Instructor.bio,
          mobile: req.body.mobile ? req.body.mobile : Instructor.mobile,
          email: req.body.email ? req.body.email : Instructor.email,
          //img: req.files['img'] ? req.files['img'][0].path : Instructor.img,
          img: req.body.img ? req.body.img : Instructor.getDataValue('img'),
          //cv: req.files['file'] ? req.files['file'][0].path : Instructor.cv,
          cv: req.body.file ? req.body.file : Instructor.getDataValue('cv'),
        },
        { where: { id: req.params.id } },
        { transaction: t }
      );

      if (_Instructor && req.body.img) {
        let imgStr = Instructor.getDataValue('img');
        if (imgStr.length > 0) {
          let locations = imgStr.split(',');
          console.log(locations);
          locations.forEach((loc) => {
            deleteFile(loc);
          });
        }
      }

      if (_Instructor && req.body.file) {
        let imgStr = Instructor.getDataValue('cv');
        if (imgStr.length > 0) {
          let locations = imgStr.split(',');
          console.log(locations);
          locations.forEach((loc) => {
            deleteFile(loc);
          });
        }
      }

      _User = await db_User.update(
        {
          username: req.body.username
            ? req.body.username
            : Instructor.user.username,
          password: req.body.password
            ? bcrypt.hashSync(req.body.password, 8)
            : Instructor.user.password,
          email: req.body.email ? req.body.email : Instructor.email,
        },
        { where: { id: Instructor.userId } },
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
      console.log('!instructor');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
      );
    }

    //Check if it has course or group
    if (Instructor.courses.length > 0) {
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.code,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.type
          .RESOURCE_HAS_DEPENDENTS,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_HAS_DEPENDENTS
      );
    }

    if (Instructor.groups.length > 0) {
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.code,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.type
          .RESOURCE_HAS_DEPENDENTS,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_HAS_DEPENDENTS
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
exports.listInstructor = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Calc skip or offset to be used in limit
  let skip = (page - 1) * numPerPage;
  let _limit = numPerPage;

  //Query
  let searchKey = req.query.searchKey ? req.query.searchKey : '';

  //check if
  const userData = await helper.getUserdata(req, res).catch((err) => {
    console.log(err);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
        .ORM_OPERATION_FAILED,
      ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
    );
  });
  console.log(userData);

  //if there no user data returned
  if (
    userData.type == 'instructor' &&
    (userData.data == null || userData.data.id != req.params.id)
  ) {
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.code,
      ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.type.ACCESS_DENIED,
      ResponseConstants.ERROR_MESSAGES.ACCESS_DENIED
    );
  }

  try {
    let data = await db_Instructor.findAll({
      where: {
        [Op.or]: [
          {
            name_ar: {
              [Op.substring]: searchKey,
            },
          },
          {
            name_en: {
              [Op.substring]: searchKey,
            },
          },
          {
            mobile: {
              [Op.substring]: searchKey,
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
              [Op.substring]: searchKey,
            },
          },

          {
            name_en: {
              [Op.substring]: searchKey,
            },
          },
          {
            mobile: {
              [Op.substring]: searchKey,
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
      console.log('!instructor');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
      );
    }

    const userData = await helper.getUserdata(req, res).catch((err) => {
      console.log(err);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
          .ORM_OPERATION_FAILED,
        ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
      );
    });

    if (
      userData.type == 'instructor' &&
      (userData.data == null || userData.data.id != req.params.id)
    ) {
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.code,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.type.ACCESS_DENIED,
        ResponseConstants.ERROR_MESSAGES.ACCESS_DENIED
      );
    }

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { Instructor }
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
