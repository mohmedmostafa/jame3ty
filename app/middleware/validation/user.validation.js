const Joi = require('joi');
const { ValidateResponse } = require('../../common/response.handler');
const db = require('../../models');

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
    return ValidateResponse(res, error.details, {});
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
    return ValidateResponse(res, error.details, {});
  }

  return next();
};

//----------------------------------------------------------
addUniversityValidation = (req, res, next) => {
  const schema = Joi.object({
    name_ar: Joi.string().alphanum().min(7).max(30).required(),
    name_en: Joi.string().alphanum().min(7).max(30).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details, {});
  }

  return next();
};

//----------------------------------------------------------
const UserValidation = {
  signinValidation: signinValidation,
  signupValidation: signupValidation,
};

module.exports = UserValidation;
