const Joi = require('joi');
const { ValidateResponse } = require('../../../common/response.handler');
const db = require('../..');

//----------------------------------------------------------
signinValidation = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
signupValidation = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    }),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required(),
    roles: Joi.string().min(1).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
updateUserValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().required(),
    });

    const { error } = schemaParam.validate(req.params);
    if (error) {
      return ValidateResponse(res, error.details, {});
    }
  }

  //Body Validation
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    }),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required(),
    roles: Joi.string().min(1).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details, {});
  }
  console.log("m6");
  return next();
};

//----------------------------------------------------------
listUserValidation = (req, res, next) => {
  //Body Validation
  const schema = Joi.object({
     
    
     
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return ValidateResponse(res, error.details, {});
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
      return ValidateResponse(res, error.details, {});
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
      return ValidateResponse(res, error.details, {});
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
