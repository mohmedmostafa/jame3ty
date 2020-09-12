const db = require('../../../modules');
const { Response } = require('../../../response/response.handler');
const bcrypt = require('bcryptjs');
const { number } = require('joi');
const helper = require('../../../common/helper');

// exports.allAccess = (req, res) => {
//   return Response(res, 200, 'Success!', 'Public Content.');
// };

// exports.userBoard = (req, res) => {
//   return Response(res, 200, 'Success!', 'User Content.');
// };

// exports.adminBoard = (req, res) => {
//   return Response(res, 200, 'Success!', 'Admin Content.');
// };

// exports.UserBoard = (req, res) => {
//   return Response(res, 200, 'Success!', 'User Content.');
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
      return Response(res, 404, 'User Not Found!', {});
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
    return Response(res, 200, 'Success!', [_User]);
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
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
      return Response(res, 404, 'User Not Found!', {});
    }
    //insure that the user is only admin
    const adminRoles = Admin.roles.map((item) => {
      return item.name_en;
    });

    if (adminRoles.includes('student') || adminRoles.includes('instructor'))
      return Response(
        res,
        422,
        'User cant be deleted, has roles more than admin!',
        {}
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
    return Response(res, 200, 'Success!', [role, user]);
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
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
    return Response(res, 200, 'Success!', { data });
  } catch (error) {
    return Response(res, 500, 'Fail To Find!', { error });
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
      return Response(res, 404, 'User Not Found!', {});
    }

    //Success
    return Response(res, 200, 'Success!', { User });
  } catch (error) {
    return Response(res, 500, 'Fail To Find!', { error });
  }
};
