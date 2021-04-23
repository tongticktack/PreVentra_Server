module.exports = (sequelize, DataTypes) => {
  const daily_data = sequelize.define(
    "daily_data", {
      camera_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      analyzed_time: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      avg_people: {
        type: DataTypes.INTEGER
      },
      max_people: {
        type: DataTypes.INTEGER
      },
      avg_congestion: {
        type: DataTypes.INTEGER
      },
      max_congestion: {
        type: DataTypes.INTEGER
      },
      avg_risk: {
        type: DataTypes.INTEGER
      },
      max_risk: {
        type: DataTypes.INTEGER
      },
      avg_n_not_keep_dist: {
        type: DataTypes.INTEGER
      },
      max_n_not_keep_dist: {
        type: DataTypes.INTEGER
      },
      safety_score: {
        type: DataTypes.FLOAT
      },
      alert_count: {
        type: DataTypes.INTEGER,
        defualtValue: 0
      },
      data_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }, {
      comment: "Data per hour"
    }
  );
  daily_data.associate = (models) => {
    daily_data.belongsTo(models.camera, {
      foreignKey: 'camera_id'
    });
  }
  return daily_data;
};