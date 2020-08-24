module.exports = (connection, Sequelize) => {
  const Department = connection.define(
    'departments',
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
        allowNull: true,
      },
      facultyId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        references: {
          model: 'faculties',
          key: 'id',
        },
      },
      createdAt: {
        type: Sequelize.DATE(3),
        defaultValue: Sequelize.fn('NOW'),
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE(3),
        defaultValue: Sequelize.fn('NOW'),
        onUpdate: Sequelize.fn('NOW'),
        allowNull: false,
      },
    },
    { freezeTableName: true }
  );

  return Department;
};
