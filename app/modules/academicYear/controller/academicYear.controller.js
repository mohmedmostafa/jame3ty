const db = require('../..');
const { Response } = require('../../../common/response/response.handler');
const {
  ResponseConstants,
} = require('../../../common/response/response.constants');

const {
  onErrorDeleteFiles,
  deleteFile,
} = require('../../../common/attachmentsUpload/multerConfig');
const moment = require('moment');
const { Sequelize } = require('../..');

const Op = db.Sequelize.Op;
const db_University = db.University;
const db_Faculty = db.Faculty;
const db_Course = db.Course;
const db_Group = db.Group;
const db_GroupSchedule = db.GroupSchedule;
const db_AcademicYear = db.AcademicYear;
const db_Department = db.Department;
const db_Subject = db.Subject;
const db_connection = db.connection;
const db_CourseSubscribe = db.CourseSubscribe;
const db_Student = db.Student;
const db_Lesson = db.Lesson;
const db_Instructor = db.Instructor;

//---------------------------------------------------------------
exports.addAcademicYear = async (req, res) => {
  try {
    //Check if the department is found
    const department = await db_Department.findByPk(
      parseInt(req.body.departmentId)
    );

    if (!department) {
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        {}
      );
    }

    //Start "Managed" Transaction
    const result = await db_connection.transaction(async (t) => {
      //Add Department to DB
      const academicYear = await db_AcademicYear.create(
        {
          name_ar: req.body.name_ar,
          name_en: req.body.name_en,
          departmentId: req.body.departmentId,
        },
        { transaction: t }
      );

      //Inject academicYearId into each subject belongs to the academicyear
      req.body.subjects.forEach((subject) => {
        subject.academicYearId = academicYear.id;
      });

      //Save Subjects to DB for the academicyear
      var subject = await db_Subject.bulkCreate(req.body.subjects, {
        fields: ['name_ar', 'name_en', 'academicYearId'],
        transaction: t,
      });

      return { academicYear };
    });

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { result }
    );
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Add!', { error });
  }
};

//---------------------------------------------------------------
exports.deleteAcademicYear = async (req, res) => {
  try {
    //Check if found
    const academicYear = await db_AcademicYear.findOne({
      where: { id: parseInt(req.params.id) },
      include: [
        {
          model: db_Subject,
        },
        {
          model: db_Student,
        },
      ],
    });

    if (!academicYear) {
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        {}
      );
    }

    //Check if has childs
    if (academicYear.subjects.length > 0 || academicYear.students.length > 0) {
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.code,
        ResponseConstants.HTTP_STATUS_CODES.CONFLICT.type
          .RESOURCE_HAS_DEPENDENTS,
        //"Can't delete the AcademicYear. It has childs",
        { academicYear }
      );
    }

    //Delete
    let deletedAcademicYear = await db_AcademicYear.destroy({
      where: { id: req.params.id },
    });

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { deletedAcademicYear }
    );
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Delete!', { error });
  }
};

//---------------------------------------------------------------
exports.updateAcademicYear = async (req, res) => {
  try {
    //Check if the Faculty is found
    const academicYear = await db_AcademicYear.findOne({
      where: { id: parseInt(req.params.id) },
    });

    if (!academicYear) {
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        {}
      );
    }

    await db_AcademicYear.update(
      {
        name_ar: req.body.name_ar ? req.body.name_ar : department.name_ar,
        name_en: req.body.name_en ? req.body.name_en : department.name_en,
      },
      { where: { id: req.params.id } }
    );

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      {}
    );
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
  }
};

//--------------------------------------------------------------
exports.listAcademicYearById = async (req, res) => {
  try {
    //Check if found
    const academicYear = await db_AcademicYear.findOne({
      where: { id: parseInt(req.params.id) },
      include: [
        {
          model: db_Subject,
        },
        {
          model: db_Department,
        },
      ],
    });

    if (!academicYear) {
      return Response(
        res,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.code,
        ResponseConstants.HTTP_STATUS_CODES.NOT_FOUND.type.RESOURCE_NOT_FOUND,
        {}
      );
    }

    //Success
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { academicYear }
    );
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Delete!', { error });
  }
};

//---------------------------------------------------------------
exports.listAcademicYear = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Count all rows
  let numRows = await db_AcademicYear
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
      //Do Pagination
      data = await listAcademicYear_DoPagination(
        req,
        db_AcademicYear,
        skip,
        _limit
      );
    } else {
      //Do Pagination
      data = await listAcademicYear_NOPagination(req, db_AcademicYear);
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
    return Response(
      res,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.code,
      ResponseConstants.HTTP_STATUS_CODES.SUCCESS.type.SUCCESS,
      { result }
    );
  } catch (error) {
    return Response(res, 500, 'Fail To Find!', { error });
  }
};

function listAcademicYear_NOPagination(req, db_AcademicYear) {
  return new Promise(async (resolve, reject) => {
    let departmentId = req.query.DepartmentId ? req.query.DepartmentId : '%%';

    await db_AcademicYear
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
            model: db_Subject,
          },
          {
            model: db_Department,
            where: { id: { [Op.like]: departmentId } },
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

function listAcademicYear_DoPagination(req, db_AcademicYear, skip, _limit) {
  return new Promise(async (resolve, reject) => {
    let departmentId = req.query.DepartmentId ? req.query.DepartmentId : '%%';

    await db_AcademicYear
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
            model: db_Subject,
          },
          {
            model: db_Department,
            where: { id: { [Op.like]: departmentId } },
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
