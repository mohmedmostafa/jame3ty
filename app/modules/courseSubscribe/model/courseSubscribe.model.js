module.exports = (connection, Sequelize) => {
  const CourseSubscribe = connection.define(
    'courseSubscribes',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      studentId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        references: {
          model: 'students',
          key: 'id',
        },
      },
      courseId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        references: {
          model: 'courses',
          key: 'id',
        },
      },
      groupId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: true,
        references: {
          model: 'groups',
          key: 'id',
        },
      },
      details: {
        type: Sequelize.BLOB,
        allowNull: false,
        defaultValue: '',
        get() {
          return this.getDataValue('details').toString('utf8');
        },
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

  return CourseSubscribe;
};
