module.exports = (connection, Sequelize) => {
  const Role = connection.define(
    'roles',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name_ar: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: 'roles_name_ar_unique',
      },
      name_en: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: 'roles_name_en_unique',
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

  return Role;
};
