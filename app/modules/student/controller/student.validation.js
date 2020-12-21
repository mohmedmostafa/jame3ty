const Joi = require('joi');
const { Joi_messages } = require('../../../common/validation/joi.constants');

const {
  ValidateResponse,
  ResponseConstants,
} = require('../../../common/response/response.handler');
const {
  onErrorDeleteFiles,
} = require('../../../common/attachmentsUpload/multerConfig');
const helper = require('../../../common/helper');

const db = require('../../');

//----------------------------------------------------------
addStudentValidation = async (req, res, next) => {
  //Body Validation
  let schema = Joi.object({
    name: Joi.string().trim().min(1).max(100).required().messages(Joi_messages),
    mobile: Joi.string().trim().alphanum().required().messages(Joi_messages),
    email: Joi.string().trim().email().required().messages(Joi_messages),
    academicYearId: Joi.number().integer().required().messages(Joi_messages),
    username: Joi.string()
      .alphanum()
      .trim()
      .min(3)
      .max(30)
      .required()
      .messages(Joi_messages),
    password: Joi.string()
      .regex(RegExp('^\\S+$'))
      .min(5)
      .max(30)
      .required()
      .messages(Joi_messages),
    'g-recaptcha-response': Joi.any().messages(Joi_messages),
  }).options({ abortEarly: false });

  const { error } = schema.validate(req.body);
  console.log(error);
  if (error) {
    onErrorDeleteFiles(req);
    return ValidateResponse(
      res,
      ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
        .JOI_VALIDATION_INVALID_DATA,
      error.details
    );
  }

  //Email Domain Validation
  /*let isValidEmailResult = await validateEmailDomain(req.body.email).catch(
    (err) => {
      console.log(err);
      onErrorDeleteFiles(req);
      return ValidateResponse(res, 'Email domain is not valid', {});
    });

  if (isValidEmailResult.isValidEmail) {
    return next();
  }*/

  return next();
};

//----------------------------------------------------------
updateStudentValidation = async (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().required().messages(Joi_messages),
    }).options({ abortEarly: false });

    const { error } = schemaParam.validate(req.params);
    console.log(error);
    if (error) {
      onErrorDeleteFiles(req);
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
    name: Joi.string().trim().min(1).max(100).required().messages(Joi_messages),
    mobile: Joi.string().trim().alphanum().required().messages(Joi_messages),
    academicYearId: Joi.number().integer().required().messages(Joi_messages),
    password: Joi.string()
      .regex(RegExp('^\\S+$'))
      .min(5)
      .max(30)
      .required()
      .messages(Joi_messages),
    'g-recaptcha-response': Joi.any().messages(Joi_messages),
  }).options({ abortEarly: false });

  const { error } = schema.validate(req.body);
  console.log(error);
  if (error) {
    onErrorDeleteFiles(req);
    return ValidateResponse(
      res,
      ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
        .JOI_VALIDATION_INVALID_DATA,
      error.details
    );
  }

  //Email Domain Validation
  /*let isValidEmailResult = await validateEmailDomain(req.body.email).catch(
    (err) => {
      console.log(err);
      onErrorDeleteFiles(req);
      return ValidateResponse(res, 'email domain is not valid', {});
    });

  if (isValidEmailResult.isValidEmail) {
    return next();
  }*/

  return next();
};

//----------------------------------------------------------
deleteStudentValidation = (req, res, next) => {
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
listStudentValidation = (req, res, next) => {
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
listStudentByIdValidation = (req, res, next) => {
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
listStudentByUserIdValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      userId: Joi.number().integer().min(1).required().messages(Joi_messages),
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
const StudentValidation = {
  addStudentValidation: addStudentValidation,
  deleteStudentValidation: deleteStudentValidation,
  listStudentValidation: listStudentValidation,
  listStudentByIdValidation: listStudentByIdValidation,
  updateStudentValidation: updateStudentValidation,
  listStudentByUserIdValidation: listStudentByUserIdValidation,
};

module.exports = StudentValidation;
