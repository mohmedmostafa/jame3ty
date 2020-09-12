const db = require('../..');
const { Response } = require('../../../common/response.handler');
const {
  onErrorDeleteFiles,
  deleteFile,
} = require('../../../common/multerConfig');
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
exports.addSubject = async (req, res) => {
  try {
    //Check if the academicYear is found
    const academicYear = await db_AcademicYear.findByPk(
      parseInt(req.body.academicYearId)
    );

    if (!academicYear) {
      return Response(res, 404, 'AcademicYear Not Found!', {});
    }

    //Add Department to DB
    const subject = await db_Subject.create({
      name_ar: req.body.name_ar,
      name_en: req.body.name_en,
      academicYearId: req.body.academicYearId,
    });

    //Success
    return Response(res, 200, 'Success!', { subject });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Add!', { error });
  }
};

//---------------------------------------------------------------
exports.deleteSubject = async (req, res) => {
  try {
    //Check if found
    const subject = await db_Subject.findOne({
      where: { id: parseInt(req.params.id) },
      include: [
        {
          model: db_Course,
        },
      ],
    });

    if (!subject) {
      return Response(res, 404, 'Subject Not Found!', {});
    }

    //Check if has childs
    if (subject.courses.length > 0) {
      return Response(res, 409, "Can't delete the Subject. It has childs", {
        subject,
      });
    }

    //Delete
    let deletedSubject = await db_Subject.destroy({
      where: { id: req.params.id },
    });

    //Success
    return Response(res, 200, 'Success!', { deletedSubject });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Delete!', { error });
  }
};

//---------------------------------------------------------------
exports.updateSubject = async (req, res) => {
  try {
    //Check if the Faculty is found
    const subject = await db_Subject.findOne({
      where: { id: parseInt(req.params.id) },
    });

    if (!subject) {
      return Response(res, 404, 'Subject Not Found!', {});
    }

    await db_Subject.update(
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

//--------------------------------------------------------------
exports.listSubjectById = async (req, res) => {
  try {
    //Check if found
    const subject = await db_Subject.findOne({
      where: { id: parseInt(req.params.id) },
      include: [
        {
          model: db_Course,
        },
        {
          model: db_AcademicYear,
        },
      ],
    });

    if (!subject) {
      return Response(res, 404, 'Subject Not Found!', {});
    }

    //Success
    return Response(res, 200, 'Success!', { subject });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Find!', { error });
  }
};

//---------------------------------------------------------------
exports.listSubject = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Count all rows
  let numRows = await db_Subject
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
      data = await listSubject_DoPagination(req, db_Subject, skip, _limit);
    } else {
      //Do Pagination
      data = await listSubject_NOPagination(req, db_Subject);
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

function listSubject_NOPagination(req, db_Subject) {
  return new Promise(async (resolve, reject) => {
    let yearId=req.query.yearId?req.query.yearId:'%%';
    await db_Subject
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
            model: db_Course,
          },
          {
            model: db_AcademicYear, where: {id:{[Op.like]:yearId}}
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

function listSubject_DoPagination(req, db_AcademicYear, skip, _limit) {
  return new Promise(async (resolve, reject) => {
     await db_Subject
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
            model: db_Course,
          },
          {
            model: db_AcademicYear
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
