const Joi = require('joi');
const { validateEmailDomain } = require('../../../common/email');
const { Joi_messages } = require('../../../common/validation/joi.constants');
const {
  ValidateResponse,
  ResponseConstants,
} = require('../../../common/response/response.handler');
const {
  onErrorDeleteFiles,
} = require('../../../common/attachmentsUpload/multerConfig');

const db = require('../..');

//----------------------------------------------------------
addInstructorValidation = async (req, res, next) => {
  //Body Validation
  const schema = Joi.object({
    name_ar: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .required()
      .messages(Joi_messages),
    name_en: Joi.string().trim().min(3).max(30).messages(Joi_messages),
    bio: Joi.string().trim().min(5).max(30).messages(Joi_messages),
    mobile: Joi.string().trim().alphanum().required().messages(Joi_messages),
    email: Joi.string().trim().email().required().messages(Joi_messages),
    username: Joi.string()
      .alphanum()
      .trim()
      .min(3)
      .max(30)
      .required()
      .messages(Joi_messages),
    password: Joi.string().min(5).max(30).required().messages(Joi_messages),
    'g-recaptcha-response': Joi.any().messages(Joi_messages),
    img: Joi.any().messages(Joi_messages),
    cv: Joi.any().messages(Joi_messages),
    // isVerified: Joi.number().integer().valid(1, 0).default(0).messages(Joi_messages),
  })
    .options({ abortEarly: false })
    .unknown(true);

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
updateInstructorValidation = async (req, res, next) => {
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
  const schema = Joi.object({
    name_ar: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .required()
      .messages(Joi_messages),
    name_en: Joi.string().trim().min(3).max(30).messages(Joi_messages),
    bio: Joi.string().trim().min(5).max(30).messages(Joi_messages),
    mobile: Joi.string().trim().alphanum().required().messages(Joi_messages),
    //password: Joi.string().min(5).max(30).required().messages(Joi_messages),
  })
    .options({ abortEarly: false })
    .unknown(true);

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
    }
  );

  if (isValidEmailResult.isValidEmail) {
    return next();
  }*/

  return next();
};

//----------------------------------------------------------
listInstructorValidation = (req, res, next) => {
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
    name_ar: Joi.string().trim().min(3).max(30).messages(Joi_messages),
    name_en: Joi.string().trim().min(3).max(30).messages(Joi_messages),
    mobile: Joi.string().trim().alphanum().messages(Joi_messages),
    searchKey: Joi.any().messages(Joi_messages),
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
listInstructorIdValidation = (req, res, next) => {
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
deleteInstructorValidation = (req, res, next) => {
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
const InstructorValidation = {
  addInstructorValidation: addInstructorValidation,
  updateInstructorValidation: updateInstructorValidation,
  listInstructorValidation: listInstructorValidation,
  listInstructorIdValidation: listInstructorIdValidation,
  deleteInstructorValidation: deleteInstructorValidation,
};

module.exports = InstructorValidation;
