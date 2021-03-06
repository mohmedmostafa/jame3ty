const Joi = require('joi');
const {
  Response,
  ValidateResponse,
  ResponseConstants,
} = require('../../../common/response/response.handler');

const db = require('../..');
const db_User = db.User;
const db_Role = db.Role;
const Op = db.Sequelize.Op;

//----------------------------------------------------------
checkDuplicateUsernameOrEmail = async (req, res, next) => {
  //check Duplicate of username or email
  try {
    //Username
    let username = await db_User.findOne({
      where: {
        username: req.body.username,
      },
    });

    if (username) {
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.code,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.type.RESOURCE_CONFLICT,
        ResponseConstants.ERROR_MESSAGES.USERNAME_EXISTS
      );
    }

    //Email
    let email = await db_User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (email) {
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.code,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.type.RESOURCE_CONFLICT,
        ResponseConstants.ERROR_MESSAGES.EMAIL_EXISTS
      );
    }

    return next();
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

//----------------------------------------------------------
checkRolesExisted = async (req, res, next) => {
  //Get all Roles From DB
  const allValidRoles = await db_Role.findAll({});

  //Get Roles Names EN Only
  let allValidRolesNames = [];
  if (allValidRoles.length > 0) {
    allValidRoles.forEach((elm) => {
      allValidRolesNames.push(elm.name_en);
    });
  }

  //Split Req.Body Roles
  let bodyRoles = req.body.roles.split(',');

  //Get all info about Req.Body roles
  const matchedRoles = await db_Role.findAll({
    where: {
      name_en: {
        [Op.in]: [bodyRoles],
      },
    },
  });

  //Get Roles Names EN Only
  let matchedRolesNames = [];
  if (matchedRoles.length > 0) {
    matchedRoles.forEach((elm) => {
      matchedRolesNames.push(elm.name_en);
    });
  }

  //Check that count of returned row equals to count of submited roles
  if (matchedRoles.length != bodyRoles.length) {
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
      ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type.INVALID_ROLE,
      ResponseConstants.ERROR_MESSAGES.INVALID_ROLE
    );
  }

  //If more than one role then refuse
  if (bodyRoles.length > 1) {
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
      ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type.TOO_MANY_ROLES,
      ResponseConstants.ERROR_MESSAGES.TOO_MANY_ROLES
    );
  }

  return next();
};

//----------------------------------------------------------
const VerifySignUp = {
  checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
  checkRolesExisted: checkRolesExisted,
};

module.exports = VerifySignUp;
