const Joi = require('joi');
const {
  ValidateResponse,
  ResponseConstants,
} = require('../../../common/response/response.handler');
const { joi_messages } = require('../../../common/validation/joi.constants');
const {
  onErrorDeleteFiles,
} = require('../../../common/attachmentsUpload/multerConfig');
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
    name_ar: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .required()
      .messages(joi_messages),
    name_en: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .required()
      .messages(joi_messages),
  });

  //AcademicYear Body Validation
  let schema = Joi.object({
    name_ar: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .required()
      .messages(joi_messages),
    name_en: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .required()
      .messages(joi_messages),
    departmentId: Joi.number().integer().required().messages(joi_messages),
    subjects: Joi.array().items(subjectsSchema).messages(joi_messages),
  });

  console.log(req.body);

  const { error } = schema.validate(req.body);
  console.log(error);
  if (error) {
    return ValidateResponse(
      res,
      ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
        .JOI_VALIDATION_BAD_DATA,
      error.details[0].message
    );
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
      return ValidateResponse(res, error.details[0].message, {
        path: error.details[0].path[0],
      });
    }
  }

  //Body Validation
  let schema = Joi.object({
    name_ar: Joi.string().trim().min(3).max(30).required(),
    name_en: Joi.string().trim().min(3).max(30).required(),
    departmentId: Joi.number().integer(),
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
      return ValidateResponse(res, error.details[0].message, {
        path: error.details[0].path[0],
      });
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
    DepartmentId: Joi.any(),
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
      return ValidateResponse(res, error.details[0].message, {
        path: error.details[0].path[0],
      });
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
