const Joi = require('joi');
const { Response, ValidateResponse } = require('../common/response.handler');
const db = require('../models');
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
      return Response(res, 422, 'Failed! Username is already in use!', {});
    }

    //Email
    let email = await db_User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (email) {
      return Response(res, 422, 'Failed! Email is already in use!', {});
    }

    return next();
  } catch (error) {
    return Response(res, 500, 'Fail to Find!', { error });
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
    return Response(res, 404, 'Some Roles are not valid!', {
      allValidRoles: allValidRolesNames,
      matchedRoles: matchedRolesNames,
    });
  }

  return next();
};

//----------------------------------------------------------
const VerifySignUp = {
  checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
  checkRolesExisted: checkRolesExisted,
};

module.exports = VerifySignUp;
