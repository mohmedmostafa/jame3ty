const Joi = require('joi');
const {
  ValidateResponse,
} = require('../../../common/response/response.handler');
const {
  onErrorDeleteFiles,
} = require('../../../common/attachmentsUpload/multerConfig');
const db = require('../..');

//----------------------------------------------------------
addDepartmentValidation = (req, res, next) => {
  if (req.body.academicyears) {
    //Parse academicyears from the body
    var academicyears = JSON.parse(req.body.academicyears);
    req.body.academicyears = academicyears;
  }

  //One subject Schema
  let subjectsSchema = Joi.object().keys({
    name_ar: Joi.string().trim().min(3).max(30).required(),
    name_en: Joi.string().trim().min(3).max(30).required(),
  });

  //One academicyear Schema
  let academicyearsSchema = Joi.object().keys({
    name_ar: Joi.string().trim().min(3).max(30).required(),
    name_en: Joi.string().trim().min(3).max(30).required(),
    subjects: Joi.array().items(subjectsSchema),
  });

  //Department Body Validation
  let schema = Joi.object({
    name_ar: Joi.string().trim().min(3).max(30).required(),
    name_en: Joi.string().trim().min(3).max(30).required(),
    facultyId: Joi.number().integer().required(),
    academicyears: Joi.array().items(academicyearsSchema),
  });

  console.log(req.body);

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
updateDepartmentValidation = (req, res, next) => {
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
  let schema = Joi.object({
    name_ar: Joi.string().trim().min(3).max(30).required(),
    name_en: Joi.string().trim().min(3).max(30).required(),
    facultyId: Joi.any(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
deleteDepartmentValidation = (req, res, next) => {
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
listDepartmentValidation = (req, res, next) => {
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
listDepartmentByIdValidation = (req, res, next) => {
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
const DepartmentValidation = {
  addDepartmentValidation: addDepartmentValidation,
  deleteDepartmentValidation: deleteDepartmentValidation,
  listDepartmentValidation: listDepartmentValidation,
  listDepartmentByIdValidation: listDepartmentByIdValidation,
  updateDepartmentValidation: updateDepartmentValidation,
};

module.exports = DepartmentValidation;
