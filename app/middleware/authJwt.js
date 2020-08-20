const { Response, ValidateResponse } = require('../common/response.handler');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const db = require('../../app/modules');

//---------------------------------------
verifyToken = (req, res, next) => {
  console.log(req.headers.authorization);

  if (!req.headers.authorization) {
    return Response(res, 403, 'No token provided!', {});
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    //let token = req.headers['x-access-token'];
    let token = req.headers.authorization.split(' ')[1];

    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return Response(res, 401, 'Unauthorized!', {});
      }
      req.userId = decoded.id;
      next();
      return;
    });
  }
};

//---------------------------------------
isAdmin = (req, res, next) => {
  db.User.findByPk(req.userId).then((user) => {
    user.getRoles().then((roles) => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name_en === 'admin') {
          next();
          return;
        }
      }

      return Response(res, 403, 'Require Admin Role!', {});
    });
  });
};

//---------------------------------------
isInstructor = (req, res, next) => {
  db.User.findByPk(req.userId).then((user) => {
    user.getRoles().then((roles) => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name_en === 'instructor') {
          next();
          return;
        }
      }

      return Response(res, 403, 'Require Instructor Role!', {});
    });
  });
};

//---------------------------------------
isInstructorOrAdmin = (req, res, next) => {
  db.User.findByPk(req.userId).then((user) => {
    user.getRoles().then((roles) => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name_en === 'instructor') {
          next();
          return;
        }

        if (roles[i].name_en === 'admin') {
          next();
          return;
        }
      }

      return Response(res, 403, 'Require Instructor or Admin Role!', {});
    });
  });
};

//---------------------------------------
const authJwt = {
  VerifyToken: verifyToken,
  isAdmin: isAdmin,
  isInstructor: isInstructor,
  isInstructorOrAdmin: isInstructorOrAdmin,
};
module.exports = authJwt;
