const Joi = require('joi');
const {
  ValidateResponse,
} = require('../../../common/response/response.handler');
const {
  onErrorDeleteFiles,
} = require('../../../common/attachmentsUpload/multerConfig');
const db = require('../..');

//----------------------------------------------------------
addAssignmentSubmissionValidation = (req, res, next) => {
  //AssignmentSubmission Body Validation
  let schema = Joi.object({
    submissionDate: Joi.date().iso().required(),
    lessonId: Joi.number().integer().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    onErrorDeleteFiles(req);
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};

//----------------------------------------------------------
updateAssignmentSubmissionValidation = (req, res, next) => {
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
deleteAssignmentSubmissionAttachmentValidation = (req, res, next) => {
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
deleteAssignmentSubmissionValidation = (req, res, next) => {
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
/*listAssignmentSubmissionBylessonIdStudentBased = (req, res, next) => {
  //URL Params Validation
  if (req.params) {
    const schemaParam = Joi.object({
      lessonId: Joi.number().integer().min(1).required(),
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
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return ValidateResponse(res, error.details[0].message, {});
  }

  return next();
};*/

//----------------------------------------------------------
listAssignmentSubmissionByIdValidation = (req, res, next) => {
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
const AssignmentSubmissionValidation = {
  addAssignmentSubmissionValidation: addAssignmentSubmissionValidation,
  deleteAssignmentSubmissionValidation: deleteAssignmentSubmissionValidation,
  deleteAssignmentSubmissionAttachmentValidation: deleteAssignmentSubmissionAttachmentValidation,
  //listAssignmentSubmissionBylessonIdStudentBased: listAssignmentSubmissionBylessonIdStudentBased,
  listAssignmentSubmissionByIdValidation: listAssignmentSubmissionByIdValidation,
  updateAssignmentSubmissionValidation: updateAssignmentSubmissionValidation,
};

module.exports = AssignmentSubmissionValidation;
