const Joi = require('joi');
const { Joi_messages } = require('../../../common/validation/joi.constants');

const helper = require('../../../common/helper');
const {
  ValidateResponse,
  ResponseConstants,
} = require('../../../common/response/response.handler');
const {
  onErrorDeleteFiles,
} = require('../../../common/attachmentsUpload/multerConfig');

const db = require('../..');

//----------------------------------------------------------
signinValidation = async (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .required()
      .messages(Joi_messages),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
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

  //Email Domain Validation
  /*let isValidEmailResult = await validateEmailDomain(req.body.email).catch(
    (err) => {
      console.log(err);
      return ValidateResponse(res, 'Email domain is not valid', {});
    });

  if (isValidEmailResult.isValidEmail) {
    return next();
  }*/

  return next();
};

//----------------------------------------------------------
signupValidation = async (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string()
      .alphanum()
      .trim()
      .min(3)
      .max(30)
      .required()
      .messages(Joi_messages),
    email: Joi.string().trim().email().required().messages(Joi_messages),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required()
      .messages(Joi_messages),
    roles: Joi.string().trim().min(1).required().messages(Joi_messages),
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

  //Email Domain Validation
  /*let isValidEmailResult = await validateEmailDomain(req.body.email).catch(
    (err) => {
      console.log(err);
      //onErrorDeleteFiles(req);
      return ValidateResponse(res, 'Email domain is not valid', {});
    });

  if (isValidEmailResult.isValidEmail) {
    return next();
  }*/

  return next();
};

//----------------------------------------------------------
updateUserValidation = async (req, res, next) => {
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
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required()
      .messages(Joi_messages),
    roles: Joi.string().trim().min(1).required().messages(Joi_messages),
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

  //Email Domain Validation
  /*let isValidEmailResult = await validateEmailDomain(req.body.email).catch(
    (err) => {
      console.log(err);
      //onErrorDeleteFiles(req);
      return ValidateResponse(res, 'email domain is not valid', {});
    });

  if (isValidEmailResult.isValidEmail) {
    return next();
  }*/

  return next();
};

//----------------------------------------------------------
listUserValidation = (req, res, next) => {
  //Body Validation
  const schema = Joi.object({}).options({ abortEarly: false });

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
listUserIdValidation = (req, res, next) => {
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
deleteUserValidation = (req, res, next) => {
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
verifyEmailValidation = async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().trim().email().required().messages(Joi_messages),
    code: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
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

  //Email Domain Validation
  /*let isValidEmailResult = await validateEmailDomain(req.body.email).catch(
    (err) => {
      console.log(err);
      //onErrorDeleteFiles(req);
      return ValidateResponse(res, 'Email domain is not valid', {});
    });

  if (isValidEmailResult.isValidEmail) {
    return next();
  }*/

  return next();
};

//----------------------------------------------------------
sendVerificationCodeValidation = async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().trim().email().required().messages(Joi_messages),
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
changePasswordInsideValidation = async (req, res, next) => {
  const schema = Joi.object({
    oldPassword: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required()
      .messages(Joi_messages),
    newPassword: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required()
      .messages(Joi_messages),
    newPasswordRepeat: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .valid(Joi.ref('newPassword'))
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
forgotPasswordValidation = async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().trim().email().required().messages(Joi_messages),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required()
      .messages(Joi_messages),
    code: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
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
const UserValidation = {
  signinValidation: signinValidation,
  signupValidation: signupValidation,
  updateUserValidation: updateUserValidation,
  listUserValidation: listUserValidation,
  listUserIdValidation: listUserIdValidation,
  deleteUserValidation: deleteUserValidation,
  changePasswordInsideValidation: changePasswordInsideValidation,
  verifyEmailValidation: verifyEmailValidation,
  sendVerificationCodeValidation: sendVerificationCodeValidation,
  forgotPasswordValidation: forgotPasswordValidation,
};

module.exports = UserValidation;
