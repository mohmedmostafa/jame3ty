const University = require('../university/university.model');
module.exports = (connection, Sequelize) => {
  const Instructor = connection.define(
    'instructors',
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
      },
      mobile: {
        type: Sequelize.STRING(255),
        unique: 'instructors_mobile_unique',
      },
      email: {
        type: Sequelize.STRING(255),
        unique: 'instructors_email_unique',
        allowNull: false,
      },
      cv: {
        type: Sequelize.STRING(255),
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

  return Instructor;
};
