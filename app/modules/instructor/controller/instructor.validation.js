const Joi = require('joi');
const { ValidateResponse } = require('../../../common/response.handler');
const db = require('../..');

//----------------------------------------------------------
addInstructorValidation = (req, res, next) => {
  //Body Validation
  const schema = Joi.object({
    name_ar: Joi.string().min(3).max(30).required(),
    name_en: Joi.string().min(3).max(30).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details, {});
  }

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
    name_en: Joi.string().min(3).max(30).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details, {});
  }

  return next();
};

//----------------------------------------------------------
listInstructorValidation = (req, res, next) => {
  //Body Validation
  const schema = Joi.object({
    doPagination: Joi.number().integer().valid(1, 0).default(1),
    numPerPage: Joi.number().integer().greater(0).required(),
    page: Joi.number().integer().greater(0).required(),
    name_ar: Joi.any().required(),
    name_en: Joi.any().required(),
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return ValidateResponse(res, error.details, {});
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
  deleteInstructorValidation: deleteInstructorValidation,
};

module.exports = InstructorValidation;
