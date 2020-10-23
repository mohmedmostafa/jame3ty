const Joi = require('joi');
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
addGroupValidation = (req, res, next) => {
  if (req.body.groupSchedule) {
    //Parse groupSchedule from the body
    const groupSchedule = JSON.parse(req.body.groupSchedule);
    req.body.groupSchedule = groupSchedule;
  }

  //One Group Schedule Schema
  let groupScheduleSchema = Joi.object()
    .options({ abortEarly: false })
    .keys({
      day: Joi.string().trim().required().messages(Joi_messages),
      time: Joi.date().iso().required().messages(Joi_messages),
    });

  //Course Body Validation
  const schema = Joi.object({
    nameGroup: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages(Joi_messages),
    maxNumOfStudentsGroup: Joi.number()
      .integer()
      .positive()
      .min(1)
      .required()
      .messages(Joi_messages),
    startDateGroup: Joi.date().iso().required().messages(Joi_messages),
    endDateGroup: Joi.date()
      .greater(Joi.ref('startDateGroup'))
      .iso()
      .required()
      .messages(Joi_messages),
    groupSchedule: Joi.array()
      .items(groupScheduleSchema)
      .messages(Joi_messages),
    courseId: Joi.number().integer().required().messages(Joi_messages),
    instructorId: Joi.number().integer().required().messages(Joi_messages),
  }).options({ abortEarly: false });

  console.log(req.body);

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
updateGroupValidation = (req, res, next) => {
  if (req.body.groupSchedule) {
    //Parse groupSchedule from the body
    const groupSchedule = JSON.parse(req.body.groupSchedule);
    req.body.groupSchedule = groupSchedule;
  }

  //One Group Schedule Schema
  let groupScheduleSchema = Joi.object()
    .options({ abortEarly: false })
    .keys({
      day: Joi.string().trim().required().messages(Joi_messages),
      time: Joi.date().iso().required().messages(Joi_messages),
    });

  //Course Body Validation
  const schema = Joi.object({
    nameGroup: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages(Joi_messages),
    maxNumOfStudentsGroup: Joi.number()
      .integer()
      .positive()
      .min(1)
      .required()
      .messages(Joi_messages),
    startDateGroup: Joi.date().iso().required().messages(Joi_messages),
    endDateGroup: Joi.date()
      .greater(Joi.ref('startDateGroup'))
      .iso()
      .required()
      .messages(Joi_messages),
    groupSchedule: Joi.array()
      .items(groupScheduleSchema)
      .messages(Joi_messages),
    courseId: Joi.number().integer().required().messages(Joi_messages),
  }).options({ abortEarly: false });

  console.log(req.body);

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
deleteGroupValidation = (req, res, next) => {
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
listGroupByCourseIdValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      courseId: Joi.number().integer().min(1).required().messages(Joi_messages),
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
    //startFrom: Joi.date().iso().required(),
    //startTo: Joi.date().iso().greater(Joi.ref('startFrom')).required(),
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
listGroupByIdValidation = (req, res, next) => {
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
const GroupValidation = {
  addGroupValidation: addGroupValidation,
  deleteGroupValidation: deleteGroupValidation,
  listGroupByIdValidation: listGroupByIdValidation,
  listGroupByCourseIdValidation: listGroupByCourseIdValidation,
  updateGroupValidation: updateGroupValidation,
};

module.exports = GroupValidation;
