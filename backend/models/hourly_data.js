module.exports = (sequelize, DataTypes) => {
  const hourly_data = sequelize.define(
    "hourly_data", {
      camera_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      analyzed_time: {
        type: DataTypes.DATE,
        allowNull: false
      },
      avg_people: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      max_people: {
        type: DataTypes.INTEGER,
        allowNull: false
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
      alert_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      data_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }, {
      comment: "Hourly Data"
    }
  );
  hourly_data.associate = (models) => {
    hourly_data.belongsTo(models.camera, {
      foreignKey: 'camera_id'
    });
  }
  return hourly_data;
};