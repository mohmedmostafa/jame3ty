const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { upload } = require('./app/common/multerConfig');
const { PORT, HOST, ENV } = require('./app/config/env.config');
const db = require('./app/modules');

const app = express();

app.use('/public', express.static('public'));

var corsOptions = {
  origin: `${HOST}` + `${PORT}`,
};
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public',express.static('public'));
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
require('./app/modules/instructor/instructor.routes')(app)
require('./app/modules/courses/courses.routes')(app);
require('./app/modules/group/group.routes')(app);
require('./app/modules/department/department.routes')(app);
require('./app/modules/academicYear/academicYear.routes')(app);
require('./app/modules/subject/subject.routes')(app);
require('./app/modules/lesson/lesson.routes')(app);

// set port, listen for requests
app.listen(PORT, () => {
  console.log(
    `Server set up and running on port number: ${PORT}, environment: ${ENV}`
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
function initial() {
  const db_Role = db.Role;
  const db_University = db.University;
  const db_Faculty = db.Faculty;
  const db_Department = db.Department;
  const db_AcademicYear = db.AcademicYear;
  const db_Subject = db.Subject;
  const db_Instructor = db.Instructor;

  //--------------------------------------------------
  /////////////////Role//////////////////////////////
  //--------------------------------------------------
  const ROLES_EN = ['student', 'admin', 'instructor'];
  const ROLES_AR = ['طالب', 'مدير', 'محاضر'];

  db_Role.create({
    id: 1,
    name_ar: ROLES_AR[0],
    name_en: ROLES_EN[0],
  });
  db_Role.create({
    id: 2,
    name_ar: ROLES_AR[1],
    name_en: ROLES_EN[1],
  });
  db_Role.create({
    id: 3,
    name_ar: ROLES_AR[2],
    name_en: ROLES_EN[2],
  });

  //--------------------------------------------------
  /////////////////University/////////////////////////
  //--------------------------------------------------
  let university = db_University.create({
    name_ar: 'جامعه الكويت',
    name_en: 'Kweit Universtiy',
  });

  let faculty = db_Faculty.create({
    name_ar: 'الطب',
    name_en: 'Medical',
    universityId: university.id,
  });

  let department = db_Department.create({
    name_ar: 'جراحه',
    name_en: 'PalaPalaPalaPala',
    facultyId: faculty.id,
  });

  let academicYear = db_AcademicYear.create({
    name_ar: 'سنه أولى',
    name_en: '1th',
    departmentId: department.id,
  });

  let subject = db_Subject.create({
    name_ar: 'ماده 1',
    name_en: 'subject 1',
    academicYearId: academicYear.id,
  });
}
