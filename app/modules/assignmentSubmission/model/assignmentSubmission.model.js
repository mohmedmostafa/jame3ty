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
      studentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'students',
          key: 'id',
        },
      },
      lessonId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'lessons',
          key: 'id',
        },
      },
      createdAt: {
        type: Sequelize.DATE(3),
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE(3),
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW,
        allowNull: false,
      },
    },
    { freezeTableName: true }
  );

  return AssignmentSubmission;
};
