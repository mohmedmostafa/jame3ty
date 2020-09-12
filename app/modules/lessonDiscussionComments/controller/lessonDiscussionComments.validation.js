const Joi = require('joi');
const { ValidateResponse } = require('../../../common/response.handler');
const db = require('../..');

//----------------------------------------------------------
addlessonDiscussionCommentsValidation = (req, res, next) => {
  //Body Validation

  const schema = Joi.object({
    text: Joi.string().trim().required(),
    userId: Joi.number().integer().required(),
    lessonId: Joi.any(),
    lessonDiscussionId: Joi.any(),
  }).xor('lessonId', 'lessonDiscussionId');

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {
      path: error.details[0].path[0],
    });
  }

  return next();
};

//----------------------------------------------------------
updatelessonDiscussionCommentsValidation = (req, res, next) => {
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
  const schema = Joi.object({
    text: Joi.string().trim().required(),
    userId: Joi.number().integer().required(),
    lessonId: Joi.number().integer(),
    lessonDiscussionId: Joi.number().integer(),
  }).xor('lessonId', 'lessonDiscussionId');

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {
      path: error.details[0].path[0],
    });
  }

  return next();
};

//----------------------------------------------------------
listlessonDiscussionCommentsValidation = (req, res, next) => {
  //Body Validation
  const schema = Joi.object({
    doPagination: Joi.number().integer().valid(1, 0).default(1),
    numPerPage: Joi.number().integer().greater(0).required(),
    page: Joi.number().integer().greater(0).required(),
    lessonId: Joi.number().integer(),
  });
  
  const { error } = schema.validate(req.query);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {
      path: error.details[0].path[0],
    });
  }

  return next();
};

//----------------------------------------------------------
listlessonDiscussionCommentsValidationById = (req, res, next) => {
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
deletelessonDiscussionCommentsValidation = (req, res, next) => {
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
const lessonDiscussionCommentsValidation = {
  addlessonDiscussionCommentsValidation: addlessonDiscussionCommentsValidation,
  updatelessonDiscussionCommentsValidation: updatelessonDiscussionCommentsValidation,
  listlessonDiscussionCommentsValidation: listlessonDiscussionCommentsValidation,
  listlessonDiscussionCommentsValidationById: listlessonDiscussionCommentsValidationById,
  deletelessonDiscussionCommentsValidation: deletelessonDiscussionCommentsValidation,
};

module.exports = lessonDiscussionCommentsValidation;
