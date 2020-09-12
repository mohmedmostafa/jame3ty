const {
  Response,
  ValidateResponse,
} = require('../common/response/response.handler');
const { ResponseConstants } = require('./response.constants');

const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const db = require('../../app/modules');
const { JWT_SECRET_KEY } = require('../../app/config/env.config');

//---------------------------------------
verifyToken = (req, res, next) => {
  console.log(req.headers.authorization);

  if (!req.headers.authorization) {
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.code,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type
        .BEARER_TOKEN_NOT_FOUND,
      {}
    );
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    //let token = req.headers['x-access-token'];
    let token = req.headers.authorization.split(' ')[1];

    jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return Response(
          res,
          ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.code,
          ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type
            .BEARER_TOKEN_INCORRECT,
          {}
        );
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

      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.code,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.type.ACCESS_DENIED,
        {}
      );
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

      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.code,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.type.ACCESS_DENIED,
        {}
      );
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

      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.code,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.type.ACCESS_DENIED,
        {}
      );
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

      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.code,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.type.ACCESS_DENIED,
        {}
      );
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

      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.code,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.type.ACCESS_DENIED,
        {}
      );
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

      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.code,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.type.ACCESS_DENIED,
        {}
      );
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

      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.code,
        ResponseConstants.HTTP_STATUS_CODES.FORBIDDEN.type.ACCESS_DENIED,
        {}
      );
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
