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
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    },
    { freezeTableName: true }
  );

  return Role;
};
