const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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
      //Save the new account to DB
      const user = await db_User.create(
        {
          username: req.body.username,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 8),
        },
        { transaction: t }
      );

      //Add the roles to the new user
      await user.setRoles(roles, { transaction: t });

      return user;
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

        //Validate PW
        var passwordIsValid = bcrypt.compareSync(
          req.body.password,
          loginUser.password
        );

        //If wrong PW
        if (!passwordIsValid) {
          return Response(res, 401, 'Invalid Password!', {});
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
