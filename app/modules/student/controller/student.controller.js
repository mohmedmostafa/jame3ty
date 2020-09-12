const db = require('../..');
const { Response } = require('../../../common/response.handler');
const { ValidateResponse } = require('../../../common/response.handler');
const helper = require('../../../common/helper');
const email = require('../../../common/email');
const {
  onErrorDeleteFiles,
  deleteFile,
} = require('../../../common/multerConfig');
const moment = require('moment');
const { Sequelize } = require('../..');
const bcrypt = require('bcryptjs');

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
const db_User = db.User;
const db_Role = db.Role;
const db_UserRole = db.UserRole;

//---------------------------------------------------------------
exports.addStudent = async (req, res) => {
  try {
    //--------------------
    //Check if not Unique
    let user = await db_User.findOne({
      where: {
        username: req.body.username,
      },
    });

    if (user) {
      onErrorDeleteFiles(req);
      return Response(res, 409, 'Username already exists!', {});
    }

    user = await db_User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (user) {
      onErrorDeleteFiles(req);
      return Response(res, 409, 'Email already exists!', {});
    }

    //
    let student = await db_Student.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (student) {
      onErrorDeleteFiles(req);
      return Response(res, 409, 'Email already exists!', {});
    }

    //
    student = await db_Student.findOne({
      where: {
        mobile: req.body.mobile,
      },
    });

    if (student) {
      onErrorDeleteFiles(req);
      return Response(res, 409, 'Mobile already exists!', {});
    }
    //--------------------

    //Create Attachment String
    if (req.files.img) {
      let field_1 = [];
      req.files['img'].forEach((file) => {
        let fileUrl = file.path.replace(/\\/g, '/');
        field_1.push(fileUrl);
      });
      req.body.img = field_1.join();
    }

    //Start "Managed" Transaction
    let result = await db_connection.transaction(async (t) => {
      //const randomToken = await email.generateRandomToken({ byteLength: 10 });
      const randomToken = Math.floor(100000 + Math.random() * 900000);

      //Save User to DB
      const user = await db_User.create(
        {
          username: req.body.username,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 8),
          isVerified: 0,
          lastVerificationCodeSend: randomToken,
          lasVerificationCodeCreatedAt: moment(),
          lasVerificationCodeExpireAt: moment().add(1, 'd'),
        },
        { transaction: t }
      );

      //Save to Student DB
      const student = await db_Student.create(
        {
          name: req.body.name,
          mobile: req.body.mobile,
          email: req.body.email,
          img: req.body.img,
          academicYearId: req.body.academicYearId,
          userId: user.id,
        },
        { transaction: t }
      );

      //Roles
      const role = await db_Role.findOne({
        where: {
          name_en: {
            [Op.eq]: ['student'],
          },
        },
      });

      console.log(role);

      //Save to Student DB
      const userRole = await db_UserRole.create(
        {
          userId: user.id,
          roleId: role.id,
        },
        { transaction: t }
      );

      return { student, user, userRole, randomToken };
    });

    //Send Verification Email with Code
    await email
      .sendSignupVerificationEmail(result.randomToken, req.body.email)
      .catch((err) => {
        console.error(err.message);
        return Response(
          res,
          502,
          'Failed to Send Verification Code to ' + req.body.email,
          { err }
        );
      });

    //Success
    return Response(res, 200, 'Success!', { result });
  } catch (error) {
    console.log(error);
    onErrorDeleteFiles(req);
    return Response(res, 500, 'Fail to Add!', { error });
  }
};

//---------------------------------------------------------------
exports.deleteStudent = async (req, res) => {
  try {
    // //Check if the Course is already exsits
    // let student = await db_Student.findOne({
    //   where: {
    //     id: req.params.id,
    //   },
    //   include: [
    //     {
    //       model: db_CourseSubscribe,
    //     },
    //   ],
    // });

    // if (!student) {
    //   return Response(res, 404, 'Student Not Found!', {});
    // }

    // //If Students Subscribe the course then can not delete it
    // if (student.courseSubscribes.length > 0) {
    //   return Response(
    //     res,
    //     409,
    //     "Can't delete the student, The Student has subscription!",
    //     { course }
    //   );
    // }

    //Success
    return Response(res, 200, 'Success!', { student });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Delete!', { error });
  }
};

//--------------------------------------------------------------
exports.listStudentById = async (req, res) => {
  try {
    let user = await db_User.findOne({
      include: [
        {
          model: db_Student,
          where: {
            id: req.params.id,
          },
          include: [
            {
              model: db_AcademicYear,
              include: [
                {
                  model: db_Department,
                  include: [
                    {
                      model: db_Faculty,
                      include: [
                        {
                          model: db_University,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              model: db_CourseSubscribe,
            },
          ],
        },
      ],
    });

    if (!user) {
      return Response(res, 404, 'Student Not Found!', {});
    }

    //Success
    return Response(res, 200, 'Success!', { user });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Find!', { error });
  }
};

//--------------------------------------------------------------
exports.listStudentByUserId = async (req, res) => {
  try {
    let user = await db_User.findOne({
      where: {
        id: req.params.userId,
      },
      include: [
        {
          model: db_Student,
          include: [
            {
              model: db_AcademicYear,
              include: [
                {
                  model: db_Department,
                  include: [
                    {
                      model: db_Faculty,
                      include: [
                        {
                          model: db_University,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              model: db_CourseSubscribe,
            },
          ],
        },
      ],
    });

    if (!user) {
      return Response(res, 404, 'Student Not Found!', {});
    }

    //Success
    return Response(res, 200, 'Success!', { user });
  } catch (error) {
    console.log(error);
    return Response(res, 500, 'Fail to Find!', { error });
  }
};

//---------------------------------------------------------------
exports.updateStudent = async (req, res) => {
  try {
    //Check if already exsits
    let student = await db_Student.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: db_User,
        },
      ],
    });

    if (!student) {
      onErrorDeleteFiles(req);
      return Response(res, 404, 'Student Not Found!', {});
    }

    console.log(student);

    //--------------------
    //Check if not Unique
    let stu = await db_Student.findOne({
      where: {
        mobile: req.body.mobile,
        id: {
          [Op.ne]: req.params.id,
        },
      },
    });

    if (stu) {
      onErrorDeleteFiles(req);
      return Response(res, 409, 'Mobile already exists!', {});
    }
    //--------------------

    //Create Attachment String
    if (req.files.img) {
      let field_1 = [];
      req.files['img'].forEach((file) => {
        let fileUrl = file.path.replace(/\\/g, '/');
        field_1.push(fileUrl);
      });
      req.body.img = field_1.join();
    }

    //Start "Managed" Transaction
    const result = await db_connection.transaction(async (t) => {
      //Save User to DB
      const userUpdated = await db_User.update(
        {
          username: req.body.username ? req.body.username : student.username,
          email: req.body.email ? req.body.email : student.email,
          password: req.body.password
            ? bcrypt.hashSync(req.body.password, 8)
            : student.password,
        },
        { where: { id: student.user.id } },
        { transaction: t }
      );

      //Save to Student DB
      const studentUpdated = await db_Student.update(
        {
          name: req.body.name ? req.body.name : student.name,
          mobile: req.body.mobile ? req.body.mobile : student.mobile,
          email: req.body.email ? req.body.email : student.email,
          img: req.body.img ? req.body.img : student.getDataValue('img'),
          academicYearId: req.body.academicYearId
            ? req.body.academicYearId
            : student.academicYearId,
        },
        { where: { id: req.params.id } },
        { transaction: t }
      );

      if (studentUpdated && req.body.img) {
        let imgStr = student.getDataValue('img');
        if (imgStr.length > 0) {
          let locations = imgStr.split(',');
          console.log(locations);
          locations.forEach((loc) => {
            deleteFile(loc);
          });
        }
      }

      return { studentUpdated, userUpdated };
    });

    //Success
    return Response(res, 200, 'Success!', { result });
  } catch (error) {
    console.log(error);
    onErrorDeleteFiles(req);
    return Response(res, 500, 'Fail to Udpate!', { error });
  }
};

//---------------------------------------------------------------
exports.listStudent = async (req, res) => {
  const doPagination = parseInt(req.query.doPagination);
  const numPerPage = parseInt(req.query.numPerPage);
  const page = parseInt(req.query.page);

  //Count all rows
  let numRows = await db_Student
    .count({
      where: {
        [Op.or]: [
          {
            name: {
              [Op.substring]: req.query.searchKey,
            },
          },
          {
            email: {
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
      data = await listStudent_DoPagination(
        req,
        db_Student,
        db_User,
        db_CourseSubscribe,
        skip,
        _limit
      );
    } else {
      data = await listStudent_NOPagination(
        req,
        db_Student,
        db_User,
        db_CourseSubscribe
      );
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

function listStudent_DoPagination(
  req,
  db_Student,
  db_User,
  db_CourseSubscribe,
  skip,
  _limit
) {
  return new Promise(async (resolve, reject) => {
    await db_Student
      .findAll({
        where: {
          [Op.or]: [
            {
              name: {
                [Op.substring]: req.query.searchKey,
              },
            },
            {
              email: {
                [Op.substring]: req.query.searchKey,
              },
            },
          ],
        },
        include: [
          {
            model: db_User,
          },
          {
            model: db_AcademicYear,
            include: [
              {
                model: db_Department,
                include: [
                  {
                    model: db_Faculty,
                    include: [
                      {
                        model: db_University,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_CourseSubscribe,
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

function listStudent_NOPagination(
  req,
  db_Student,
  db_User,
  db_CourseSubscribe
) {
  return new Promise(async (resolve, reject) => {
    await db_Student
      .findAll({
        where: {
          [Op.or]: [
            {
              name: {
                [Op.substring]: req.query.searchKey,
              },
            },
            {
              email: {
                [Op.substring]: req.query.searchKey,
              },
            },
          ],
        },
        include: [
          {
            model: db_User,
          },
          {
            model: db_AcademicYear,
            include: [
              {
                model: db_Department,
                include: [
                  {
                    model: db_Faculty,
                    include: [
                      {
                        model: db_University,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db_CourseSubscribe,
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
