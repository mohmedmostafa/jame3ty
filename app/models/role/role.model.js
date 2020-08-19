module.exports = (connection, Sequelize) => {
  const Role = connection.define(
    'roles',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      name_ar: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name_en: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { freezeTableName: true }
  );

  return Role;
};
