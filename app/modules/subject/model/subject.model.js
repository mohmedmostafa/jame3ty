module.exports = (connection, Sequelize) => {
  const Subject = connection.define(
    'subjects',
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

  return Subject;
};
