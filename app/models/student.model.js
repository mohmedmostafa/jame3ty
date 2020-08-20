module.exports = (connection, Sequelize) => {
  const Student = connection.define(
    'students',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      mobile: {
        type: Sequelize.STRING(255),
        unique: 'students_mobile_unique',
      },
      email: {
        type: Sequelize.STRING(255),
        unique: 'students_mobile_unique',
        allowNull: false,
      },
      img: {
        type: Sequelize.STRING(255),
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      academicYearId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'academicYears',
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

  return Student;
};
