const { Sequelize } = require('../modules/index');
exports.Response = (res, statusCode, message, data) => {
  if (statusCode == '200')
    return res.status(statusCode).send({
      status: true,
      statusCode: statusCode,
      message: message,
      data: data,
    });
  else{
    //check id the error from ORM
    if (data.error instanceof Sequelize.UniqueConstraintError){
      return res.status(statusCode).send({
        status: false,
        statusCode: statusCode,
        message: data.error.errors[0].message,
        data: {path:data.error.errors[0].path},
      });
    }
    return res.status(statusCode).send({
      status: false,
      statusCode: statusCode,
      message: message,
      data: data,
    });
  }
};

exports.ValidateResponse = (res, message, data) => {
  let code = 422;
  return res.status(code).send({
    status: false,
    statusCode: code,
    message: message,
    data: data,
  });
};

/*
exports.Response = (statusCode, message, data) => {
  return { statusCode: statusCode, message: message, data: data };
};
*/

/**
 * 200 sucess
 * 400 bad request
 * 401 uauthorizted
 * 422 validation error
 * 403 no permission
 * 500 else
 */
