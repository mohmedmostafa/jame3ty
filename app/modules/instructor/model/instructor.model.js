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
      },
      img: {
        type: Sequelize.STRING(255),
        get(){
          const storedValue = this.getDataValue('img');
          if(storedValue)
          return "https://localhost:3001/"+storedValue;
          else
          return null;
        }
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

  return Instructor;
};
