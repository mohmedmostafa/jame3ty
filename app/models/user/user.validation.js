const Joi = require('joi');

//---------------------------------------------
const signinValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required(),
  });

  return schema.validate(data);
};

//---------------------------------------------
const signUPValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    }),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required(),
    roles: Joi.string().required(),
  });

  return schema.validate(data);
};

//----------------------------------------------
module.exports = { signUPValidation, signUPValidation };
