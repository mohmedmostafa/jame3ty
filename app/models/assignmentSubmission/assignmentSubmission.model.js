const University = require('../university/university.model');
module.exports = (connection, Sequelize) => {
  const AssignmentSubmission = connection.define(
    'assignmentsSubmission',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      submissionDate: {
        type: Sequelize.DATE(3),
        allowNull: false,
      },
      attachments: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      student_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'students',
          key: 'id',
        },
      },
      lesson_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'lessons',
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

  return AssignmentSubmission;
};
