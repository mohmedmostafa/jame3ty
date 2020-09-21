const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { upload } = require('./app/common/attachmentsUpload/multerConfig');
const { PORT, HOST, ENV } = require('./app/config/env.config');
const db = require('./app/modules');
const bcrypt = require('bcryptjs');

const app = express();

app.use('/public', express.static('public'));

// var corsOptions = {
//   origin: `${HOST}` + `${PORT}`,
// };
app.use(cors());

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static('public'));
app.set('view engine', 'ejs');
// check route
app.get('/', upload.none(), (req, res) => {
  // res.json({ message: 'Welcome to jame3ty application.' });
  res.render('index');
});

// routes
require('./app/modules/user/auth.routes')(app);
require('./app/modules/user/user.routes')(app);
require('./app/modules/university/university.routes')(app);
require('./app/modules/faculty/faculty.routes')(app);
require('./app/modules/instructor/instructor.routes')(app);
require('./app/modules/courses/courses.routes')(app);
require('./app/modules/group/group.routes')(app);
require('./app/modules/department/department.routes')(app);
require('./app/modules/academicYear/academicYear.routes')(app);
require('./app/modules/subject/subject.routes')(app);
require('./app/modules/lesson/lesson.routes')(app);
require('./app/modules/assignmentSubmission/assignmentSubmission.routes')(app);
require('./app/modules/lessonDiscussionComments/lessonDiscussionComments.routes')(
  app
);
require('./app/modules/student/student.routes')(app);
require('./app/modules/ratingAndReview/ratingAndReview.routes')(app);
require('./app/modules/courseSubscribe/courseSubscribe.routes')(app);

// set port, listen for requests
app.listen(process.env.PORT || PORT, () => {
  // console.log(corsOptions);
  console.log(
    `Server set up and running on port number: ${PORT}, environment: ${ENV}`
  );
  console.log(
    `Server set up and running on port number: ${process.env.PORT}, environment: ${process.env.NODE_ENV}`
  );
});

//--------------------------------------
//--------------------------------------
//--------------------------------------
//ٍSync DB Tables according to Models
//force: true will drop the table if it already exists

if (0) {
  db.connection
    .query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
    .then(async (result) => {
      await db.connection.sync({ force: true }).then((result) => {
        initial();
      });
    })
    .then((result) => {
      db.connection.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true });
    });
}

//Initialize tables with data such roles
async function initial() {
  const db_User = db.User;
  const db_UserRole = db.UserRole;
  const db_Role = db.Role;
  const db_University = db.University;
  const db_Faculty = db.Faculty;
  const db_Department = db.Department;
  const db_AcademicYear = db.AcademicYear;
  const db_Subject = db.Subject;
  const db_Instructor = db.Instructor;
  const db_connection = db.connection;
  const Op = db.Sequelize.Op;

  //--------------------------------------------------
  /////////////////Role//////////////////////////////
  //--------------------------------------------------
  const ROLES_EN = ['admin', 'student', 'instructor'];
  const ROLES_AR = ['مدير', 'طالب', 'محاضر'];

  await db_Role.create({
    id: 1,
    name_ar: ROLES_AR[0],
    name_en: ROLES_EN[0],
  });
  await db_Role.create({
    id: 2,
    name_ar: ROLES_AR[1],
    name_en: ROLES_EN[1],
  });
  await db_Role.create({
    id: 3,
    name_ar: ROLES_AR[2],
    name_en: ROLES_EN[2],
  });

  //--------------------------------------------------
  /////////////////University/////////////////////////
  //--------------------------------------------------
  let university = await db_University.create({
    name_ar: 'جامعه الكويت',
    name_en: 'Kweit Universtiy',
  });

  let faculty = await db_Faculty.create({
    name_ar: 'الطب',
    name_en: 'Medical',
    universityId: university.id,
  });

  let department = await db_Department.create({
    name_ar: 'جراحه',
    name_en: 'PalaPalaPalaPala',
    facultyId: faculty.id,
  });

  let academicYear = await db_AcademicYear.create({
    name_ar: 'سنه أولى',
    name_en: '1th',
    departmentId: department.id,
  });

  let subject = await db_Subject.create({
    name_ar: 'ماده 1',
    name_en: 'subject 1',
    academicYearId: academicYear.id,
  });
}

/*
async function signup(
  db_connection,
  db_User,
  db_Role,
  Op,
  username,
  email,
  password,
  rol
) {
  //Get all info about roles attached with the new account
  const roles = await db_Role.findAll({
    where: {
      name_en: {
        [Op.in]: [rol.split(',')],
      },
    },
  });

  //Start "Managed" Transaction
  const adminUser = await db_connection.transaction(async (t) => {
    //Save the new account to DB
    const user = await db_User.create(
      {
        username: username,
        email: email,
        password: bcrypt.hashSync(password, 8),
      },
      { transaction: t }
    );

    //Add the roles to the new user
    await user.setRoles(roles, { transaction: t });

    return user;
  });
}*/
