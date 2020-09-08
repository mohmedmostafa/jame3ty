const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const email = require('../../../common/email');
const moment = require('moment');
const db = require('../../../modules');
const config = require('../../../config/auth.config');
const { Response } = require('../../../common/response.handler');
const { JWT_SECRET_KEY } = require('../../../../app/config/env.config');

const db_connection = db.connection;
const db_User = db.User;
const db_Role = db.Role;
const Op = db.Sequelize.Op;

//---------------------------------------------------------------
exports.signup = async (req, res) => {
  //--------------------
  //Check if not Unique
  let userF = await db_User.findOne({
    where: {
      [Op.or]: {
        username: req.body.email,
        email: req.body.email,
      },
    },
  });

  if (userF) {
    return Response(res, 409, 'Username already exists!', {});
  }

  //Get all info about roles attached with the new account
  const roles = await db_Role.findAll({
    where: {
      name_en: {
        [Op.in]: [req.body.roles.split(',')],
      },
    },
  });

  //Start "Managed" Transaction
  try {
    const user = await db_connection.transaction(async (t) => {
      //const randomToken = await email.generateRandomToken({ byteLength: 10 });
      const randomToken = Math.floor(100000 + Math.random() * 900000);

      //Save the new account to DB
      const user = await db_User.create(
        {
          username: req.body.email,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 8),
          isVerified: 1,
          lastVerificationCodeSend: randomToken,
          lasVerificationCodeCreatedAt: moment(),
          lasVerificationCodeExpireAt: moment().add(1, 'd'),
        },
        { transaction: t }
      );

      //Add the roles to the new user
      await user.setRoles(roles, { transaction: t });

      return { user, randomToken };
    });

    //Send Verification Email with Code
    await email
      .sendSignupCerificationEmail(user.randomToken, req.body.email)
      .catch((err) => {
        console.error(err.message);
      });

    //Success
    return Response(res, 200, 'Success!', { user });
  } catch (error) {
    return Response(res, 500, 'Fail to add the new user!', { error });
  }
};

//---------------------------------------------------------------
exports.signin = async (req, res) => {
  //Get account info
  await db_User
    .findAll({
      where: {
        username: req.body.username,
      },
      include: [
        {
          model: db_Role,
        },
      ],
    })
    .then((loginUser) => {
      //If username not found
      if (loginUser.length <= 0) {
        return Response(res, 404, 'User Not found!', {});
      } else {
        //Focus on the desired data
        loginUser = loginUser.map(function (user) {
          return user.get({ plain: true });
        });

        loginUser = loginUser[0];
        loginUser = JSON.parse(JSON.stringify(loginUser));

        //Get Roles For user
        let authorities = [];
        if (loginUser.roles.length > 0) {
          loginUser.roles.forEach((elm) => {
            authorities.push(elm.name_en);
          });
        }

        console.log(loginUser);
        console.log(authorities);

        //If Not verified
        if (!loginUser.isVerified) {
          return Response(
            res,
            401,
            'Authorization Required! - Email Verification is Required!',
            {}
          );
        }

        //Validate PW
        var passwordIsValid = bcrypt.compareSync(
          req.body.password,
          loginUser.password
        );

        //If wrong PW
        if (!passwordIsValid) {
          return Response(
            res,
            401,
            'Authorization Required! - Invalid Password!',
            {}
          );
        }

        //Generate JWT token for that user
        var token = jwt.sign({ id: loginUser.id }, JWT_SECRET_KEY, {
          expiresIn: 86400, // 24 hours
        });

        //Success
        return Response(res, 200, 'Success!', {
          id: loginUser.id,
          username: loginUser.username,
          email: loginUser.email,
          roles: authorities,
          accessToken: token,
        });
      }
    })
    .catch((err) => {
      //Error
      console.log(err);
      return Response(res, 500, err.message, {});
    });
};
