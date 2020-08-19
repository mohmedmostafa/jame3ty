const University = require('../university/university.model');
module.exports = (connection, Sequelize) => {
  const Faculty = connection.define(
    'faculties',
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
      bio: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      university_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'universities',
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

  return Faculty;
};
