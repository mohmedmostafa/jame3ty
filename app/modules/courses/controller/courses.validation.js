const Joi = require('joi');
const {
  ValidateResponse,
} = require('../../../common/response/response.handler');
const {
  onErrorDeleteFiles,
} = require('../../../common/attachmentsUpload/multerConfig');
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
      return ValidateResponse(res, error.details[0].message, {
        path: error.details[0].path[0],
      });
    }
  }

  //Course Body Validation
  let schema = Joi.object({
    name_ar: Joi.string().trim().min(3).max(30).required(),
    name_en: Joi.string().trim().min(3).max(30).required(),
    code: Joi.string().allow('', null),
    desc: Joi.string().trim().min(5).required(),
    prerequisiteText: Joi.string().trim().min(5).required(),
    whatYouWillLearn: Joi.string().trim().min(5).required(),
    numOfLessons: Joi.number().integer().positive().min(1).required(),
    numOfHours: Joi.number().positive().required(),
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
      day: Joi.string().trim().required(),
      time: Joi.string().regex(/^([0-9]{2})\:([0-9]{2})$/).required,
    });

    //Course with Group Body Validation
    schema = schema.keys({
      nameGroup: Joi.string().trim().min(3).max(30).required(),
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
updateCourseValidation = (req, res, next) => {
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

  //Course Body Validation
  let schema = Joi.object({
    name_ar: Joi.string().trim().min(3).max(30).required(),
    name_en: Joi.string().trim().min(3).max(30).required(),
    code: Joi.string().allow('', null),
    desc: Joi.string().trim().min(5).required(),
    prerequisiteText: Joi.string().trim().min(5).required(),
    whatYouWillLearn: Joi.string().trim().min(5).required(),
    numOfLessons: Joi.number().integer().positive().min(1).required(),
    numOfHours: Joi.number().positive().required(),
    price: Joi.number().positive().required(),
    priceBeforeDiscount: Joi.number()
      .positive()
      .min(Joi.ref('price'))
      .required(),
    startDate: Joi.date().iso().required(),
    type: Joi.number().integer().min(0).max(1).required(),
    subjectId: Joi.number().integer().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
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
      return ValidateResponse(res, error.details[0].message, {
        path: error.details[0].path[0],
      });
    }
  }

  return next();
};

//----------------------------------------------------------
listCourseValidation = (req, res, next) => {
  //Body Validation
  const schema = Joi.object({
    doPagination: Joi.number().integer().valid(1, 0).default(1),
    numPerPage: Joi.number().integer().greater(0).required(),
    page: Joi.number().integer().greater(0).required(),
    searchKey: Joi.string().allow('', null).required(),
    method: Joi.string().trim().valid('1', '0', 'both').required(),
    startFrom: Joi.date().iso().required(),
    startTo: Joi.date().iso().greater(Joi.ref('startFrom')).required(),
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
listCourseNoDateValidation = (req, res, next) => {
  //Body Validation
  const schema = Joi.object({
    doPagination: Joi.number().integer().valid(1, 0).default(1),
    numPerPage: Joi.number().integer().greater(0).required(),
    page: Joi.number().integer().greater(0).required(),
    searchKey: Joi.string().allow('', null).required(),
    method: Joi.string().trim().valid('1', '0', 'both').required(),
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
listCourseNoDateByDepartmentValidation = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      departmentId: Joi.number().integer().required(),
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
    method: Joi.string().trim().valid('1', '0', 'both').required(),
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
listCourseByIdValidation = (req, res, next) => {
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
const CourseValidation = {
  addCourseValidation: addCourseValidation,
  deleteCourseValidation: deleteCourseValidation,
  listCourseValidation: listCourseValidation,
  listCourseByIdValidation: listCourseByIdValidation,
  updateCourseValidation: updateCourseValidation,
  listCourseNoDateValidation: listCourseNoDateValidation,
  listCourseNoDateByDepartmentValidation: listCourseNoDateByDepartmentValidation,
};

module.exports = CourseValidation;
