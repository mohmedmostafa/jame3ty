const Joi = require('joi');
const {
  ValidateResponse,
  ResponseConstants,
} = require('../../../common/response/response.handler');
const { Joi_messages } = require('../../../common/validation/joi.constants');
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

  //AcademicYear Body Validation
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
    departmentId: Joi.number().integer().required().messages(Joi_messages),
    subjects: Joi.array().items(subjectsSchema).messages(Joi_messages),
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
updateAcademicYearValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().required().messages(Joi_messages),
    }).options({ abortEarly: false });

    const { error } = schemaParam.validate(req.params);
    console.log(error);
    if (error) {
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
    departmentId: Joi.number().integer().messages(Joi_messages),
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
deleteAcademicYearValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().min(1).required().messages(Joi_messages),
    }).options({ abortEarly: false });

    const { error } = schemaParam.validate(req.params);
    console.log(error);
    if (error) {
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
listAcademicYearValidation = (req, res, next) => {
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
    DepartmentId: Joi.any().messages(Joi_messages),
  }).options({ abortEarly: false });

  const { error } = schema.validate(req.query);
  console.log(error);
  if (error) {
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
listAcademicYearByIdValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().min(1).required().messages(Joi_messages),
    }).options({ abortEarly: false });

    const { error } = schemaParam.validate(req.params);
    console.log(error);
    if (error) {
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
const AcademicYearValidation = {
  addAcademicYearValidation: addAcademicYearValidation,
  deleteAcademicYearValidation: deleteAcademicYearValidation,
  listAcademicYearValidation: listAcademicYearValidation,
  listAcademicYearByIdValidation: listAcademicYearByIdValidation,
  updateAcademicYearValidation: updateAcademicYearValidation,
};

module.exports = AcademicYearValidation;
