const { PORT, HOST, ENV } = require('../../../config/env.config');

module.exports = (connection, Sequelize) => {
  const Instructor = connection.define(
    'instructors',
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
      bio: {
        type: Sequelize.STRING(255),
      },
      mobile: {
        type: Sequelize.STRING(255),
        unique: 'instructors_mobile_unique',
      },
      email: {
        type: Sequelize.STRING(255),
        unique: 'instructors_email_unique',
        allowNull: false,
      },
      cv: {
        type: Sequelize.STRING(255),
        defaultValue: '',
        get() {
          let fieldFilesPaths = this.getDataValue('cv');
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
        type: Sequelize.STRING(255),
        defaultValue: '',
        get() {
          let fieldFilesPaths = this.getDataValue('img');
          if (fieldFilesPaths.length > 0) {
            fieldFilesPaths = fieldFilesPaths.split(',');
            fieldFilesPaths.forEach((location, index) => {
              // fieldFilesPaths[index] = `${HOST}` + `${PORT}` + '/' + location;
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
      userId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        references: {
          model: 'users',
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

  return Instructor;
};
