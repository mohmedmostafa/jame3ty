const Joi = require('joi');
const helper = require('../../../common/helper');
const { ValidateResponse } = require('../../../common/response.handler');
const { onErrorDeleteFiles } = require('../../../common/multerConfig');

const db = require('../..');

//----------------------------------------------------------
signinValidation = async (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().trim().email({ minDomainSegments: 3 }).required(),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  //Email Domain Validation
  let isValidEmailResult = await helper
    .validateEmailDomain(req.body.username)
    .catch((err) => {
      console.log(err);
      return ValidateResponse(res, 'Email domain is not valid', {});
    });

  if (isValidEmailResult.isValidEmail) {
    return next();
  }
};

//----------------------------------------------------------
signupValidation = async (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().trim().alphanum().min(3).max(30).required(),
    email: Joi.string().trim().email({ minDomainSegments: 3 }),
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
  let isValidEmailResult = await helper
    .validateEmailDomain(req.body.email)
    .catch((err) => {
      console.log(err);
      //onErrorDeleteFiles(req);
      return ValidateResponse(res, 'email domain is not valid', {});
    });

  if (isValidEmailResult.isValidEmail) {
    return next();
  }
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
    username: Joi.string().trim().alphanum().min(3).max(30).required(),
    email: Joi.string().trim().email({ minDomainSegments: 3 }),
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
  let isValidEmailResult = await helper
    .validateEmailDomain(req.body.email)
    .catch((err) => {
      console.log(err);
      //onErrorDeleteFiles(req);
      return ValidateResponse(res, 'email domain is not valid', {});
    });

  if (isValidEmailResult.isValidEmail) {
    return next();
  }
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
const UserValidation = {
  signinValidation: signinValidation,
  signupValidation: signupValidation,
  updateUserValidation: updateUserValidation,
  listUserValidation: listUserValidation,
  listUserIdValidation: listUserIdValidation,
  deleteUserValidation: deleteUserValidation,
};

module.exports = UserValidation;
