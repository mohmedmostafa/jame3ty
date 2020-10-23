const Joi = require('joi');
const { Joi_messages } = require('../../../common/validation/joi.constants');

const {
  ValidateResponse,
  ResponseConstants,
} = require('../../../common/response/response.handler');
const db = require('../..');

//----------------------------------------------------------
addUniversityValidation = (req, res, next) => {
  if (req.body.faculties) {
    //Parse faculties from the body
    var faculties = JSON.parse(req.body.faculties);
    req.body.faculties = faculties;
  }

  //One faculty Schema
  let facultySchema = Joi.object()
    .options({ abortEarly: false })
    .keys({
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
    faculties: Joi.array().items(facultySchema).messages(Joi_messages),
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
updateUniversityValidation = (req, res, next) => {
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
  const schema = Joi.object({
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
listUniversityByIdValidation = (req, res, next) => {
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
listUniversityValidation = (req, res, next) => {
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
deleteUniversityValidation = (req, res, next) => {
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
