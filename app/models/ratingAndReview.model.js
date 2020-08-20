module.exports = (connection, Sequelize) => {
  const RatingAndReview = connection.define(
    'RatingAndReviews',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      date: {
        type: Sequelize.DATE(3),
        allowNull: false,
      },
      reviewText: {
        type: Sequelize.STRING(255),
      },
      rate: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      courseSubscribe_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'coursesSubscribes',
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

  return RatingAndReview;
};
