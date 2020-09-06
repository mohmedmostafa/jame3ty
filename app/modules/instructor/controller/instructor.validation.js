const Joi = require('joi');
const helper = require('../../../common/helper');
const { ValidateResponse } = require('../../../common/response.handler');
const { onErrorDeleteFiles } = require('../../../common/multerConfig');

const db = require('../..');

//----------------------------------------------------------
addInstructorValidation = async (req, res, next) => {
  //Body Validation
  const schema = Joi.object({
    name_ar: Joi.string().trim().min(3).max(30).required(),
    name_en: Joi.string().trim().min(3).max(30),
    bio: Joi.string().trim().min(5).max(30),
    mobile: Joi.string().trim().alphanum().required(),
    email: Joi.string().trim().email({ minDomainSegments: 3 }).required(),
    //username: Joi.string().trim().min(3).max(30).required(),
    password: Joi.string().min(5).max(30).required(),
    'g-recaptcha-response': Joi.any(),
    img: Joi.any(),
    cv: Joi.any(),
  });
  console.log('m5');
  const { error } = schema.validate(req.body);
  if (error) {
    onErrorDeleteFiles(req);
    return ValidateResponse(res, error.details[0].message, {
      path: error.details[0].path[0],
    });
  }
  console.log('m6');

  //Email Domain Validation
  let isValidEmailResult = await helper
    .validateEmailDomain(req.body.email)
    .catch((err) => {
      console.log(err);
      onErrorDeleteFiles(req);
      return ValidateResponse(res, 'email domain is not valid', {});
    });

  if (isValidEmailResult.isValidEmail) {
    return next();
  }
};

//----------------------------------------------------------
updateInstructorValidation = async (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().required(),
    });

    const { error } = schemaParam.validate(req.params);
    if (error) {
      onErrorDeleteFiles(req);
      return ValidateResponse(res, error.details[0].message, {
        path: error.details[0].path[0],
      });
    }
  }

  //Body Validation
  const schema = Joi.object({
    name_ar: Joi.string().trim().min(3).max(30).required(),
    name_en: Joi.string().trim().min(3).max(30),
    bio: Joi.string().trim().min(5).max(30),
    mobile: Joi.string().trim().alphanum().required(),
    email: Joi.string().trim().email({ minDomainSegments: 3 }).required(),
    //username: Joi.string().trim().min(3).max(30).required(),
    password: Joi.string().min(5).max(30).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    onErrorDeleteFiles(req);
    return ValidateResponse(res, error.details[0].message, {});
  }
  console.log('m6');

  //Email Domain Validation
  let isValidEmailResult = await helper
    .validateEmailDomain(req.body.email)
    .catch((err) => {
      console.log(err);
      onErrorDeleteFiles(req);
      return ValidateResponse(res, 'Email domain is not valid', {});
    });

  if (isValidEmailResult.isValidEmail) {
    return next();
  }
};

//----------------------------------------------------------
listInstructorValidation = (req, res, next) => {
  //Body Validation
  const schema = Joi.object({
    doPagination: Joi.number().integer().valid(1, 0).default(1),
    numPerPage: Joi.number().integer().greater(0).required(),
    page: Joi.number().integer().greater(0).required(),
    name_ar: Joi.string().trim().min(3).max(30),
    name_en: Joi.string().trim().min(3).max(30),
    mobile: Joi.string().trim().alphanum(),
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};
//----------------------------------------------------------
listInstructorIdValidation = (req, res, next) => {
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
  return next();
};

//----------------------------------------------------------
deleteInstructorValidation = (req, res, next) => {
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
