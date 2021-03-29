module.exports = (sequelize, DataTypes) => {
  const minutely_data = sequelize.define(
    "minutely_data", {
      camera_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      analyzed_time: {
        type: DataTypes.DATE,
        allowNull: false
      },
      n_people: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      risk: {
        type: DataTypes.INTEGER
      },
      congestion: {
        type: DataTypes.INTEGER
      },
      alert_checked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      mask_off:{
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      n_not_keep_dist: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }, {
      comment: "Data per minute"
    }
  );
  minutely_data.associate = (models) => {
    minutely_data.belongsTo(models.camera, {
      foreignKey: 'camera_id'
    });
  }
  return minutely_data;
};