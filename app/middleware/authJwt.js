const {
  Response,
  ValidateResponse,
  ResponseConstants,
} = require('../common/response/response.handler');

const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const db = require('../../app/modules');
const { JWT_SECRET_KEY } = require('../../app/config/env.config');

//---------------------------------------
verifyToken = (req, res, next) => {
  console.log(req.headers.authorization);

  //If no auth in headers
  if (!req.headers.authorization) {
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.code,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type
        .AUTHORIZATION_NOT_FOUND,
      ResponseConstants.ERROR_MESSAGES.AUTHORIZATION_NOT_FOUND
    );
  }

  //If token type is not Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] != 'Bearer'
  ) {
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.code,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type.TOKEN_TYPE_INVALID,
      ResponseConstants.ERROR_MESSAGES.TOKEN_TYPE_INVALID
    );
  }

  //If Bearer token type is found but with no token value
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[1].length === 0
  ) {
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.code,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type.TOKEN_NOT_FOUND,
      ResponseConstants.ERROR_MESSAGES.TOKEN_NOT_FOUND
    );
  }

  //If token value is exists but not valid or not correct
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
          ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type.TOKEN_INVALID,
          ResponseConstants.ERROR_MESSAGES.TOKEN_INVALID
        );
      }

      console.log(decoded);
      req.userId = decoded.id;
      req.userRoles = decoded.roles;

      next();
      return;
    });
  }
};

//---------------------------------------
isAdmin = (req, res, next) => {
  if (req.userId) {
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
          ResponseConstants.ERROR_MESSAGES.ACCESS_DENIED
        );
      });
    });
  } else {
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.code,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type.SIGNIN_REQUIRED,
      ResponseConstants.ERROR_MESSAGES.SIGNIN_REQUIRED
    );
  }
};

//---------------------------------------
isInstructor = (req, res, next) => {
  if (req.userId) {
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
          ResponseConstants.ERROR_MESSAGES.ACCESS_DENIED
        );
      });
    });
  } else {
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.code,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type.SIGNIN_REQUIRED,
      ResponseConstants.ERROR_MESSAGES.SIGNIN_REQUIRED
    );
  }
};

//---------------------------------------
isInstructorOrAdmin = (req, res, next) => {
  if (req.userId) {
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
          ResponseConstants.ERROR_MESSAGES.ACCESS_DENIED
        );
      });
    });
  } else {
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.code,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type.SIGNIN_REQUIRED,
      ResponseConstants.ERROR_MESSAGES.SIGNIN_REQUIRED
    );
  }
};

//---------------------------------------
isInstructorOrStudent = (req, res, next) => {
  if (req.userId) {
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
          ResponseConstants.ERROR_MESSAGES.ACCESS_DENIED
        );
      });
    });
  } else {
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.code,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type.SIGNIN_REQUIRED,
      ResponseConstants.ERROR_MESSAGES.SIGNIN_REQUIRED
    );
  }
};

//---------------------------------------
isStudent = (req, res, next) => {
  if (req.userId) {
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
          ResponseConstants.ERROR_MESSAGES.ACCESS_DENIED
        );
      });
    });
  } else {
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.code,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type.SIGNIN_REQUIRED,
      ResponseConstants.ERROR_MESSAGES.SIGNIN_REQUIRED
    );
  }
};

//---------------------------------------
isStudentorOrAdmin = (req, res, next) => {
  if (req.userId) {
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
          ResponseConstants.ERROR_MESSAGES.ACCESS_DENIED
        );
      });
    });
  } else {
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.code,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type.SIGNIN_REQUIRED,
      ResponseConstants.ERROR_MESSAGES.SIGNIN_REQUIRED
    );
  }
};

//---------------------------------------
isInstructorOrStudentorOrAdmin = (req, res, next) => {
  if (req.userId) {
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
          ResponseConstants.ERROR_MESSAGES.ACCESS_DENIED
        );
      });
    });
  } else {
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.code,
      ResponseConstants.HTTP_STATUS_CODES.UNAUTHORIZED.type.SIGNIN_REQUIRED,
      ResponseConstants.ERROR_MESSAGES.SIGNIN_REQUIRED
    );
  }
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
