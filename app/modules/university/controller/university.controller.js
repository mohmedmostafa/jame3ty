const db = require('../../../modules');
const { Response } = require('../../../common/response.handler');

const Op = db.Sequelize.Op;
const db_University = db.University;
const db_Faculty = db.Faculty;

//---------------------------------------------------------------
exports.addUniversity = async (req, res) => {
  try {
    //Save TO DB
    const uni = await db_University.create({
      name_ar: req.body.name_ar,
      name_en: req.body.name_en,
    });

    //Success
    return Response(res, 200, 'Success!', { uni });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Add', { error });
  }
};

//---------------------------------------------------------------
exports.updateUniversity = async (req, res) => {
  try {
    //Check if the University is already exsits
    let university = await db_University.findByPk(req.params.id);

    if (!university) {
      return Response(res, 400, 'University Not Found!', {});
    }

    university = university.get({ plain: true });

    //Do Update
    university = await db_University.update(
      {
        name_ar: req.body.name_ar ? req.body.name_ar : university.name_ar,
        name_en: req.body.name_en ? req.body.name_en : university.name_en,
      },
      { where: { id: req.params.id } }
    );

    //Success
    return Response(res, 200, 'Success!', { university });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
  }
};

//---------------------------------------------------------------
exports.deleteUniversity = async (req, res) => {
  try {
    //Check if the faculty is already exsits
    let university = await db_University.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: db_Faculty,
        },
      ],
    });

    if (!university) {
      return Response(res, 400, 'University Not Found!', {});
    }

    university = university.get({ plain: true });

    //Check if the Universtiy has Faculty
    if (university.faculties.length > 0) {
      return Response(res, 400, "Can't Delete. The University has childs", {
        university,
      });
    }

    //Delete
    university = await db_University.destroy({
      where: { id: req.params.id },
    });

    //Success
    return Response(res, 200, 'Success!', { university });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
  }
};

//---------------------------------------------------------------
exports.listUniversity = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Count all rows
  let numRows = await db_University.count({}).catch((error) => {
    return Response(res, 500, 'Fail to Count!', { error });
  });
  numRows = parseInt(numRows);

  //Total num of valid pages
  let numPages = Math.ceil(numRows / numPerPage);

  //Calc skip or offset to be used in limit
  let skip = (page - 1) * numPerPage;
  let _limit = numPerPage;

  //Query
  let name_ar = req.query.name_ar ? req.query.name_ar : '';
  let name_en = req.query.name_en ? req.query.name_en : '';

  try {
    let data;
    if (doPagination) {
      data = await db_University.findAll({
        where: {
          [Op.or]: [
            {
              name_ar: {
                [Op.substring]: name_ar,
              },
            },
            {
              name_en: {
                [Op.substring]: name_en,
              },
            },
          ],
        },
        offset: skip,
        limit: _limit,
      });
    } else {
      data = await db_University.findAll({
        where: {
          [Op.or]: [
            {
              name_ar: {
                [Op.substring]: name_ar,
              },
            },
            {
              name_en: {
                [Op.substring]: name_en,
              },
            },
          ],
        },
      });
    }

    let result = {
      numRows,
      numPerPage,
      numPages,
      page,
      data,
    };

    //Success
    return Response(res, 200, 'Success!', { result });
  } catch (error) {
    return Response(res, 500, 'Fail To Find!', { error });
  }
};
