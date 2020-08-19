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

db.User = require('./user/user.model.js')(connection, Sequelize);
db.Role = require('./role/role.model.js')(connection, Sequelize);
db.userRole = require('./userRole/userRole.model')(connection, Sequelize);
db.University = require('./university/university.model')(connection, Sequelize);
db.Faculty = require('./faculty/faculty.model')(connection, Sequelize);
db.Department = require('./department/department.model')(connection, Sequelize);
db.AcademicYear = require('./academicYear/academicYear.model')(
  connection,
  Sequelize
);
db.Subject = require('./subject/subject.model')(connection, Sequelize);
db.SubjectYearDept = require('./subjectYearDept/subjectYearDept.model')(
  connection,
  Sequelize
);
db.Instructor = require('./instructor/instructor.model')(connection, Sequelize);
db.Course = require('./courses/courses.model')(connection, Sequelize);
db.Student = require('./student/student.model')(connection, Sequelize);
db.Group = require('./group/group.model')(connection, Sequelize);
db.Lesson = require('./lesson/lesson.model')(connection, Sequelize);
db.AssignmentSubmission = require('./assignmentSubmission/assignmentSubmission.model')(
  connection,
  Sequelize
);
db.CourseSubscribe = require('./courseSubscribe/courseSubscribe.model')(
  connection,
  Sequelize
);
db.RatingAndReview = require('./courseSubscribe/ratingAndReview.model')(
  connection,
  Sequelize
);
db.GroupSchedule = require('./group/groupSchedule.model')(
  connection,
  Sequelize
);
db.LessonDiscussion = require('./lesson/lessonDiscussion.model')(
  connection,
  Sequelize
);
db.lessonDiscussionComment = require('./lesson/lessonDiscussionComments.model')(
  connection,
  Sequelize
);

module.exports = db;
