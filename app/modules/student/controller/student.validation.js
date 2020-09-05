const Joi = require('joi');
const { ValidateResponse } = require('../../../common/response.handler');
const { onErrorDeleteFiles } = require('../../../common/multerConfig');
const db = require('../../');

//----------------------------------------------------------
addStudentValidation = (req, res, next) => {
  //Body Validation
  let schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    mobile: Joi.string().alphanum().required(),
    email: Joi.string().email().required(),
    academicYearId: Joi.number().integer().required(),
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(5).max(30).required(),
    'g-recaptcha-response': Joi.any(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    onErrorDeleteFiles(req);
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
updateStudentValidation = (req, res, next) => {
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
    name: Joi.string().min(3).max(30).required(),
    mobile: Joi.string().alphanum().required(),
    email: Joi.string().email().required(),
    academicYearId: Joi.number().integer().required(),
    password: Joi.string().min(5).max(30).required(),
    'g-recaptcha-response': Joi.any(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
deleteStudentValidation = (req, res, next) => {
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
listStudentValidation = (req, res, next) => {
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
listStudentByIdValidation = (req, res, next) => {
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
listStudentByUserIdValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      userId: Joi.number().integer().min(1).required(),
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
const StudentValidation = {
  addStudentValidation: addStudentValidation,
  deleteStudentValidation: deleteStudentValidation,
  listStudentValidation: listStudentValidation,
  listStudentByIdValidation: listStudentByIdValidation,
  updateStudentValidation: updateStudentValidation,
  listStudentByUserIdValidation: listStudentByUserIdValidation,
};

module.exports = StudentValidation;
