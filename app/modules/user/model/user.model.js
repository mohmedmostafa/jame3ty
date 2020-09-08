module.exports = (connection, Sequelize) => {
  const User = connection.define(
    'users',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: Sequelize.STRING,
        unique: 'users_username_unique',
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        unique: 'users_email_unique',
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      lastVerificationCodeSend: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lasVerificationCodeCreatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      lasVerificationCodeExpireAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        onUpdate: Sequelize.fn('NOW'),
        allowNull: false,
      },
    },
    { freezeTableName: true }
  );

  return User;
};
