const University = require('../university/university.model');
module.exports = (connection, Sequelize) => {
  const Subject = connection.define(
    'subjects',
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
      desc: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      faculty_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'faculties',
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

  return Subject;
};
