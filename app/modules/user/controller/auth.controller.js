const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const email = require('../../../common/email');
const moment = require('moment');
const db = require('../../../modules');
const config = require('../../../config/auth.config');
const {
  Response,
  ResponseConstants,
} = require('../../../common/response/response.handler');

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
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.CONFLICT.code,
      ResponseConstants.HTTP_STATUS_CODES.CONFLICT.type.RESOURCE_CONFLICT,
      ResponseConstants.ERROR_MESSAGES.USERNAME_EXISTS
    );
  }

  userF = await db_User.findOne({
    where: {
      email: req.body.email,
    },
  });

  if (userF) {
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.CONFLICT.code,
      ResponseConstants.HTTP_STATUS_CODES.CONFLICT.type.RESOURCE_CONFLICT,
      ResponseConstants.ERROR_MESSAGES.EMAIL_EXISTS
    );
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
        console.error(err);
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
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
          ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
          ResponseConstants.ERROR_MESSAGES.USER_NOT_EXISTS
        );
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
            ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.code,
            ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type
              .INVALID_PASSWORD,
            ResponseConstants.ERROR_MESSAGES.INVALID_PASSWORD
          );
        }

        //If Not verified
        if (!loginUser.isVerified) {
          return Response(
            res,
            ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.code,
            ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type
              .EMAIL_UNVERIFIED,
            ResponseConstants.ERROR_MESSAGES.EMAIL_UNVERIFIED
          );
        }

        //Generate JWT token for that user
        var token = jwt.sign({ id: loginUser.id }, JWT_SECRET_KEY, {
          expiresIn: 86400, // 24 hours
        });

        //Success
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
          ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
          {
            id: loginUser.id,
            username: loginUser.username,
            email: loginUser.email,
            roles: authorities,
            accessToken: token,
          }
        );
      }
    })
    .catch((err) => {
      //Error
      console.log(err);
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
        ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
          .INTERNAL_SERVER_ERROR,
        ResponseConstants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
      );
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
        console.log('!user');
        //'Email Not found!'
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
          ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
          ResponseConstants.ERROR_MESSAGES.USER_NOT_EXISTS
        );
      } else {
        //If account already verified
        if (user.isVerified) {
          return Response(
            res,
            ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
            ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type
              .EMAIL_ALREADY_VERIFIED,
            ResponseConstants.ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED
          );
        } else {
          //If Code is expired
          if (moment().isAfter(user.lasVerificationCodeExpireAt)) {
            return Response(
              res,
              ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
              ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type
                .EXPIRED_VERIFICATION_CODE,
              ResponseConstants.ERROR_MESSAGES.EXPIRED_VERIFICATION_CODE
            );
          } else {
            if (req.body.code != user.lastVerificationCodeSend) {
              return Response(
                res,
                ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.code,
                ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type
                  .VERIFICATION_CODE_INCORRECT,
                ResponseConstants.ERROR_MESSAGES.VERIFICATION_CODE_INCORRECT
              );
            } else {
              await db_User
                .update({ isVerified: 1 }, { where: { email: req.body.email } })
                .catch((error) => {
                  console.log(error);
                  return Response(
                    res,
                    ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
                    ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
                      .ORM_OPERATION_FAILED,
                    ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
                  );
                })
                .then((result) => {
                  return Response(
                    res,
                    ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
                    ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
                    ResponseConstants.ERROR_MESSAGES.SUCCESS
                  );
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
        console.log('!user');
        //'Email Not found!'
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
          ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
          ResponseConstants.ERROR_MESSAGES.USER_NOT_EXISTS
        );
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
            console.log(err);
            console.error(err.message);
            return Response(
              res,
              ResponseConstants.HTTP_STATUS_CODES.BAD_GATEWAY.code,
              ResponseConstants.HTTP_STATUS_CODES.BAD_GATEWAY.type
                .VERIFICATION_EMAIL_SEND_FAILED,
              ResponseConstants.ERROR_MESSAGES.VERIFICATION_EMAIL_SEND_FAILED
            );
          })
          .then((result) => {
            return Response(
              res,
              ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
              ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type
                .VERIFICATION_CODE_SENT,
              ResponseConstants.ERROR_MESSAGES.VERIFICATION_CODE_SENT
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
        console.log('!user');
        //Email Not Found
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
          ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
          ResponseConstants.ERROR_MESSAGES.USER_NOT_EXISTS
        );
      } else {
        //If account not verified yet
        if (!user.isVerified) {
          return Response(
            res,
            ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.code,
            ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type
              .EMAIL_UNVERIFIED,
            ResponseConstants.ERROR_MESSAGES.EMAIL_UNVERIFIED
          );
        } else {
          //If Code is expired
          if (moment().isAfter(user.lasVerificationCodeExpireAt)) {
            return Response(
              res,
              ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.code,
              ResponseConstants.HTTP_STATUS_CODES.BAD_REQUEST.type
                .EXPIRED_VERIFICATION_CODE,
              ResponseConstants.ERROR_MESSAGES.EXPIRED_VERIFICATION_CODE
            );
          } else {
            if (req.body.code != user.lastVerificationCodeSend) {
              return Response(
                res,
                ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.code,
                ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type
                  .VERIFICATION_CODE_INCORRECT,
                ResponseConstants.ERROR_MESSAGES.VERIFICATION_CODE_INCORRECT
              );
            } else {
              db_User
                .update(
                  { password: bcrypt.hashSync(req.body.password, 8) },
                  { where: { email: req.body.email } }
                )
                .catch((error) => {
                  console.log(error);
                  return Response(
                    res,
                    ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
                    ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
                      .ORM_OPERATION_FAILED,
                    ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
                  );
                })
                .then((result) => {
                  return Response(
                    res,
                    ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
                    ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
                    { result }
                  );
                });
            }
          }
        }
      }
    });
};
