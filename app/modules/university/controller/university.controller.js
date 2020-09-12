const db = require('../../../modules');
const { Response } = require('../../../common/response/response.handler');

const Op = db.Sequelize.Op;
const db_University = db.University;
const db_Faculty = db.Faculty;
const db_Department = db.Department;
const db_AcademicYear = db.AcademicYear;
const db_Subject = db.Subject;
const db_connection = db.connection;

//---------------------------------------------------------------
exports.addUniversity = async (req, res) => {
  try {
    //Start "Managed" Transaction
    const result = await db_connection.transaction(async (t) => {
      //Add University to DB
      const university = await db_University.create(
        {
          name_ar: req.body.name_ar,
          name_en: req.body.name_en,
        },
        { transaction: t }
      );

      //Inject universityId into each Faculty belongs to the university
      req.body.faculties.forEach((faculty) => {
        faculty.universityId = university.id;
      });

      //Save Faculties to DB for the university
      var faculty = await db_Faculty.bulkCreate(req.body.faculties, {
        fields: ['name_ar', 'name_en', 'universityId'],
        transaction: t,
      });

      return { university };
    });

    //Success
    return Response(res, 200, 'Success!', { result });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Add!', { error });
  }
};

//---------------------------------------------------------------
exports.updateUniversity = async (req, res) => {
  try {
    //Check if the University is already exsits
    let university = await db_University.findByPk(req.params.id);

    if (!university) {
      return Response(res, 404, 'University Not Found!', {});
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
      return Response(res, 404, 'University Not Found!', {});
    }

    university = university.get({ plain: true });

    //Check if the Universtiy has Faculty
    if (university.faculties.length > 0) {
      return Response(res, 409, "Can't Delete. The University has childs", {
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

//--------------------------------------------------------------
exports.listUniversityById = async (req, res) => {
  try {
    //Check if found
    const university = await db_University.findOne({
      where: { id: parseInt(req.params.id) },
      include: [
        {
          model: db_Faculty,
        },
      ],
    });

    if (!university) {
      return Response(res, 404, 'University Not Found!', {});
    }

    //Success
    return Response(res, 200, 'Success!', { university });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Find!', { error });
  }
};

//---------------------------------------------------------------
exports.listUniversity = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Count all rows
  let numRows = await db_University
    .count({
      where: {
        [Op.or]: [
          {
            name_ar: {
              [Op.substring]: req.query.searchKey,
            },
          },
          {
            name_en: {
              [Op.substring]: req.query.searchKey,
            },
          },
        ],
      },
    })
    .catch((error) => {
      return Response(res, 500, 'Fail to Count!', { error });
    });
  numRows = parseInt(numRows);

  //Total num of valid pages
  let numPages = Math.ceil(numRows / numPerPage);

  //Calc skip or offset to be used in limit
  let skip = (page - 1) * numPerPage;
  let _limit = numPerPage;

  //Query
  try {
    let data;
    if (doPagination) {
      data = await listUniversity_DoPagination(
        req,
        db_University,
        skip,
        _limit
      );
    } else {
      data = await listUniversity_NOPagination(req, db_University);
    }

    let result = {
      doPagination,
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

function listUniversity_DoPagination(req, db_University, skip, _limit) {
  return new Promise(async (resolve, reject) => {
    await db_University
      .findAll({
        where: {
          [Op.or]: [
            {
              name_ar: {
                [Op.substring]: req.query.searchKey,
              },
            },
            {
              name_en: {
                [Op.substring]: req.query.searchKey,
              },
            },
          ],
        },
        include: [
          {
            model: db_Faculty,
            include: [
              {
                model: db_Department,
                include: [
                  {
                    model: db_AcademicYear,
                    include: [
                      {
                        model: db_Subject,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        offset: skip,
        limit: _limit,
      })
      .catch((err) => {
        return reject(err);
      })
      .then((data) => {
        return resolve(data);
      });
  });
}

function listUniversity_NOPagination(req, db_University) {
  return new Promise(async (resolve, reject) => {
    await db_University
      .findAll({
        where: {
          [Op.or]: [
            {
              name_ar: {
                [Op.substring]: req.query.searchKey,
              },
            },
            {
              name_en: {
                [Op.substring]: req.query.searchKey,
              },
            },
          ],
        },
        include: [
          {
            model: db_Faculty,
            include: [
              {
                model: db_Department,
                include: [
                  {
                    model: db_AcademicYear,
                    include: [
                      {
                        model: db_Subject,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
      .catch((err) => {
        return reject(err);
      })
      .then((data) => {
        return resolve(data);
      });
  });
}
