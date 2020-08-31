const Joi = require('joi');
const { ValidateResponse } = require('../../../common/response.handler');
const { onErrorDeleteFiles } = require('../../../common/multerConfig');
const db = require('../..');

//----------------------------------------------------------
addAcademicYearValidation = (req, res, next) => {
  if (req.body.subjects) {
    //Parse subjects from the body
    var subjects = JSON.parse(req.body.subjects);
    req.body.subjects = subjects;
  }

  //One subjects Schema
  let subjectsSchema = Joi.object().keys({
    name_ar: Joi.string().min(3).max(30).required(),
    name_en: Joi.string().min(3).max(30).required(),
  });

  //AcademicYear Body Validation
  let schema = Joi.object({
    name_ar: Joi.string().min(3).max(30).required(),
    name_en: Joi.string().min(3).max(30).required(),
    departmentId: Joi.number().integer().required(),
    subjects: Joi.array().items(subjectsSchema),
  });

  console.log(req.body);

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
updateAcademicYearValidation = (req, res, next) => {
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
  let schema = Joi.object({
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
deleteAcademicYearValidation = (req, res, next) => {
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
listAcademicYearValidation = (req, res, next) => {
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
listAcademicYearByIdValidation = (req, res, next) => {
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
const AcademicYearValidation = {
  addAcademicYearValidation: addAcademicYearValidation,
  deleteAcademicYearValidation: deleteAcademicYearValidation,
  listAcademicYearValidation: listAcademicYearValidation,
  listAcademicYearByIdValidation: listAcademicYearByIdValidation,
  updateAcademicYearValidation: updateAcademicYearValidation,
};

module.exports = AcademicYearValidation;
