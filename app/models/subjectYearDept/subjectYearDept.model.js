const University = require('../university/university.model');
module.exports = (connection, Sequelize) => {
  const SubjectYearDept = connection.define(
    'subjectYearDept',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      academicYear_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'academicYears',
          key: 'id',
        },
      },
      subject_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'subjects',
          key: 'id',
        },
      },
      department_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'departments',
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

  return SubjectYearDept;
};
