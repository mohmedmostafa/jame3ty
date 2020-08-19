const db = require('../models');
const config = require('../config/auth.config');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const { userSchema } = require('../models/user/user.validation');

const Op = db.Sequelize.Op;

exports.signup = (req, res) => {
  // Save User to Database
  db.User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  })
    .then((user) => {
      if (req.body.roles) {
        db.Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles,
            },
          },
        }).then((roles) => {
          user.setRoles(roles).then(() => {
            res.send({ message: 'User registered successfully!' });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          res.send({ message: 'User registered successfully!' });
        });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  const { error, value } = userSchema.validate({
    username: req.body.username,
    password: req.body.password,
  });
  if (error) {
    res.status(422).send({
      message: error.details,
    });
  }

  db.User.findOne({
    where: {
      username: req.body.username,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'User Not found.' });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: 'Invalid Password!',
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400, // 24 hours
      });
      console.log(`Token: ${token}`);

      var authorities = [];
      db.User.findAll({
        include: [
          {
            model: Role,
            through: {
              attributes: ['createdAt'],
            },
          },
        ],
      }).then((roles) => {
        console.log(roles);
        for (let i = 0; i < roles.length; i++) {
          authorities.push('ROLE_' + roles[i].name_en.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token,
        });
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
