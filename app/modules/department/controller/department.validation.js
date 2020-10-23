const { Joi_messages } = require('../../../common/validation/joi.constants');
const Joi = require('joi');
const {
  ValidateResponse,
  ResponseConstants,
} = require('../../../common/response/response.handler');
const {
  onErrorDeleteFiles,
} = require('../../../common/attachmentsUpload/multerConfig');
const db = require('../..');

//----------------------------------------------------------
addDepartmentValidation = (req, res, next) => {
  if (req.body.academicyears) {
    //Parse academicyears from the body
    var academicyears = JSON.parse(req.body.academicyears);
    req.body.academicyears = academicyears;
  }

  //One subject Schema
  let subjectsSchema = Joi.object()
    .options({ abortEarly: false })
    .keys({
      subject_name_ar: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required()
        .messages(Joi_messages),
      subject_name_en: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required()
        .messages(Joi_messages),
    });

  //One academicyear Schema
  let academicyearsSchema = Joi.object()
    .options({ abortEarly: false })
    .keys({
      academic_name_ar: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required()
        .messages(Joi_messages),
      academic_name_en: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required()
        .messages(Joi_messages),
      subjects: Joi.array().items(subjectsSchema).messages(Joi_messages),
    });

  //Department Body Validation
  let schema = Joi.object({
    name_ar: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages(Joi_messages),
    name_en: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages(Joi_messages),
    facultyId: Joi.number().integer().required().messages(Joi_messages),
    academicyears: Joi.array()
      .items(academicyearsSchema)
      .messages(Joi_messages),
  }).options({ abortEarly: false });

  console.log(req.body);

  const { error } = schema.validate(req.body);
  console.log(error);
  if (error) {
    // onErrorDeleteFiles(req);
    return ValidateResponse(
      res,
      ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
        .JOI_VALIDATION_INVALID_DATA,
      error.details
    );
  }

  return next();
};

//----------------------------------------------------------
updateDepartmentValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().required().messages(Joi_messages),
    }).options({ abortEarly: false });

    const { error } = schemaParam.validate(req.params);
    console.log(error);
    if (error) {
      // onErrorDeleteFiles(req);
      return ValidateResponse(
        res,
        ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
          .JOI_VALIDATION_INVALID_URL_PARAM,
        error.details
      );
    }
  }

  //Body Validation
  let schema = Joi.object({
    name_ar: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages(Joi_messages),
    name_en: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages(Joi_messages),
    facultyId: Joi.any().messages(Joi_messages),
  }).options({ abortEarly: false });

  const { error } = schema.validate(req.body);
  console.log(error);
  if (error) {
    // onErrorDeleteFiles(req);
    return ValidateResponse(
      res,
      ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
        .JOI_VALIDATION_INVALID_DATA,
      error.details
    );
  }

  return next();
};

//----------------------------------------------------------
deleteDepartmentValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().min(1).required().messages(Joi_messages),
    }).options({ abortEarly: false });

    const { error } = schemaParam.validate(req.params);
    console.log(error);
    if (error) {
      // onErrorDeleteFiles(req);
      return ValidateResponse(
        res,
        ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
          .JOI_VALIDATION_INVALID_URL_PARAM,
        error.details
      );
    }
  }

  return next();
};

//----------------------------------------------------------
listDepartmentValidation = (req, res, next) => {
  //Body Validation
  const schema = Joi.object({
    doPagination: Joi.number()
      .integer()
      .valid(1, 0)
      .default(1)
      .messages(Joi_messages),
    numPerPage: Joi.number()
      .integer()
      .greater(0)
      .required()
      .messages(Joi_messages),
    page: Joi.number().integer().greater(0).required().messages(Joi_messages),
    searchKey: Joi.string().allow('', null).required().messages(Joi_messages),
    facultyId: Joi.any().messages(Joi_messages),
  }).options({ abortEarly: false });

  const { error } = schema.validate(req.query);
  console.log(error);
  if (error) {
    // onErrorDeleteFiles(req);
    return ValidateResponse(
      res,
      ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
        .JOI_VALIDATION_INVALID_QUERY_PARAM,
      error.details
    );
  }

  return next();
};

//----------------------------------------------------------
listDepartmentByIdValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().min(1).required().messages(Joi_messages),
    }).options({ abortEarly: false });

    const { error } = schemaParam.validate(req.params);
    console.log(error);
    if (error) {
      // onErrorDeleteFiles(req);
      return ValidateResponse(
        res,
        ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
          .JOI_VALIDATION_INVALID_URL_PARAM,
        error.details
      );
    }
  }

  return next();
};

//----------------------------------------------------------
const DepartmentValidation = {
  addDepartmentValidation: addDepartmentValidation,
  deleteDepartmentValidation: deleteDepartmentValidation,
  listDepartmentValidation: listDepartmentValidation,
  listDepartmentByIdValidation: listDepartmentByIdValidation,
  updateDepartmentValidation: updateDepartmentValidation,
};

module.exports = DepartmentValidation;
