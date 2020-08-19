const University = require('../university/university.model');
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
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      lessonDiscussion_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'lessonDiscussions',
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

  return lessonDiscussionComment;
};
