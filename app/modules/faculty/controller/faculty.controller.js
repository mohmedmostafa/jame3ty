const db = require('../..');
const { Response } = require('../../../common/response/response.handler');

const Op = db.Sequelize.Op;
const db_University = db.University;
const db_Faculty = db.Faculty;
const db_Department = db.Department;
const db_connection = db.connection;

//---------------------------------------------------------------
exports.addFaculty = async (req, res) => {
  try {
    //Check if the University is already exsits
    const university = await db_University.findByPk(
      parseInt(req.body.universityId)
    );

    if (!university) {
      return Response(res, 404, 'University Not Found!', {});
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
      return Response(res, 404, 'Faculty Not Found!', {});
    }

    //Check the universityId is changed
    if (req.body.universityId != faculty.universityId) {
      //Check if the University is already exsits
      const university = await db_University.findByPk(
        parseInt(req.body.universityId)
      );

      if (!university) {
        return Response(res, 404, 'University Not Found!', {});
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
    //Check if the faculty is already exsits
    let faculty = await db_Faculty.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: db_Department,
        },
      ],
    });

    if (!faculty) {
      return Response(res, 404, 'Faculty Not Found!', {});
    }

    faculty = faculty.get({ plain: true });

    //Check if the Universtiy has Faculty
    if (faculty.departments.length > 0) {
      return Response(res, 409, "Can't Delete. Has Childs", {
        faculty,
      });
    }

    //Delete
    faculty = await db_Faculty.destroy({
      where: { id: req.params.id },
    });

    //Success
    return Response(res, 200, 'Success!', { faculty });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
  }
};

//--------------------------------------------------------------
exports.listFacultyById = async (req, res) => {
  try {
    //Check if found
    const faculty = await db_Faculty.findOne({
      where: { id: parseInt(req.params.id) },
      include: [
        {
          model: db_Department,
        },
        {
          model: db_University,
        },
      ],
    });

    if (!faculty) {
      return Response(res, 404, 'Faculty Not Found!', {});
    }

    //Success
    return Response(res, 200, 'Success!', { faculty });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Find!', { error });
  }
};

//---------------------------------------------------------------
exports.listFaculty = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Count all rows
  let numRows = await db_Faculty
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
      data = await listFaculty_DoPagination(
        req,
        db_Faculty,
        db_Department,
        skip,
        _limit
      );
    } else {
      data = await listFaculty_NOPagination(req, db_Faculty, db_Department);
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

function listFaculty_DoPagination(
  req,
  db_Faculty,
  db_Department,
  skip,
  _limit
) {
  return new Promise(async (resolve, reject) => {
    //query paramter to filter faculties based on university id
    let universityId = req.query.universityId ? req.query.universityId : '%%';
    await db_Faculty
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
            model: db_Department,
          }, 
          
          
        ],
        order: [[{ model: db_University }, 'name_ar', 'DESC']],
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

function listFaculty_NOPagination(req, db_Faculty, db_Department) {
  return new Promise(async (resolve, reject) => {
    //query paramter to filter faculties based on university id
    let universityId = req.query.universityId ? req.query.universityId : '%%';

    await db_Faculty
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
            model: db_Department,
          },
          {
            model: db_University,
            where: { id: { [Op.like]: universityId } },
          },
        ],
        order: [[{ model: db_University }, 'name_ar', 'DESC']],
      })
      .catch((err) => {
        return reject(err);
      })
      .then((data) => {
        return resolve(data);
      });
  });
}
