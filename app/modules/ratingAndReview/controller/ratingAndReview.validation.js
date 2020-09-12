const Joi = require('joi');
const {
  ValidateResponse,
} = require('../../../common/response/response.handler');
const db = require('../../');

//----------------------------------------------------------
addRatingAndReviewValidation = (req, res, next) => {
  //Body Validation
  const schema = Joi.object({
    date: Joi.date().iso().required(),
    reviewText: Joi.string().trim().min(5).max(300).allow('', null),
    rate: Joi.number().positive().min(0).max(5).required(),
    courseSubscribeId: Joi.number().integer().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
updateRatingAndReviewValidation = (req, res, next) => {
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
    reviewText: Joi.string().trim().min(5).max(300).allow('', null),
    rate: Joi.number().positive().min(0).max(5).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
listRatingAndReviewValidation = (req, res, next) => {
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
listRatingAndReviewByIdValidation = (req, res, next) => {
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
listRatingAndReviewByCourseIdValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      courseId: Joi.number().integer().min(1).required(),
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
deleteRatingAndReviewValidation = (req, res, next) => {
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
const RatingAndReviewValidation = {
  addRatingAndReviewValidation: addRatingAndReviewValidation,
  updateRatingAndReviewValidation: updateRatingAndReviewValidation,
  listRatingAndReviewValidation: listRatingAndReviewValidation,
  deleteRatingAndReviewValidation: deleteRatingAndReviewValidation,
  listRatingAndReviewByIdValidation: listRatingAndReviewByIdValidation,
  listRatingAndReviewByCourseIdValidation: listRatingAndReviewByCourseIdValidation,
};

module.exports = RatingAndReviewValidation;
