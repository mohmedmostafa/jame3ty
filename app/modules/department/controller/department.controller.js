const db = require('../..');
const { Response } = require('../../../common/response/response.handler');
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
exports.addDepartment = async (req, res) => {
  try {
    //Check if the Faculty is found
    const faculty = await db_Faculty.findByPk(parseInt(req.body.facultyId));

    if (!faculty) {
      return Response(res, 404, 'Faculty Not Found!', {});
    }

    //Start "Managed" Transaction
    const result = await db_connection.transaction(async (t) => {
      //Add Department to DB
      const department = await db_Department.create(
        {
          name_ar: req.body.name_ar,
          name_en: req.body.name_en,
          facultyId: req.body.facultyId,
        },
        { transaction: t }
      );

      //Add academicyears for that department
      for (let i in req.body.academicyears) {
        let academicyear = req.body.academicyears[i];

        //Add academicyears Info
        var year = await db_AcademicYear.create(
          {
            name_ar: academicyear.name_ar,
            name_en: academicyear.name_en,
            departmentId: department.id,
          },
          { transaction: t }
        );

        //Inject academicYearId into each subject belongs to the academicyear
        academicyear.subjects.forEach((subject) => {
          subject.academicYearId = year.id;
        });

        //Save Subjects to DB for the academicyear
        var subject = await db_Subject.bulkCreate(academicyear.subjects, {
          fields: ['name_ar', 'name_en', 'academicYearId'],
          transaction: t,
        });
      }

      return { department };
    });

    //Success
    return Response(res, 200, 'Success!', { result });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Add!', { error });
  }
};

//---------------------------------------------------------------
exports.deleteDepartment = async (req, res) => {
  try {
    //Check if found
    const department = await db_Department.findOne({
      where: { id: parseInt(req.params.id) },
      include: [
        {
          model: db_AcademicYear,
        },
      ],
    });

    if (!department) {
      return Response(res, 404, 'Department Not Found!', {});
    }

    if (department.academicYears.length > 0) {
      return Response(res, 409, "Can't delete the department. It has childs", {
        department,
      });
    }

    //Delete
    let deletedDepartment = await db_Department.destroy({
      where: { id: req.params.id },
    });

    //Success
    return Response(res, 200, 'Success!', { deletedDepartment });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Delete!', { error });
  }
};

//--------------------------------------------------------------
exports.listDepartmentById = async (req, res) => {
  try {
    //Check if found
    const department = await db_Department.findOne({
      where: { id: parseInt(req.params.id) },
      include: [
        {
          model: db_AcademicYear,
        },
        {
          model: db_Faculty,
        },
      ],
    });

    if (!department) {
      return Response(res, 404, 'Department Not Found!', {});
    }

    //Success
    return Response(res, 200, 'Success!', { department });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Delete!', { error });
  }
};

//---------------------------------------------------------------
exports.updateDepartment = async (req, res) => {
  try {
    //Check if the Faculty is found
    const department = await db_Department.findOne({
      where: { id: parseInt(req.params.id) },
    });

    if (!department) {
      return Response(res, 404, 'Department Not Found!', {});
    }

    await db_Department.update(
      {
        name_ar: req.body.name_ar ? req.body.name_ar : department.name_ar,
        name_en: req.body.name_en ? req.body.name_en : department.name_en,
      },
      { where: { id: req.params.id } }
    );

    //Success
    return Response(res, 200, 'Success!', {});
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Udpate!', { error });
  }
};

//---------------------------------------------------------------
exports.listDepartment = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Count all rows
  let numRows = await db_Department
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
      data = await listDepartment_DoPagination(
        req,
        db_Department,
        skip,
        _limit
      );
    } else {
      //Do Pagination
      data = await listDepartment_NOPagination(req, db_Department);
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

function listDepartment_NOPagination(req, db_Department) {
  return new Promise(async (resolve, reject) => {
    let facultyId=req.query.facultyId?req.query.facultyId:'%%';
    await db_Department
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
            model: db_AcademicYear,
          },
          {
            model: db_Faculty, where: {id:{[Op.like]:facultyId}}

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

function listDepartment_DoPagination(req, db_Department, skip, _limit) {
  return new Promise(async (resolve, reject) => {
    await db_Department
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
            model: db_AcademicYear,
          },
          {
            model: db_Faculty,
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
