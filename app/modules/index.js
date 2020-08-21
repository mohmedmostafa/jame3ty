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
db.User = require('../modules/user/model/user.model.js')(connection, Sequelize);
db.Role = require('../modules/role/model/role.model.js')(connection, Sequelize);
db.UserRole = require('../modules/userRole/model/userRole.model')(
  connection,
  Sequelize
);
db.University = require('../modules/university/model/university.model')(
  connection,
  Sequelize
);
db.Faculty = require('../modules/faculty/model/faculty.model')(
  connection,
  Sequelize
);
db.Department = require('../modules/department/model/department.model')(
  connection,
  Sequelize
);
db.AcademicYear = require('../modules/academicYear/model/academicYear.model')(
  connection,
  Sequelize
);
db.Subject = require('../modules/subject/model/subject.model')(
  connection,
  Sequelize
);
db.SubjectYearDept = require('../modules/subjectYearDept/model/subjectYearDept.model')(
  connection,
  Sequelize
);
db.Instructor = require('../modules/instructor/model/instructor.model')(
  connection,
  Sequelize
);
db.Course = require('../modules/courses/model/courses.model')(
  connection,
  Sequelize
);
db.Student = require('../modules/student/model/student.model')(
  connection,
  Sequelize
);
db.Group = require('../modules/group/model/group.model')(connection, Sequelize);
db.Lesson = require('../modules/lesson/model/lesson.model')(
  connection,
  Sequelize
);
db.AssignmentSubmission = require('../modules/assignmentSubmission/model/assignmentSubmission.model')(
  connection,
  Sequelize
);
db.CourseSubscribe = require('../modules/courseSubscribe/model/courseSubscribe.model')(
  connection,
  Sequelize
);
db.RatingAndReview = require('../modules/ratingAndReview/model/ratingAndReview.model')(
  connection,
  Sequelize
);
db.GroupSchedule = require('../modules/groupSchedule/model/groupSchedule.model')(
  connection,
  Sequelize
);
db.LessonDiscussion = require('../modules/lessonDiscussion/model/lessonDiscussion.model')(
  connection,
  Sequelize
);
db.lessonDiscussionComment = require('../modules/lessonDiscussionComments/model/lessonDiscussionComments.model')(
  connection,
  Sequelize
);

//-----------------------
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
db.University.hasMany(db.Faculty, {
  foreignKey: 'universityId',
});
db.Faculty.belongsTo(db.University);
//

module.exports = db;
