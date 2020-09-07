const { Response, ValidateResponse } = require('../common/response.handler');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const db = require('../../app/modules');
const { JWT_SECRET_KEY } = require('../../app/config/env.config');

//---------------------------------------
verifyToken = (req, res, next) => {
  console.log(req.headers.authorization);

  if (!req.headers.authorization) {
    return Response(res, 401, 'Authorization Required!', {});
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    //let token = req.headers['x-access-token'];
    let token = req.headers.authorization.split(' ')[1];

    jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return Response(res, 401, 'Authorization Required!', {});
      }
      req.userId = decoded.id;
      console.log('m7');
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

      return Response(res, 403, 'Access to that resource is forbidden!', {});
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

      return Response(res, 403, 'Access to that resource is forbidden!', {});
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

      return Response(res, 403, 'Access to that resource is forbidden!', {});
    });
  });
};

//---------------------------------------
isInstructorOrStudent = (req, res, next) => {
  db.User.findByPk(req.userId).then((user) => {
    user.getRoles().then((roles) => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name_en === 'instructor') {
          next();
          return;
        }

        if (roles[i].name_en === 'student') {
          next();
          return;
        }
      }

      return Response(res, 403, 'Access to that resource is forbidden!', {});
    });
  });
};

//---------------------------------------
isStudent = (req, res, next) => {
  db.User.findByPk(req.userId).then((user) => {
    user.getRoles().then((roles) => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name_en === 'student') {
          next();
          return;
        }
      }

      return Response(res, 403, 'Access to that resource is forbidden!', {});
    });
  });
};

//---------------------------------------
isStudentorOrAdmin = (req, res, next) => {
  db.User.findByPk(req.userId).then((user) => {
    user.getRoles().then((roles) => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name_en === 'student') {
          next();
          return;
        }

        if (roles[i].name_en === 'admin') {
          next();
          return;
        }
      }

      return Response(res, 403, 'Access to that resource is forbidden!', {});
    });
  });
};

//---------------------------------------
isInstructorOrStudentorOrAdmin = (req, res, next) => {
  db.User.findByPk(req.userId).then((user) => {
    user.getRoles().then((roles) => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name_en === 'student') {
          next();
          return;
        }

        if (roles[i].name_en === 'admin') {
          next();
          return;
        }

        if (roles[i].name_en === 'instructor') {
          next();
          return;
        }
      }

      return Response(res, 403, 'Access to that resource is forbidden!', {});
    });
  });
};

//---------------------------------------
const authJwt = {
  VerifyToken: verifyToken,
  isAdmin: isAdmin,
  isInstructor: isInstructor,
  isInstructorOrAdmin: isInstructorOrAdmin,
  isStudent: isStudent,
  isStudentorOrAdmin: isStudentorOrAdmin,
  isInstructorOrStudentorOrAdmin: isInstructorOrStudentorOrAdmin,
  isInstructorOrStudent: isInstructorOrStudent,
};

module.exports = authJwt;
