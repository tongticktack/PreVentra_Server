module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "user", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      nickname: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      salt: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone_num: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }, {
      comment: "User"
    }
  );
  user.associate = (models) => {
    user.hasMany(models.camera, {
      foreignKey: 'user_id'
    });
  }
  return user;
};