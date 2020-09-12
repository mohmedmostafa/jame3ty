const { Sequelize } = require('../../modules/index');
const { ResponseConstants } = require('./response.constants');
exports.Response = (res, statusCode, message, data) => {
  if (statusCode == ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code)
    return res.status(statusCode).send({
      status: true,
      statusCode: statusCode,
      message: message,
      data: data,
    });
  else {
    //check id the error from ORM
    if (data.error instanceof Sequelize.UniqueConstraintError) {
      return res.status(statusCode).send({
        status: false,
        statusCode: statusCode,
        message: data.error.errors[0].message,
        data: { path: data.error.errors[0].path },
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
  const code = ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.code;

  const response = {
    status: false,
    statusCode: code,
    message: message,
    data: data,
  };

  return res.status(code).send(response);
};

/*
exports.Response = (statusCode, message, data) => {
  return { statusCode: statusCode, message: message, data: data };
};
*/
