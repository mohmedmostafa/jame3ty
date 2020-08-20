module.exports = (connection, Sequelize) => {
  const University = connection.define(
    'universities',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name_ar: {
        type: Sequelize.STRING(255),
        unique: 'universities_name_ar_unique',
        allowNull: false,
      },
      name_en: {
        type: Sequelize.STRING(255),
        unique: 'universities_name_en_unique',
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

  return University;
};
