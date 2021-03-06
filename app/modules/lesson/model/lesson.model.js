const {
  PORT,
  HOST,
  ENV,
  VIMEO_HOST_URL,
} = require('../../../config/env.config');

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
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '0:Assignment | 1:Visual Lesson',
      },
      assignmentDeadLineDate: { type: Sequelize.DATE },
      vedio: {
        type: Sequelize.STRING,
        defaultValue: '',
        get() {
          let fieldFilesPaths = this.getDataValue('vedio');
          if (fieldFilesPaths.length > 0) {
            fieldFilesPaths = fieldFilesPaths.split(',');
            fieldFilesPaths.forEach((location, index) => {
              fieldFilesPaths[index] = `${VIMEO_HOST_URL}` + location;
            });
            fieldFilesPaths = fieldFilesPaths.join();
          }
          return fieldFilesPaths ? fieldFilesPaths : '';
        },
      },
      attachments: {
        type: Sequelize.STRING(255),
        defaultValue: '',
        get() {
          let fieldFilesPaths = this.getDataValue('attachments');
          if (fieldFilesPaths.length > 0) {
            fieldFilesPaths = fieldFilesPaths.split(',');
            fieldFilesPaths.forEach((location, index) => {
              // if (ENV === 'dev') {
              //   fieldFilesPaths[index] = `${HOST}` + `${PORT}` + '/' + location;
              // } else {
              //   fieldFilesPaths[index] = `${HOST}` + '/' + location;
              // }
              if (HOST.includes('heroku')) {
                fieldFilesPaths[index] = `${HOST}` + '/' + location;
              } else {
                fieldFilesPaths[index] = `${HOST}` + `${PORT}` + '/' + location;
              }
            });
            fieldFilesPaths = fieldFilesPaths.join();
          }
          return fieldFilesPaths ? fieldFilesPaths : '';
        },
      },
      isLiveStreaming: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      liveStreamingInfo: {
        type: Sequelize.STRING(255),
      },
      liveStreamingTime: {
        type: Sequelize.DATE,
      },
      liveStreamingEndTime: {
        type: Sequelize.DATE,
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
        onDelete: 'CASCADE',
        references: {
          model: 'courses',
          key: 'id',
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

  return Lesson;
};
