const Joi = require('joi');
const { ValidateResponse } = require('../../../common/response.handler');
const db = require('../..');

//----------------------------------------------------------
addInstructorValidation = (req, res, next) => {
  //Body Validation
  const schema = Joi.object({
    name_ar: Joi.string().min(3).max(30).required(),
    name_en: Joi.string().min(3).max(30),
    bio: Joi.string().min(5).max(30),
    mobile: Joi.string().alphanum().required(),
    email: Joi.string().email().required(),
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(5).max(30).required(),
    "g-recaptcha-response": Joi.any(),
    img: Joi.any(),
    cv: Joi.any(),
  });
  console.log("m5");
  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details, {});
  }
  console.log("m6");
  return next();
};

//----------------------------------------------------------
updateInstructorValidation = (req, res, next) => {
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
    name_ar: Joi.string().min(3).max(30).required(),
    name_en: Joi.string().min(3).max(30),
    bio: Joi.string().min(5).max(30),
    mobile: Joi.string().alphanum().required(),
    email: Joi.string().email().required(),
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(5).max(30).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details, {});
  }
  console.log("m6");
  return next();
};

//----------------------------------------------------------
listInstructorValidation = (req, res, next) => {
  //Body Validation
  const schema = Joi.object({
    doPagination: Joi.number().integer().valid(1, 0).default(1),
    numPerPage: Joi.number().integer().greater(0).required(),
    page: Joi.number().integer().greater(0).required(),
    name_ar: Joi.string().min(3).max(30),
    name_en: Joi.string().min(3).max(30),
    mobile: Joi.string().alphanum(),
     
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return ValidateResponse(res, error.details, {});
  }

  return next();
};
//----------------------------------------------------------
listInstructorIdValidation = (req, res, next) => {
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
deleteInstructorValidation = (req, res, next) => {
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
const InstructorValidation = {
  addInstructorValidation: addInstructorValidation,
  updateInstructorValidation: updateInstructorValidation,
  listInstructorValidation: listInstructorValidation,
  listInstructorIdValidation: listInstructorIdValidation,
  deleteInstructorValidation: deleteInstructorValidation,
};

module.exports = InstructorValidation;
