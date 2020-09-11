const Joi = require('joi');
const helper = require('../../../common/helper');
const { ValidateResponse } = require('../../../common/response.handler');
const { onErrorDeleteFiles } = require('../../../common/multerConfig');

const db = require('../..');

//----------------------------------------------------------
signinValidation = async (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().trim().min(3).max(30).required(),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  //Email Domain Validation
  /*let isValidEmailResult = await helper
    .validateEmailDomain(req.body.username)
    .catch((err) => {
      console.log(err);
      return ValidateResponse(res, 'Email domain is not valid', {});
    });

  if (isValidEmailResult.isValidEmail) {
    return next();
  }*/

  return next();
};

//----------------------------------------------------------
signupValidation = async (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().trim().min(3).max(30).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required(),
    roles: Joi.string().trim().min(1).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  //Email Domain Validation
  /*let isValidEmailResult = await helper
    .validateEmailDomain(req.body.email)
    .catch((err) => {
      console.log(err);
      //onErrorDeleteFiles(req);
      return ValidateResponse(res, 'Email domain is not valid', {});
    });

  if (isValidEmailResult.isValidEmail) {
    return next();
  }*/

  return next();
};

//----------------------------------------------------------
updateUserValidation = async (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().required(),
    });

    const { error } = schemaParam.validate(req.params);
    if (error) {
      return ValidateResponse(res, error.details[0].message, {
        path: error.details[0].path[0],
      });
    }
  }

  //Body Validation
  const schema = Joi.object({
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required(),
    roles: Joi.string().trim().min(1).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {
      path: error.details[0].path[0],
    });
  }
  console.log('m6');

  //Email Domain Validation
  /*let isValidEmailResult = await helper
    .validateEmailDomain(req.body.email)
    .catch((err) => {
      console.log(err);
      //onErrorDeleteFiles(req);
      return ValidateResponse(res, 'email domain is not valid', {});
    });

  if (isValidEmailResult.isValidEmail) {
    return next();
  }*/

  return next();
};

//----------------------------------------------------------
listUserValidation = (req, res, next) => {
  //Body Validation
  const schema = Joi.object({});

  const { error } = schema.validate(req.query);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {
      path: error.details[0].path[0],
    });
  }

  return next();
};
//----------------------------------------------------------
listUserIdValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().required(),
    });

    const { error } = schemaParam.validate(req.params);
    if (error) {
      return ValidateResponse(res, error.details[0].message, {
        path: error.details[0].path[0],
      });
    }
  }
  return next();
};

//----------------------------------------------------------
deleteUserValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().required(),
    });

    const { error } = schemaParam.validate(req.params);
    if (error) {
      return ValidateResponse(res, error.details[0].message, {
        path: error.details[0].path[0],
      });
    }
  }

  return next();
};
//----------------------------------------------------------
verifyEmailValidation = async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().trim().email().required(),
    code: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  //Email Domain Validation
  /*let isValidEmailResult = await helper
    .validateEmailDomain(req.body.email)
    .catch((err) => {
      console.log(err);
      //onErrorDeleteFiles(req);
      return ValidateResponse(res, 'Email domain is not valid', {});
    });

  if (isValidEmailResult.isValidEmail) {
    return next();
  }*/

  return next();
};

//----------------------------------------------------------
changePasswordInsideValidation = async (req, res, next) => {
  const schema = Joi.object({
    oldPassword: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required(),
    newPassword: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required(),
    newPasswordRepeat: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .valid(Joi.ref('newPassword'))
      .required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
const UserValidation = {
  signinValidation: signinValidation,
  signupValidation: signupValidation,
  updateUserValidation: updateUserValidation,
  listUserValidation: listUserValidation,
  listUserIdValidation: listUserIdValidation,
  deleteUserValidation: deleteUserValidation,
  changePasswordInsideValidation: changePasswordInsideValidation,
  verifyEmailValidation: verifyEmailValidation,
};

module.exports = UserValidation;
