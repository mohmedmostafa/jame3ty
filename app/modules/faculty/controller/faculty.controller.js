const db = require('../..');
const { Response } = require('../../../common/response.handler');

const Op = db.Sequelize.Op;
const db_University = db.University;
const db_Faculty = db.Faculty;
const db_connection = db.connection;

//---------------------------------------------------------------
exports.addFaculty = async (req, res) => {
  try {
    //Check if the University is already exsits
    const university = await db_University.findByPk(
      parseInt(req.body.universityId)
    );

    if (!university) {
      return Response(res, 400, 'University Not Found!', {});
    }

    //Save to DB
    const faculty = await db_Faculty.create({
      name_ar: req.body.name_ar,
      name_en: req.body.name_en,
      universityId: parseInt(req.body.universityId),
    });

    //Success
    return Response(res, 200, 'Success!', { faculty });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Add', { error });
  }
};

//---------------------------------------------------------------
exports.updateFaculty = async (req, res) => {
  try {
    //Check if the faculty is already exsits
    let faculty = await db_Faculty.findByPk(req.params.id);
    faculty = faculty.get({ plain: true });

    if (!faculty) {
      return Response(res, 400, 'Faculty Not Found!', {});
    }

    //Check the universityId is changed
    if (req.body.universityId != faculty.universityId) {
      //Check if the University is already exsits
      const university = await db_University.findByPk(
        parseInt(req.body.universityId)
      );

      if (!university) {
        return Response(res, 400, 'University Not Found!', {});
      }
    }

    //Do Update
    faculty = await db_Faculty.update(
      {
        name_ar: req.body.name_ar ? req.body.name_ar : faculty.name_ar,
        name_en: req.body.name_en ? req.body.name_en : faculty.name_en,
        universityId: req.body.universityId
          ? req.body.universityId
          : faculty.universityId,
      },
      { where: { id: req.params.id } }
    );

    //Success
    return Response(res, 200, 'Success!', { faculty });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
  }
};

//---------------------------------------------------------------
exports.deleteFaculty = async (req, res) => {
  try {
    //Select Childs
    let faculty = await db_Faculty.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: db_Faculty,
        },
      ],
    });
    faculty = faculty.get({ plain: true });

    //Check if the Universtiy has Faculty
    if (faculty.faculties.length > 0) {
      return Response(res, 400, "Can't Delete. The University has faculties", {
        faculty,
      });
    }
    /*
    //Delete
    faculty = await db_University.destroy({
      where: { id: req.params.id },
    });
*/
    //Success
    return Response(res, 200, 'Success!', { faculty });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
  }
};

//---------------------------------------------------------------
exports.listFaculty = async (req, res) => {
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

  let data;
  if (doPagination) {
    data = await db_University
      .findAll({
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
      })
      .catch((error) => {
        console.log(error);
        return Response(res, 500, 'Fail to Find!', { error });
      });
  } else {
    data = await db_University
      .findAll({
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
      })
      .catch((error) => {
        console.log(error);
        return Response(res, 500, 'Fail to Find!', { error });
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
};
