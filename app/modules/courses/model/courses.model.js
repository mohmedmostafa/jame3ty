const {
  PORT,
  HOST,
  ENV,
  VIMEO_HOST_URL,
} = require('../../../config/env.config');

module.exports = (connection, Sequelize) => {
  const Course = connection.define(
    'courses',
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
      code: {
        type: Sequelize.STRING(255),
      },
      desc: {
        type: Sequelize.STRING(500),
      },
      prerequisiteText: {
        type: Sequelize.STRING(500),
      },
      whatYouWillLearn: {
        type: Sequelize.STRING(255),
      },
      numOfLessons: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      numOfHours: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      price: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      priceBeforeDiscount: {
        type: Sequelize.DOUBLE,
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '0:Subject | 1:Assignment',
      },
      method: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '0:Recorded Lessons | 1:Live Streaming',
      },
      course_keyword: {
        type: Sequelize.STRING(500),
        defaultValue: '',
      },
      attachement_price: {
        type: Sequelize.DOUBLE,
        defaultValue: '0',
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
      img: {
        type: Sequelize.STRING,
        defaultValue: '',
        get() {
          let fieldFilesPaths = this.getDataValue('img');
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
      subjectId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        references: {
          model: 'subjects',
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

  return Course;
};
