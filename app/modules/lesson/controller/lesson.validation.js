const Joi = require('joi');
const { ValidateResponse } = require('../../../common/response.handler');
const { onErrorDeleteFiles } = require('../../../common/multerConfig');
const db = require('../..');

//----------------------------------------------------------
addLessonValidation = (req, res, next) => {
  //Lesson Body Validation
  let schema = Joi.object({
    name_ar: Joi.string().min(3).max(30).required(),
    name_en: Joi.string().min(3).max(30).required(),
    desc: Joi.string().min(5).allow('', null),
    type: Joi.number().integer().min(0).max(1).required(),
    isLiveStreaming: Joi.number().integer().min(0).max(1).required(),
    liveStreamingInfo: Joi.when('isLiveStreaming', {
      is: 1,
      then: Joi.string().min(3).required(),
      otherwise: Joi.string().allow('', null),
    }),
    isAssostatedWithGroup: Joi.number().integer().min(0).max(1).required(),
    groupId: Joi.when('isAssostatedWithGroup', {
      is: 1,
      then: Joi.number().integer().required(),
      otherwise: Joi.string().allow('', null),
    }),
    courseId: Joi.number().integer().required(),
    youtubeLink: Joi.string().allow('', null),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    onErrorDeleteFiles(req);
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
updateLessonValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().required(),
    });

    const { error } = schemaParam.validate(req.params);
    if (error) {
    return ValidateResponse(res, error.details[0].message, {path:error.details[0].path[0]});
    }
  }

  //Lesson Body Validation
  let schema = Joi.object({
    name_ar: Joi.string().min(3).max(30).required(),
    name_en: Joi.string().min(3).max(30).required(),
    desc: Joi.string().min(5).allow('', null),
    type: Joi.number().integer().min(0).max(1).required(),
    isLiveStreaming: Joi.number().integer().min(0).max(1).required(),
    liveStreamingInfo: Joi.when('isLiveStreaming', {
      is: 1,
      then: Joi.string().min(3).required(),
      otherwise: Joi.string().allow('', null),
    }),
    isAssostatedWithGroup: Joi.number().integer().min(0).max(1).required(),
    groupId: Joi.when('isAssostatedWithGroup', {
      is: 1,
      then: Joi.number().integer().required(),
      otherwise: Joi.string().allow('', null),
    }),
    courseId: Joi.number().integer().required(),
    youtubeLink: Joi.string().allow('', null),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
deleteLessonValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().min(1).required(),
    });

    const { error } = schemaParam.validate(req.params);
    if (error) {
    return ValidateResponse(res, error.details[0].message, {path:error.details[0].path[0]});
    }
  }

  //Body Validation
  let schema = Joi.object({
    attachmentPath: Joi.string().min(3).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
deleteAttachmentValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().min(1).required(),
    });

    const { error } = schemaParam.validate(req.params);
    if (error) {
    return ValidateResponse(res, error.details[0].message, {path:error.details[0].path[0]});
    }
  }

  return next();
};

//----------------------------------------------------------
listLessonValidation = (req, res, next) => {
  //Body Validation
  const schema = Joi.object({
    doPagination: Joi.number().integer().valid(1, 0).default(1),
    numPerPage: Joi.number().integer().greater(0).required(),
    page: Joi.number().integer().greater(0).required(),
    searchKey: Joi.string().allow('', null).required(),
    type: Joi.string().valid('1', '0', 'both').required(),
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
listLessonByIdValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().min(1).required(),
    });

    const { error } = schemaParam.validate(req.params);
    if (error) {
    return ValidateResponse(res, error.details[0].message, {path:error.details[0].path[0]});
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
