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
addLessonValidation = (req, res, next) => {
  //Lesson Body Validation
  let schema = Joi.object({
    name_ar: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .required()
      .messages(Joi_messages),
    name_en: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .required()
      .messages(Joi_messages),
    desc: Joi.string().trim().min(5).allow('', null).messages(Joi_messages),
    type: Joi.number()
      .integer()
      .min(0)
      .max(1)
      .required()
      .messages(Joi_messages),
    isLiveStreaming: Joi.number()
      .integer()
      .min(0)
      .max(1)
      .required()
      .messages(Joi_messages),
    liveStreamingInfo: Joi.when('isLiveStreaming', {
      is: 1,
      then: Joi.string().min(3).required().messages(Joi_messages),
      otherwise: Joi.string().allow('', null).messages(Joi_messages),
    }),
    liveStreamingTime: Joi.when('isLiveStreaming', {
      is: 1,
      then: Joi.date().iso().required().messages(Joi_messages),
      otherwise: Joi.string().allow('', null).messages(Joi_messages),
    }),
    liveStreamingEndTime: Joi.when('isLiveStreaming', {
      is: 1,
      then: Joi.date().iso().required().messages(Joi_messages),
      otherwise: Joi.string().allow('', null).messages(Joi_messages),
    }),
    isAssostatedWithGroup: Joi.number()
      .integer()
      .min(0)
      .max(1)
      .required()
      .messages(Joi_messages),
    groupId: Joi.when('isAssostatedWithGroup', {
      is: 1,
      then: Joi.number().integer().required().messages(Joi_messages),
      otherwise: Joi.string().allow('', null).messages(Joi_messages),
    }),
    courseId: Joi.number().integer().required().messages(Joi_messages),
    youtubeLink: Joi.string().allow('', null).messages(Joi_messages),
  }).options({ abortEarly: false });

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

  return next();
};

//----------------------------------------------------------
updateLessonValidation = (req, res, next) => {
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

  //Lesson Body Validation
  let schema = Joi.object({
    name_ar: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .required()
      .messages(Joi_messages),
    name_en: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .required()
      .messages(Joi_messages),
    desc: Joi.string().trim().min(5).allow('', null).messages(Joi_messages),
    type: Joi.number()
      .integer()
      .min(0)
      .max(1)
      .required()
      .messages(Joi_messages),
    isLiveStreaming: Joi.number()
      .integer()
      .min(0)
      .max(1)
      .required()
      .messages(Joi_messages),
    liveStreamingInfo: Joi.when('isLiveStreaming', {
      is: 1,
      then: Joi.string().min(3).required().messages(Joi_messages),
      otherwise: Joi.string().allow('', null).messages(Joi_messages),
    }),
    liveStreamingTime: Joi.when('isLiveStreaming', {
      is: 1,
      then: Joi.date().iso().required().messages(Joi_messages),
      otherwise: Joi.string().allow('', null).messages(Joi_messages),
    }),
    liveStreamingEndTime: Joi.when('isLiveStreaming', {
      is: 1,
      then: Joi.date().iso().required().messages(Joi_messages),
      otherwise: Joi.string().allow('', null).messages(Joi_messages),
    }),
    isAssostatedWithGroup: Joi.number()
      .integer()
      .min(0)
      .max(1)
      .required()
      .messages(Joi_messages),
    groupId: Joi.when('isAssostatedWithGroup', {
      is: 1,
      then: Joi.number().integer().required().messages(Joi_messages),
      otherwise: Joi.string().allow('', null).messages(Joi_messages),
    }),
    courseId: Joi.number().integer().required().messages(Joi_messages),
    youtubeLink: Joi.string().allow('', null).messages(Joi_messages),
  }).options({ abortEarly: false });

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

  return next();
};

//----------------------------------------------------------
deleteLessonValidation = (req, res, next) => {
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
deleteAttachmentValidation = (req, res, next) => {
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

  //Body Validation
  let schema = Joi.object({
    attachmentPath: Joi.string().min(3).required().messages(Joi_messages),
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
listLessonValidation = (req, res, next) => {
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
    type: Joi.string()
      .trim()
      .valid('1', '0', 'both')
      .required()
      .messages(Joi_messages),
    course_id: Joi.any().messages(Joi_messages),
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
listLessonByIdValidation = (req, res, next) => {
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
const LessonValidation = {
  addLessonValidation: addLessonValidation,
  deleteLessonValidation: deleteLessonValidation,
  listLessonValidation: listLessonValidation,
  listLessonByIdValidation: listLessonByIdValidation,
  updateLessonValidation: updateLessonValidation,
  deleteAttachmentValidation: deleteAttachmentValidation,
};

module.exports = LessonValidation;
