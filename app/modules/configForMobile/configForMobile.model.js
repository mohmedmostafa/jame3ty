module.exports = (connection, Sequelize) => {
  const configForMobile = connection.define(
    'configForMobile',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      value: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: '0',
        comment: '0 | 1 for mobile app uploading - 0 under review - 1 accepted',
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

  return configForMobile;
};
