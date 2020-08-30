const Joi = require('joi');
const { ValidateResponse } = require('../../../common/response.handler');
const { onErrorDeleteFiles } = require('../../../common/multerConfig');
const db = require('../..');

//----------------------------------------------------------
addGroupValidation = (req, res, next) => {
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

  //Course Body Validation
  const schema = Joi.object({
    nameGroup: Joi.string().min(3).max(30).required(),
    maxNumOfStudentsGroup: Joi.number().integer().positive().min(1).required(),
    startDateGroup: Joi.date().iso().required(),
    endDateGroup: Joi.date()
      .greater(Joi.ref('startDateGroup'))
      .iso()
      .required(),
    groupSchedule: Joi.array().items(groupScheduleSchema),
    courseId: Joi.number().integer().required(),
  });

  console.log(req.body);

  const { error } = schema.validate(req.body);
  if (error) {
    //onErrorDeleteFiles(req);
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
updateGroupValidation = (req, res, next) => {
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

  //Course Body Validation
  const schema = Joi.object({
    nameGroup: Joi.string().min(3).max(30).required(),
    maxNumOfStudentsGroup: Joi.number().integer().positive().min(1).required(),
    startDateGroup: Joi.date().iso().required(),
    endDateGroup: Joi.date()
      .greater(Joi.ref('startDateGroup'))
      .iso()
      .required(),
    groupSchedule: Joi.array().items(groupScheduleSchema),
    courseId: Joi.number().integer().required(),
  });

  console.log(req.body);

  const { error } = schema.validate(req.body);
  if (error) {
    //onErrorDeleteFiles(req);
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
deleteGroupValidation = (req, res, next) => {
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
listGroupByCourseIdValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      courseId: Joi.number().integer().min(1).required(),
    });

    const { error } = schemaParam.validate(req.params);
    if (error) {
      return ValidateResponse(res, error.details[0].message, {});
    }
  }

  //Body Validation
  const schema = Joi.object({
    doPagination: Joi.number().integer().valid(1, 0).default(1),
    numPerPage: Joi.number().integer().greater(0).required(),
    page: Joi.number().integer().greater(0).required(),
    searchKey: Joi.string().allow('', null).required(),
    //startFrom: Joi.date().iso().required(),
    //startTo: Joi.date().iso().greater(Joi.ref('startFrom')).required(),
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
listGroupByIdValidation = (req, res, next) => {
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
const GroupValidation = {
  addGroupValidation: addGroupValidation,
  deleteGroupValidation: deleteGroupValidation,
  listGroupByIdValidation: listGroupByIdValidation,
  listGroupByCourseIdValidation: listGroupByCourseIdValidation,
  updateGroupValidation: updateGroupValidation,
};

module.exports = GroupValidation;
