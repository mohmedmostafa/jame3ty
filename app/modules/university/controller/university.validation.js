const Joi = require('joi');
const { ValidateResponse } = require('../../../common/response.handler');
const db = require('../..');

//----------------------------------------------------------
addUniversityValidation = (req, res, next) => {
  if (req.body.faculties) {
    //Parse faculties from the body
    var faculties = JSON.parse(req.body.faculties);
    req.body.faculties = faculties;
  }

  //One faculty Schema
  let facultySchema = Joi.object().keys({
    name_ar: Joi.string().min(3).max(30).required(),
    name_en: Joi.string().min(3).max(30).required(),
  });

  //AcademicYear Body Validation
  let schema = Joi.object({
    name_ar: Joi.string().min(3).max(30).required(),
    name_en: Joi.string().min(3).max(30).required(),
    faculties: Joi.array().items(facultySchema),
  });

  console.log(req.body);

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
updateUniversityValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().required(),
    });

    const { error } = schemaParam.validate(req.params);
    if (error) {
      return ValidateResponse(res, error.details[0].message, {});
    }
  }

  //Body Validation
  const schema = Joi.object({
    name_ar: Joi.string().min(3).max(30).required(),
    name_en: Joi.string().min(3).max(30).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
listUniversityByIdValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().min(1).required(),
    });

    const { error } = schemaParam.validate(req.params);
    if (error) {
      return ValidateResponse(res, error.details[0].message, {});
    }
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
    searchKey: Joi.string().allow('', null).required(),
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
deleteUniversityValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().required(),
    });

    const { error } = schemaParam.validate(req.params);
    if (error) {
      return ValidateResponse(res, error.details[0].message, {});
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
  listUniversityByIdValidation: listUniversityByIdValidation,
};

module.exports = UniversityValidation;
