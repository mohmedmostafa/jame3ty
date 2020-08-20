module.exports = (connection, Sequelize) => {
  const UserRole = connection.define(
    'userRoles',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        allowNull: false,
        unique: 'userRoles_unique',
      },
      roleId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'roles',
          key: 'id',
        },
        allowNull: false,
        unique: 'userRoles_unique',
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

  return UserRole;
};
