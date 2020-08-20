module.exports = (connection, Sequelize) => {
  const SubjectYearDept = connection.define(
    'subjectYearDept',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      academicYearId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'academicYears',
          key: 'id',
        },
      },
      subjectId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'subjects',
          key: 'id',
        },
      },
      departmentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'departments',
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

  return SubjectYearDept;
};
