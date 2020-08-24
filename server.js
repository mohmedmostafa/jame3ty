const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { upload } = require('./app/common/multerConfig');
const { PORT, ENV } = require('./app/config/env.config');
const db = require('./app/modules');

const app = express();

app.use('/static', express.static(path.join(__dirname, 'public')));

var corsOptions = {
  origin: 'http://localhost:' + `${PORT}`,
};
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// check route
app.get('/', upload.none(), (req, res) => {
  res.json({ message: 'Welcome to jame3ty application.' });
});

// routes
require('./app/modules/user/auth.routes')(app);
require('./app/modules/user/user.routes')(app);
require('./app/modules/university/university.routes')(app);
require('./app/modules/faculty/faculty.routes')(app);
require('./app/modules/courses/courses.routes')(app);

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
  //--------------------------------------------------
  /////////////////Role//////////////////////////////
  //--------------------------------------------------
  const ROLES_EN = ['student', 'admin', 'instructor'];
  const ROLES_AR = ['طالب', 'مدير', 'محاضر'];
  const Role = db.Role;
  Role.create({
    id: 1,
    name_ar: ROLES_AR[0],
    name_en: ROLES_EN[0],
  });
  Role.create({
    id: 2,
    name_ar: ROLES_AR[1],
    name_en: ROLES_EN[1],
  });
  Role.create({
    id: 3,
    name_ar: ROLES_AR[2],
    name_en: ROLES_EN[2],
  });
}
