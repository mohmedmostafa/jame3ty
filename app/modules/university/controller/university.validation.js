const Joi = require('joi');
const { ValidateResponse } = require('../../../common/response.handler');
const db = require('../..');

//----------------------------------------------------------
addUniversityValidation = (req, res, next) => {
  //Body Validation
  const schema = Joi.object({
    name_ar: Joi.string().min(5).max(30).required(),
    name_en: Joi.string().min(5).max(30).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details, {});
  }

  return next();
};

//----------------------------------------------------------
updateUniversityValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().min(1).max(30).required(),
    });

    const { error } = schemaParam.validate(req.params);
    if (error) {
      return ValidateResponse(res, error.details, {});
    }
  }

  //Body Validation
  const schema = Joi.object({
    name_ar: Joi.string().min(5).max(30).required(),
    name_en: Joi.string().min(5).max(30).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details, {});
  }

  return next();
};

//----------------------------------------------------------
listUniversityValidation = (req, res, next) => {
  //Body Validation
  const schema = Joi.object({
    doPagination: Joi.number().integer().valid(1, 0).default(1),
    numPerPage: Joi.number().integer().greater(0).required(),
    page: Joi.number().integer().greater(0).required(),
    name_ar: Joi.string().min(0).max(30).required(),
    name_en: Joi.string().min(0).max(30).required(),
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return ValidateResponse(res, error.details, {});
  }

  return next();
};

//----------------------------------------------------------
deleteUniversityValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().min(1).max(30).required(),
    });

    const { error } = schemaParam.validate(req.params);
    if (error) {
      return ValidateResponse(res, error.details, {});
    }
  }

  return next();
};

//----------------------------------------------------------
const UniversityValidation = {
  addUniversityValidation: addUniversityValidation,
  updateUniversityValidation: updateUniversityValidation,
  listUniversityValidation: listUniversityValidation,
  deleteUniversityValidation: deleteUniversityValidation,
};

module.exports = UniversityValidation;
