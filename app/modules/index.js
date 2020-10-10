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
db.GroupSchedule = require('./group/model/groupSchedule.model')(
  connection,
  Sequelize
);
db.LessonDiscussion = require('../modules/lessonDiscussionComments/model/lessonDiscussion.model')(
  connection,
  Sequelize
);
db.lessonDiscussionComment = require('../modules/lessonDiscussionComments/model/lessonDiscussionComments.model')(
  connection,
  Sequelize
);
db.Payment = require('../modules/courseSubscribe/model/payment.model')(
  connection,
  Sequelize
);
db.ConfigForMobile = require('./configForMobile/configForMobile.model')(
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
//
db.University.hasMany(db.Faculty, {
  foreignKey: 'universityId',
});
db.Faculty.belongsTo(db.University);
//
//
db.Faculty.hasMany(db.Department, {
  foreignKey: 'facultyId',
});
db.Department.belongsTo(db.Faculty);
//
//
db.Department.hasMany(db.AcademicYear, {
  foreignKey: 'departmentId',
});
db.AcademicYear.belongsTo(db.Department);
//
//
db.AcademicYear.hasMany(db.Subject, {
  foreignKey: '',
});
db.Subject.belongsTo(db.AcademicYear);
//
//
db.Subject.hasMany(db.Course, {
  foreignKey: 'subjectId',
});
db.Course.belongsTo(db.Subject);
//
//
db.Course.hasMany(db.Group, {
  foreignKey: 'courseId',
});
db.Group.belongsTo(db.Course);
//
//
db.Instructor.hasMany(db.Course, {
  foreignKey: 'instructorId',
});
db.Course.belongsTo(db.Instructor);
//
//
db.Group.hasMany(db.GroupSchedule, {
  foreignKey: 'groupId',
});
db.GroupSchedule.belongsTo(db.Group);
//
//
db.Course.hasMany(db.Lesson, {
  foreignKey: 'courseId',
});
db.Lesson.belongsTo(db.Course);
//
//
db.Group.hasMany(db.Lesson, {
  foreignKey: 'groupId',
});
db.Lesson.belongsTo(db.Group);
//
//
db.Instructor.hasMany(db.Group, {
  foreignKey: 'instructorId',
});
db.Group.belongsTo(db.Instructor);
//
//
db.Instructor.belongsTo(db.User, { onDelete: 'CASCADE', hooks: true });
db.User.hasOne(db.Instructor, {
  foreignKey: 'userId',
});
//
//
db.Student.belongsTo(db.User);
db.User.hasOne(db.Student, {
  foreignKey: 'userId',
});
//
//
db.Student.hasMany(db.AssignmentSubmission, {
  foreignKey: 'studentId',
});
db.AssignmentSubmission.belongsTo(db.Student);
//
//
db.Lesson.hasMany(db.AssignmentSubmission, {
  foreignKey: 'lessonId',
});
db.AssignmentSubmission.belongsTo(db.Lesson);
//
//
db.AcademicYear.hasMany(db.Student, {
  foreignKey: 'academicYearId',
});
db.Student.belongsTo(db.AcademicYear);
//
//
db.Lesson.hasMany(db.LessonDiscussion, {
  foreignKey: 'lessonId',
});
db.LessonDiscussion.belongsTo(db.Lesson);
//
//
db.User.hasMany(db.LessonDiscussion, {
  foreignKey: 'userId',
});
db.LessonDiscussion.belongsTo(db.User);
//
//
db.User.hasMany(db.lessonDiscussionComment, {
  foreignKey: 'userId',
});
db.lessonDiscussionComment.belongsTo(db.User);
//
//
db.LessonDiscussion.hasMany(db.lessonDiscussionComment, {
  foreignKey: 'lessonDiscussionId',
});
db.lessonDiscussionComment.belongsTo(db.LessonDiscussion);
//
//
db.Student.hasMany(db.CourseSubscribe, {
  foreignKey: 'studentId',
});
db.CourseSubscribe.belongsTo(db.Student);
//
//
db.Course.hasMany(db.CourseSubscribe, {
  foreignKey: 'courseId',
});
db.CourseSubscribe.belongsTo(db.Course);
//
//
db.Group.hasMany(db.CourseSubscribe, {
  foreignKey: 'groupId',
});
db.CourseSubscribe.belongsTo(db.Group);
//
//
db.CourseSubscribe.hasMany(db.RatingAndReview, {
  foreignKey: 'courseSubscribeId',
});
db.RatingAndReview.belongsTo(db.CourseSubscribe);
//
//
db.CourseSubscribe.hasMany(db.Payment, {
  foreignKey: 'courseSubscribeId',
});
db.Payment.belongsTo(db.CourseSubscribe);
//
db.Lesson.hasMany(db.LessonDiscussion, {
  foreignKey: 'lessonId',
});
db.LessonDiscussion.belongsTo(db.Lesson);
//
db.LessonDiscussion.hasMany(db.lessonDiscussionComment, {
  foreignKey: 'lessonDiscussionId',
});
db.lessonDiscussionComment.belongsTo(db.LessonDiscussion);

module.exports = db;
