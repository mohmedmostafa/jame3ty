module.exports = (connection, Sequelize) => {
  const lessonDiscussionComment = connection.define(
    'lessonDiscussionComments',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      text: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      time: {
        type: Sequelize.DATE(3),
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      lessonDiscussionId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'lessonDiscussions',
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

  return lessonDiscussionComment;
};
