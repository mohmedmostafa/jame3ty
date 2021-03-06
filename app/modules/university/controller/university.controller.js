const db = require('../../../modules');
const {
  Response,
  ResponseConstants,
} = require('../../../common/response/response.handler');

const Op = db.Sequelize.Op;
const db_University = db.University;
const db_Faculty = db.Faculty;
const db_Department = db.Department;
const db_AcademicYear = db.AcademicYear;
const db_Subject = db.Subject;
const db_Course = db.Course;
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
      let allFaculties = [];
      req.body.faculties.forEach((faculty) => {
        faculty.universityId = university.id;
        //
        let fc = {};
        fc.name_ar = faculty.faculty_name_ar;
        fc.name_en = faculty.faculty_name_en;
        fc.universityId = faculty.universityId;
        allFaculties.push(fc);
      });

      //

      //Save Faculties to DB for the university
      await db_Faculty.bulkCreate(allFaculties, {
        fields: ['name_ar', 'name_en', 'universityId'],
        transaction: t,
      });

      return { university };
    });

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.CREATED.code,
      ResponseConstants.HTTP_STATUS_CODES.CREATED.type.RECOURSE_CREATED,
      ResponseConstants.ERROR_MESSAGES.RECOURSE_CREATED
    );
  } catch (error) {
    console.log(error);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
        .ORM_OPERATION_FAILED,
      ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
    );
  }
};

//---------------------------------------------------------------
exports.updateUniversity = async (req, res) => {
  try {
    //Check if the University is already exsits
    let university = await db_University.findByPk(req.params.id);

    if (!university) {
      console.log('!university');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_UNIVERSITY
      );
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
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      ResponseConstants.ERROR_MESSAGES.SUCCESS
    );
  } catch (error) {
    console.log(error);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
        .ORM_OPERATION_FAILED,
      ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
    );
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
      console.log('!university');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_UNIVERSITY
      );
    }

    university = university.get({ plain: true });

    //Check if the Universtiy has Faculty
    if (university.faculties.length > 0) {
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.code,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.type
          .RESOURCE_HAS_DEPENDENTS,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_HAS_DEPENDENTS
      );
    }

    //Delete
    university = await db_University.destroy({
      where: { id: req.params.id },
    });

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      ResponseConstants.ERROR_MESSAGES.SUCCESS
    );
  } catch (error) {
    console.log(error);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
        .ORM_OPERATION_FAILED,
      ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
    );
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
          include: [
            {
              model: db_Department,
              include: [
                {
                  model: db_AcademicYear,
                  include: [
                    {
                      model: db_Subject,
                      include: [
                        {
                          model: db_Course,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!university) {
      console.log('!university');
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        ResponseConstants.ERROR_MESSAGES.RESOURCE_NOT_FOUND_UNIVERSITY
      );
    }

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { university }
    );
  } catch (error) {
    console.log(error);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
        .ORM_OPERATION_FAILED,
      ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
    );
  }
};

//---------------------------------------------------------------
exports.listUniversity = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Calc skip or offset to be used in limit
  let skip = (page - 1) * numPerPage;
  let _limit = numPerPage;

  //Query
  try {
    let data;
    if (doPagination) {
      data = await listUniversity_DoPagination(req, skip, _limit);
    } else {
      data = await listUniversity_NOPagination(req);
    }

    //Total num of valid pages
    let numPages = Math.ceil(data.count / numPerPage);
    let result = {
      doPagination,
      numRows: data.count,
      numPerPage,
      numPages,
      page,
      data: data.rows,
    };

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { result }
    );
  } catch (error) {
    console.log(error);
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.code,
      ResponseConstants.HTTP_STATUS_CODES.INTERNAL_ERROR.type
        .ORM_OPERATION_FAILED,
      ResponseConstants.ERROR_MESSAGES.ORM_OPERATION_FAILED
    );
  }
};

function listUniversity_DoPagination(req, skip, _limit) {
  return new Promise(async (resolve, reject) => {
    await db_University
      .findAndCountAll({
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
                        include: [
                          {
                            model: db_Course,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        distinct: true,
        offset: skip,
        limit: _limit,
      })
      .catch((err) => {
        console.log(err);
        return reject(err);
      })
      .then((data) => {
        return resolve(data);
      });
  });
}

function listUniversity_NOPagination(req) {
  return new Promise(async (resolve, reject) => {
    await db_University
      .findAndCountAll({
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
                        include: [
                          {
                            model: db_Course,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        distinct: true,
      })
      .catch((err) => {
        console.log(err);
        return reject(err);
      })
      .then((data) => {
        return resolve(data);
      });
  });
}
