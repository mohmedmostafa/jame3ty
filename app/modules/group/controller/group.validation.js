const Joi = require('joi');
const { ValidateResponse } = require('../../../common/response.handler');
const { onErrorDeleteFiles } = require('../../../common/multerConfig');
const db = require('../..');

//----------------------------------------------------------
addGroupValidation = (req, res, next) => {
  if (req.body.groupSchedule) {
    //Parse groupSchedule from the body
    const groupSchedule = JSON.parse(req.body.groupSchedule);
    req.body.groupSchedule = groupSchedule;
  }

  //One Group Schedule Schema
  let groupScheduleSchema = Joi.object().keys({
    day: Joi.string().required(),
    time: Joi.date().iso().required(),
  });

  //Course Body Validation
  const schema = Joi.object({
    nameGroup: Joi.string().min(3).max(30).required(),
    maxNumOfStudentsGroup: Joi.number().integer().positive().min(1).required(),
    startDateGroup: Joi.date().iso().required(),
    endDateGroup: Joi.date()
      .greater(Joi.ref('startDateGroup'))
      .iso()
      .required(),
    groupSchedule: Joi.array().items(groupScheduleSchema),
    courseId: Joi.number().integer().required(),
  });

  console.log(req.body);

  const { error } = schema.validate(req.body);
  if (error) {
    //onErrorDeleteFiles(req);
    return ValidateResponse(res, error.details, {});
  }

  return next();
};

//----------------------------------------------------------
const GroupValidation = {
  addGroupValidation: addGroupValidation,
};

module.exports = GroupValidation;
