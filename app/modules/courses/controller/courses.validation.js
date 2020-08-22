const Joi = require('joi');
const { ValidateResponse } = require('../../../common/response.handler');
const Uploader = require('../../../common/uploader');
const UploaderOnError = require('../../../common/uploaderOnError');
const db = require('../../');

//----------------------------------------------------------
addCourseValidation = (req, res, next) => {
  //Body Validation
  const schema = Joi.object({
    name_ar: Joi.string().min(3).max(30).required(),
    name_en: Joi.string().min(3).max(30).required(),
    code: Joi.string().allow('', null),
    desc: Joi.string().min(5).required(),
    prerequisiteText: Joi.string().min(5).required(),
    whatYouWillLearn: Joi.string().min(5).required(),
    numOfLessons: Joi.number().integer().positive().min(1).required(),
    price: Joi.number().positive().required(),
    priceBeforeDiscount: Joi.number().positive().required(),
    startDate: Joi.date().iso().required(),
    type: Joi.number().integer().min(0).max(1).required(),
    method: Joi.number().integer().min(0).max(1).required(),
    subjectId: Joi.number().integer().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    UploaderOnError.onErrorDeleteFiles(req, Uploader);
    return ValidateResponse(res, error.details, {});
  }

  return next();
};

// //----------------------------------------------------------
// updateCourseValidation = (req, res, next) => {
//   //URL Params Validation
//   if (req.params) {
//     const schemaParam = Joi.object({
//       id: Joi.number().integer().required(),
//     });

//     const { error } = schemaParam.validate(req.params);
//     if (error) {
//       return ValidateResponse(res, error.details, {});
//     }
//   }

//   //Body Validation
//   const schema = Joi.object({
//     name_ar: Joi.string().min(3).max(30).required(),
//     name_en: Joi.string().min(3).max(30).required(),
//     universityId: Joi.number().integer().required(),
//   });

//   const { error } = schema.validate(req.body);
//   if (error) {
//     return ValidateResponse(res, error.details, {});
//   }

//   return next();
// };

// //----------------------------------------------------------
// listCourseValidation = (req, res, next) => {
//   //Body Validation
//   const schema = Joi.object({
//     doPagination: Joi.number().integer().valid(1, 0).default(1),
//     numPerPage: Joi.number().integer().greater(0).required(),
//     page: Joi.number().integer().greater(0).required(),
//     name_ar: Joi.any().required(),
//     name_en: Joi.any().required(),
//   });

//   const { error } = schema.validate(req.query);
//   if (error) {
//     return ValidateResponse(res, error.details, {});
//   }

//   return next();
// };

// //----------------------------------------------------------
// deleteCourseValidation = (req, res, next) => {
//   //URL Params Validation
//   if (req.params) {
//     const schemaParam = Joi.object({
//       id: Joi.number().integer().required(),
//     });

//     const { error } = schemaParam.validate(req.params);
//     if (error) {
//       return ValidateResponse(res, error.details, {});
//     }
//   }

//   return next();
// };

//----------------------------------------------------------
const CourseValidation = {
  addCourseValidation: addCourseValidation,
  // updateCourseValidation: updateCourseValidation,
  // listCourseValidation: listCourseValidation,
  // deleteCourseValidation: deleteCourseValidation,
};

module.exports = CourseValidation;
