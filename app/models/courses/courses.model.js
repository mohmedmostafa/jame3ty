const University = require('../university/university.model');
module.exports = (connection, Sequelize) => {
  const Course = connection.define(
    'courses',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name_ar: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      name_en: {
        type: Sequelize.STRING(255),
      },
      code: {
        type: Sequelize.STRING(255),
      },
      desc: {
        type: Sequelize.STRING(500),
      },
      prerequisiteText: {
        type: Sequelize.STRING(500),
      },
      whatYouWillLearn: {
        type: Sequelize.STRING(255),
      },
      numOfLessons: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      price: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      priceAfterDiscount: {
        type: Sequelize.DOUBLE,
      },
      startDate: {
        type: Sequelize.DATE(3),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('Assignment', 'Subject'),
        allowNull: false,
      },
      method: {
        type: Sequelize.ENUM('Live Streaming', 'Recorded Lessons'),
        allowNull: false,
      },
      subjectYearDept_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'subjectYearDept',
          key: 'id',
        },
      },
      instructor_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'instructors',
          key: 'id',
        },
      },
      createdAt: {
        type: Sequelize.DATE(3),
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE(3),
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)'
        ),
        allowNull: false,
      },
    },
    { freezeTableName: true }
  );

  return Course;
};
