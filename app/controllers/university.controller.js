const db = require('../models');
const { Response, ValidateResponse } = require('../common/response.handler');

const Op = db.Sequelize.Op;
const db_University = db.University;

//---------------------------------------------------------------
exports.addUniversity = async (req, res) => {
  //Save TO DB
  try {
    const uni = await db_University.create({
      name_ar: req.body.name_ar,
      name_en: req.body.name_en,
    });

    //Success
    return Response(res, 200, 'Success!', { uni });
  } catch (error) {
    return Response(res, 500, 'Fail to add the new University!', { error });
  }
};
