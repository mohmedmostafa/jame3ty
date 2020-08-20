const db_config = require('../config/db.config.js');
const Sequelize = require('sequelize');

const connection = new Sequelize(
  db_config.DB,
  db_config.USER,
  db_config.PASSWORD,
  {
    host: db_config.HOST,
    port: db_config.PORT,
    dialect: db_config.dialect,
    operatorsAliases: '0',
    pool: {
      max: db_config.pool.max,
      min: db_config.pool.min,
      acquire: db_config.pool.acquire,
      idle: db_config.pool.idle,
    },
  }
);

const db = {};

db.Sequelize = Sequelize;
db.connection = connection;

//Models
db.User = require('./user.model.js')(connection, Sequelize);
db.Role = require('./role.model.js')(connection, Sequelize);
db.UserRole = require('./userRole.model')(connection, Sequelize);
//Relations
db.User.belongsToMany(db.Role, {
  through: 'userRoles',
  foreignKey: 'userId',
});
db.Role.belongsToMany(db.User, {
  through: 'userRoles',
  foreignKey: 'roleId',
});
//
db.University = require('./university.model')(connection, Sequelize);
db.Faculty = require('./faculty.model')(connection, Sequelize);
db.University.hasMany(db.Faculty, {
  foreignKey: 'universityId',
});
db.Faculty.belongsTo(db.University);
//
db.Department = require('./department.model')(connection, Sequelize);
db.AcademicYear = require('./academicYear.model')(connection, Sequelize);
db.Subject = require('./subject.model')(connection, Sequelize);
db.SubjectYearDept = require('./subjectYearDept.model')(connection, Sequelize);
db.Instructor = require('./instructor.model')(connection, Sequelize);
db.Course = require('./courses.model')(connection, Sequelize);
db.Student = require('./student.model')(connection, Sequelize);
db.Group = require('./group.model')(connection, Sequelize);
db.Lesson = require('./lesson.model')(connection, Sequelize);
db.AssignmentSubmission = require('./assignmentSubmission.model')(
  connection,
  Sequelize
);
db.CourseSubscribe = require('./courseSubscribe.model')(connection, Sequelize);
db.RatingAndReview = require('./ratingAndReview.model')(connection, Sequelize);
db.GroupSchedule = require('./groupSchedule.model')(connection, Sequelize);
db.LessonDiscussion = require('./lessonDiscussion.model')(
  connection,
  Sequelize
);
db.lessonDiscussionComment = require('./lessonDiscussionComments.model')(
  connection,
  Sequelize
);

//-----------------------

//
module.exports = db;
