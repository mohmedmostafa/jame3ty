const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const email = require('../../../common/email');
const moment = require('moment');
const db = require('../../../modules');
const config = require('../../../config/auth.config');
const { Response } = require('../../../response/response.handler');
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
      username: req.body.username,
    },
  });

  if (userF) {
    return Response(res, 409, 'Username already exists!', {});
  }

  userF = await db_User.findOne({
    where: {
      email: req.body.email,
    },
  });

  if (userF) {
    return Response(res, 409, 'Email already exists!', {});
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
          username: req.body.username,
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
      .sendSignupVerificationEmail(user.randomToken, req.body.email)
      .catch((err) => {
        console.error(err.message);
        return Response(
          res,
          502,
          'Failed to Send Verification Code to ' + req.body.email,
          { err }
        );
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
        [Op.or]: {
          username: req.body.username,
          email: req.body.username,
        },
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

        //If Not verified
        if (!loginUser.isVerified) {
          return Response(
            res,
            401,
            'Authorization Required! - Email Verification is Required!',
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

exports.verifyEmail = async (req, res) => {
  //Get account info
  await db_User
    .findOne({
      where: {
        email: req.body.email,
      },
    })
    .then(async (user) => {
      //If Email not found
      if (!user) {
        return Response(res, 404, 'Email Not found!', {});
      } else {
        //If account already verified
        if (user.isVerified) {
          return Response(res, 200, 'Email is already verified!', {});
        } else {
          //If Code is expired
          if (moment().isAfter(user.lasVerificationCodeExpireAt)) {
            return Response(res, 410, 'Verification code is expired!', {});
          } else {
            if (req.body.code != user.lastVerificationCodeSend) {
              return Response(res, 401, 'Verification code was incorrect!', {});
            } else {
              await db_User
                .update({ isVerified: 1 }, { where: { email: req.body.email } })
                .catch((error) => {
                  console.log(error);
                  return Response(
                    res,
                    500,
                    'Fail to Verify Email!' + req.body.email,
                    { error }
                  );
                })
                .then((result) => {
                  return Response(res, 200, 'Success!', { result });
                });
            }
          }
        }
      }
    });
};

exports.sendVerificationCode = async (req, res) => {
  //Get account info
  await db_User
    .findOne({
      where: {
        email: req.body.email,
      },
    })
    .then(async (user) => {
      //If Email not found
      if (!user) {
        return Response(res, 404, 'Email Not found!', {});
      } else {
        //const randomToken = await email.generateRandomToken({ byteLength: 10 });
        const randomToken = Math.floor(100000 + Math.random() * 900000);

        await db_User.update(
          {
            lastVerificationCodeSend: randomToken,
            lasVerificationCodeCreatedAt: moment(),
            lasVerificationCodeExpireAt: moment().add(1, 'd'),
          },
          { where: { email: req.body.email } }
        );

        //Send Verification Email with Code
        await email
          .sendSignupVerificationEmail(randomToken, req.body.email)
          .catch((err) => {
            console.error(err.message);
            return Response(
              res,
              502,
              'Failed to Send Verification Code to ' + req.body.email,
              { err }
            );
          })
          .then((result) => {
            return Response(
              res,
              200,
              'Success! Verification Code has been send to ' + req.body.email,
              {}
            );
          });
      }
    });
};

exports.forgotPassword = async (req, res) => {
  //Get account info
  await db_User
    .findOne({
      where: {
        email: req.body.email,
      },
    })
    .then(async (user) => {
      //If Email not found
      if (!user) {
        return Response(res, 404, 'Email Not found!', {});
      } else {
        //If account not verified yet
        if (!user.isVerified) {
          return Response(res, 200, 'Email is not verified!', {});
        } else {
          //If Code is expired
          if (moment().isAfter(user.lasVerificationCodeExpireAt)) {
            return Response(res, 410, 'Verification code is expired!', {});
          } else {
            if (req.body.code != user.lastVerificationCodeSend) {
              return Response(res, 401, 'Verification code was incorrect!', {});
            } else {
              db_User
                .update(
                  { password: bcrypt.hashSync(req.body.password, 8) },
                  { where: { email: req.body.email } }
                )
                .catch((error) => {
                  console.log(error);
                  return Response(res, 500, 'Fail to Change Password!', {
                    error,
                  });
                })
                .then((result) => {
                  return Response(res, 200, 'Success!', { result });
                });
            }
          }
        }
      }
    });
};
