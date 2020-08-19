const University = require('../university/university.model');
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
      group_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'groups',
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

  return GroupSchedule;
};
