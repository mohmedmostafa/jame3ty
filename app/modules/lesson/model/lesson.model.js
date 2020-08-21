module.exports = (connection, Sequelize) => {
  const Lesson = connection.define(
    'lessons',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name_ar: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      name_en: {
        type: Sequelize.STRING(255),
      },
      desc: {
        type: Sequelize.STRING(255),
      },
      type: {
        type: Sequelize.ENUM('Assignment', 'Visual Lesson'),
        allowNull: true,
      },
      youtubeLink: {
        type: Sequelize.STRING(255),
      },
      attachments: {
        type: Sequelize.STRING(255),
      },
      isLiveStreaming: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      liveStreamingInfo: {
        type: Sequelize.STRING(255),
      },
      isAssostatedWithGroup: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      groupId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        references: {
          model: 'groups',
          key: 'id',
        },
        allowNull: true,
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

  return Lesson;
};
