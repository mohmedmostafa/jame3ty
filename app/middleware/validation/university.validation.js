const Joi = require('joi');
const { ValidateResponse } = require('../../common/response.handler');
const db = require('../../models');

//----------------------------------------------------------
addUniversityValidation = (req, res, next) => {
  const schema = Joi.object({
    name_ar: Joi.string().min(7).max(30).required(),
    name_en: Joi.string().min(7).max(30).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return ValidateResponse(res, error.details, {});
  }

  return next();
};

//----------------------------------------------------------
const UniversityValidation = {
  addUniversityValidation: addUniversityValidation,
};

module.exports = UniversityValidation;
