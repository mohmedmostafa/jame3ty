module.exports = (connection, Sequelize) => {
  const Payment = connection.define(
    'payments',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      courseSubscribeId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        references: {
          model: 'courseSubscribes',
          key: 'id',
        },
      },
      PaymentID: {
        type: Sequelize.STRING(255),
      },
      Result: {
        type: Sequelize.STRING(255),
      },
      PostDate: {
        type: Sequelize.STRING(255),
      },
      TranID: {
        type: Sequelize.STRING(255),
      },
      Ref: {
        type: Sequelize.STRING(255),
      },
      TrackID: {
        type: Sequelize.STRING(255),
      },
      Auth: {
        type: Sequelize.STRING(255),
      },
      OrderID: {
        type: Sequelize.STRING(255),
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

  return Payment;
};
