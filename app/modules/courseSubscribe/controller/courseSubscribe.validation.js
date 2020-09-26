const Joi = require('joi');
const {
  ValidateResponse,
  ResponseConstants,
} = require('../../../common/response/response.handler');
const {
  onErrorDeleteFiles,
} = require('../../../common/attachmentsUpload/multerConfig');
const { Joi_messages } = require('../../../common/validation/joi.constants');

const db = require('../..');

//----------------------------------------------------------
generatePaymentRequestValidation = (req, res, next) => {
  //Body Validation
  let schema = Joi.object({
    studentId: Joi.number().integer().messages(Joi_messages),
    courseId: Joi.number().integer().messages(Joi_messages),
  })
    .options({ abortEarly: false })
    .unknown(true);

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
const CourseSubscribeValidation = {
  generatePaymentRequestValidation: generatePaymentRequestValidation,
};

module.exports = CourseSubscribeValidation;
