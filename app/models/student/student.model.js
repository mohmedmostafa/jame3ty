const University = require('../university/university.model');
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
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      academicYear_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'academicYears',
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

  return Student;
};
