const Joi = require('joi');
const { ValidateResponse } = require('../../../common/response.handler');
const { onErrorDeleteFiles } = require('../../../common/multerConfig');
const db = require('../../');

//----------------------------------------------------------
addCourseValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      method: Joi.number().integer().min(0).max(1).required(),
    });

    const { error } = schemaParam.validate(req.params);
    if (error) {
      onErrorDeleteFiles(req);
      return ValidateResponse(res, error.details[0].message, {});
    }
  }

  //Course Body Validation
  let schema = Joi.object({
    name_ar: Joi.string().min(3).max(30).required(),
    name_en: Joi.string().min(3).max(30).required(),
    code: Joi.string().allow('', null),
    desc: Joi.string().min(5).required(),
    prerequisiteText: Joi.string().min(5).required(),
    whatYouWillLearn: Joi.string().min(5).required(),
    numOfLessons: Joi.number().integer().positive().min(1).required(),
    price: Joi.number().positive().required(),
    priceBeforeDiscount: Joi.number()
      .positive()
      .min(Joi.ref('price'))
      .required(),
    startDate: Joi.date().iso().required(),
    type: Joi.number().integer().min(0).max(1).required(),
    subjectId: Joi.number().integer().required(),
  });

  //Only when param = 1 which means Live Streaming
  if (req.params.method === '1') {
    if (req.body.groupSchedule) {
      //Parse groupSchedule from the body
      const groupSchedule = JSON.parse(req.body.groupSchedule);
      req.body.groupSchedule = groupSchedule;
    }

    //One Group Schedule Schema
    let groupScheduleSchema = Joi.object().keys({
      day: Joi.string().required(),
      time: Joi.date().iso().required(),
    });

    //Course with Group Body Validation
    schema = schema.keys({
      nameGroup: Joi.string().min(3).max(30).required(),
      maxNumOfStudentsGroup: Joi.number()
        .integer()
        .positive()
        .min(1)
        .required(),
      startDateGroup: Joi.date().iso().greater(Joi.ref('startDate')).required(),
      endDateGroup: Joi.date()
        .greater(Joi.ref('startDateGroup'))
        .iso()
        .required(),
      groupSchedule: Joi.array().items(groupScheduleSchema),
    });
  }

  console.log(req.body);

  const { error } = schema.validate(req.body);
  if (error) {
    onErrorDeleteFiles(req);
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
deleteCourseValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().min(1).required(),
    });

    const { error } = schemaParam.validate(req.params);
    if (error) {
      return ValidateResponse(res, error.details[0].message, {});
    }
  }

  return next();
};
//----------------------------------------------------------
const CourseValidation = {
  addCourseValidation: addCourseValidation,
  deleteCourseValidation: deleteCourseValidation,
};

module.exports = CourseValidation;
