const Joi = require('joi');
const {
  ValidateResponse,
  ResponseConstants,
} = require('../../../common/response/response.handler');
const {
  onErrorDeleteFiles,
} = require('../../../common/attachmentsUpload/multerConfig');
const { Joi_messages } = require('../../../common/validation/joi.constants');

const db = require('../../');

//----------------------------------------------------------
addCourseValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      method: Joi.number()
        .integer()
        .min(0)
        .max(1)
        .required()
        .messages(Joi_messages),
    }).options({ abortEarly: false });

    const { error } = schemaParam.validate(req.params);
    console.log(error);
    if (error) {
      onErrorDeleteFiles(req);
      return ValidateResponse(
        res,
        ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
          .JOI_VALIDATION_INVALID_URL_PARAM,
        error.details
      );
    }
  }

  //Course Body Validation
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
    code: Joi.string().allow('', null).messages(Joi_messages),
    desc: Joi.string().trim().min(5).required().messages(Joi_messages),
    prerequisiteText: Joi.string()
      .trim()
      .min(5)
      .required()
      .messages(Joi_messages),
    whatYouWillLearn: Joi.string()
      .trim()
      .min(5)
      .required()
      .messages(Joi_messages),
    numOfLessons: Joi.number()
      .integer()
      .positive()
      .min(1)
      .required()
      .messages(Joi_messages),
    numOfHours: Joi.number().positive().required().messages(Joi_messages),
    price: Joi.number().positive().required().messages(Joi_messages),
    priceBeforeDiscount: Joi.number()
      .positive()
      .min(Joi.ref('price'))
      .required()
      .messages(Joi_messages),
    startDate: Joi.date().iso().required().messages(Joi_messages),
    type: Joi.number()
      .integer()
      .min(0)
      .max(1)
      .required()
      .messages(Joi_messages),
    course_keyword: Joi.string()
      .trim()
      .min(2)
      .required()
      .messages(Joi_messages),
    // attachement_price: Joi.number().positive().required().messages(Joi_messages),
    subjectId: Joi.number().integer().required().messages(Joi_messages),
    instructorId: Joi.number().integer().required().messages(Joi_messages),
  })
    .options({ abortEarly: false })
    .unknown(true);

  //Only when param = 1 which means Live Streaming
  if (req.params.method === '1') {
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

    //Course with Group Body Validation
    schema = schema.keys({
      nameGroup: Joi.string()
        .trim()
        .min(3)
        .max(30)
        .required()
        .messages(Joi_messages),
      maxNumOfStudentsGroup: Joi.number()
        .integer()
        .positive()
        .min(1)
        .required()
        .messages(Joi_messages),
      startDateGroup: Joi.date()
        .iso()
        .greater(Joi.ref('startDate'))
        .required()
        .messages(Joi_messages),
      endDateGroup: Joi.date()
        .greater(Joi.ref('startDateGroup'))
        .iso()
        .required()
        .messages(Joi_messages),
      groupSchedule: Joi.array()
        .items(groupScheduleSchema)
        .messages(Joi_messages),
    });
  }

  console.log(req.body);

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
updateCourseValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      id: Joi.number().integer().required().messages(Joi_messages),
    }).options({ abortEarly: false });

    const { error } = schemaParam.validate(req.params);
    console.log(error);
    if (error) {
      onErrorDeleteFiles(req);
      return ValidateResponse(
        res,
        ResponseConstants.HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY.type
          .JOI_VALIDATION_INVALID_URL_PARAM,
        error.details
      );
    }
  }

  //Body Validation

  //Course Body Validation
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
    code: Joi.string().allow('', null).messages(Joi_messages),
    desc: Joi.string().trim().min(5).required().messages(Joi_messages),
    prerequisiteText: Joi.string()
      .trim()
      .min(5)
      .required()
      .messages(Joi_messages),
    whatYouWillLearn: Joi.string()
      .trim()
      .min(5)
      .required()
      .messages(Joi_messages),
    numOfLessons: Joi.number()
      .integer()
      .positive()
      .min(1)
      .required()
      .messages(Joi_messages),
    numOfHours: Joi.number().positive().required().messages(Joi_messages),
    price: Joi.number().positive().required().messages(Joi_messages),
    priceBeforeDiscount: Joi.number()
      .positive()
      .min(Joi.ref('price'))
      .required()
      .messages(Joi_messages),
    startDate: Joi.date().iso().required().messages(Joi_messages),
    type: Joi.number()
      .integer()
      .min(0)
      .max(1)
      .required()
      .messages(Joi_messages),
    course_keyword: Joi.string()
      .trim()
      .min(2)
      .required()
      .messages(Joi_messages),
    // attachement_price: Joi.number().positive().required().messages(Joi_messages),
    subjectId: Joi.number().integer().required().messages(Joi_messages),
  })
    .options({ abortEarly: false })
    .unknown(true);

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
deleteCourseValidation = (req, res, next) => {
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
listCourseValidation = (req, res, next) => {
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
    method: Joi.string()
      .trim()
      .valid('1', '0', 'both')
      .required()
      .messages(Joi_messages),
    startFrom: Joi.date().iso().required().messages(Joi_messages),
    startTo: Joi.date()
      .iso()
      .greater(Joi.ref('startFrom'))
      .required()
      .messages(Joi_messages),
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
listCourseNoDateValidation = (req, res, next) => {
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
    method: Joi.string()
      .trim()
      .valid('1', '0', 'both')
      .required()
      .messages(Joi_messages),
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
listCourseNoDateByDepartmentValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      departmentId: Joi.number().integer().required().messages(Joi_messages),
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
    method: Joi.string()
      .trim()
      .valid('1', '0', 'both')
      .required()
      .messages(Joi_messages),
    orderBy: Joi.string()
      .trim()
      .valid('DESC', 'ASC')
      .required()
      .messages(Joi_messages),
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
listCourseNoDateByInstructorValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      instructorId: Joi.number().integer().required().messages(Joi_messages),
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
    method: Joi.string()
      .trim()
      .valid('1', '0', 'both')
      .required()
      .messages(Joi_messages),
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
listCourseByIdValidation = (req, res, next) => {
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
const CourseValidation = {
  addCourseValidation: addCourseValidation,
  deleteCourseValidation: deleteCourseValidation,
  listCourseValidation: listCourseValidation,
  listCourseByIdValidation: listCourseByIdValidation,
  updateCourseValidation: updateCourseValidation,
  listCourseNoDateValidation: listCourseNoDateValidation,
  listCourseNoDateByDepartmentValidation: listCourseNoDateByDepartmentValidation,
  listCourseNoDateByInstructorValidation: listCourseNoDateByInstructorValidation,
  deleteAttachmentValidation: deleteAttachmentValidation,
};

module.exports = CourseValidation;
