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
      price: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      priceBeforeDiscount: {
        type: Sequelize.DOUBLE,
      },
      startDate: {
        type: Sequelize.DATE(3),
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
      img: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      vedio: {
        type: Sequelize.STRING,
        allowNull: true,
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

  return Course;
};
