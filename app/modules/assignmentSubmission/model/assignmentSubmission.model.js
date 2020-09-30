const { PORT, HOST, ENV } = require('../../../config/env.config');

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
        type: Sequelize.DATE,
        allowNull: false,
      },
      attachments: {
        type: Sequelize.STRING(255),
        defaultValue: '',
        get() {
          let fieldFilesPaths = this.getDataValue('attachments');
          if (fieldFilesPaths.length > 0) {
            fieldFilesPaths = fieldFilesPaths.split(',');
            fieldFilesPaths.forEach((location, index) => {
              if (ENV === 'dev') {
                fieldFilesPaths[index] = `${HOST}` + `${PORT}` + '/' + location;
              } else {
                fieldFilesPaths[index] = `${HOST}` + '/' + location;
              }
            });
            fieldFilesPaths = fieldFilesPaths.join();
          }
          return fieldFilesPaths ? fieldFilesPaths : '';
        },
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
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: '2',
        comment: '0 : Rejected | 1 : Accepted | 2 : Not Reviewed',
      },
      statusComments: {
        type: Sequelize.STRING(255),
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        onUpdate: Sequelize.fn('NOW'),
        allowNull: false,
      },
    },
    { freezeTableName: true }
  );

  return AssignmentSubmission;
};
