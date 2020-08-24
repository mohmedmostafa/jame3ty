module.exports = (connection, Sequelize) => {
  const Group = connection.define(
    'groups',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      maxNumOfStudents: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      startDate: {
        type: Sequelize.DATE(3),
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATE(3),
        allowNull: false,
      },
      courseId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        references: {
          model: 'courses',
          key: 'id',
        },
      },
      instructorId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        references: {
          model: 'instructors',
          key: 'id',
        },
      },
      createdAt: {
        type: Sequelize.DATE(3),
        defaultValue: Sequelize.fn('NOW'),
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE(3),
        defaultValue: Sequelize.fn('NOW'),
        onUpdate: Sequelize.fn('NOW'),
        allowNull: false,
      },
    },
    { freezeTableName: true }
  );

  return Group;
};
