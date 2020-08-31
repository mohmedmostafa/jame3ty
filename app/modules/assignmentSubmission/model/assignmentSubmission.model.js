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
        defaultValue: '',
      },
      studentId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        references: {
          model: 'students',
          key: 'id',
        },
      },
      lessonId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        references: {
          model: 'lessons',
          key: 'id',
        },
      },
      createdAt: {
        type: Sequelize.DATE(3),
        defaultValue: Sequelize.fn('NOW'),
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE(3),
        defaultValue: Sequelize.fn('NOW'),
        onUpdate: Sequelize.fn('NOW'),
        allowNull: false,
      },
    },
    { freezeTableName: true }
  );

  return AssignmentSubmission;
};
