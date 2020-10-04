const { PORT, HOST, ENV } = require('../../../config/env.config');

module.exports = (connection, Sequelize) => {
  const Student = connection.define(
    'students',
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
      mobile: {
        type: Sequelize.STRING(255),
        unique: 'students_mobile_unique',
      },
      email: {
        type: Sequelize.STRING(255),
        unique: 'students_email_unique',
        allowNull: false,
      },
      img: {
        type: Sequelize.STRING(255),
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
      userId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      academicYearId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        references: {
          model: 'academicYears',
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

  return Student;
};
