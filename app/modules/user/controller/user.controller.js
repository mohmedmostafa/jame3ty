const db = require('../../../modules');
const {
  Response,
  ResponseConstants,
} = require('../../../common/response/response.handler');

const bcrypt = require('bcryptjs');
const { number } = require('joi');
const helper = require('../../../common/helper');

// exports.allAccess = (req, res) => {
//   return Response(res, ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
// ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS, 'Public Content.');
// };

// exports.userBoard = (req, res) => {
//   return Response(res, ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
// ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS, 'User Content.');
// };

// exports.adminBoard = (req, res) => {
//   return Response(res, ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
// ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS, 'Admin Content.');
// };

// exports.UserBoard = (req, res) => {
//   return Response(res, ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
// ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS, 'User Content.');
// };

const Op = db.Sequelize.Op;
const db_connection = db.connection;
const db_User = db.User;
const db_Role = db.Role;
const db_User_Role = db.UserRole;

//---------------------------------------------------------------
exports.updateUser = async (req, res) => {
  console.log('m8');
  try {
    //Check if the User is already exsits
    let admin = await db_User.findByPk(req.params.id);

    if (!admin) {
      console.log('!admin');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
      );
    }

    //find admin roles data from db
    const roles = await db_Role.findAll({
      where: {
        name_en: {
          [Op.in]: [req.body.roles.split(',')],
        },
      },
    });

    //Do Update
    const _admin = await db_connection.transaction(async (t) => {
      _User = await db_User.update(
        {
          username: req.body.username ? req.body.username : admin.username,
          password: req.body.password
            ? bcrypt.hashSync(req.body.password, 8)
            : admin.password,
          email: req.body.email ? req.body.email : admin.email,
        },
        { where: { id: admin.id } },
        { transaction: t }
      );

      await admin.setRoles(roles, { transaction: t });

      return _User;
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
exports.deleteUser = async (req, res) => {
  try {
    //Check if the faculty is already exsits
    let Admin = await db_User.findOne({
      where: { id: req.params.id },
      include: { model: db.Role },
    });

    if (!Admin) {
      console.log('!admin');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND
      );
    }
    //insure that the user is only admin
    const adminRoles = Admin.roles.map((item) => {
      return item.name_en;
    });

    if (adminRoles.includes('student') || adminRoles.includes('instructor'))
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.code,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.type.HAS_MANY_ROLES,
        ResponseConstants.ERROR_MESSAGES.HAS_MANY_ROLES
      );

    // //Delete
    const User = await db_connection.transaction(async (t) => {
      role = await db_User_Role.destroy(
        { where: { userId: req.params.id } },
        { transaction: t }
      );
      user = await db_User.destroy(
        { where: { id: req.params.id } },
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
exports.listUser = async (req, res) => {
  try {
    let data;

    data = await db_User.findAll({
      include: {
        model: db_Role,
        where: {
          name_en: {
            [Op.substring]: 'admin',
          },
        },
      },
    });

    console.log(data);
    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { data }
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
exports.listUserById = async (req, res) => {
  try {
    let User = await db_User.findOne({
      where: { id: req.params.id },
      include: {
        model: db_Role,
      },
    });

    if (!User) {
      console.log('!user');
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
      { User }
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
