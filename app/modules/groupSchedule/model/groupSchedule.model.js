module.exports = (connection, Sequelize) => {
  const GroupSchedule = connection.define(
    'groupSchedules',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      day: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      time: {
        type: Sequelize.DATE(3),
        allowNull: false,
      },
      groupId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'groups',
          key: 'id',
        },
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

  return GroupSchedule;
};
