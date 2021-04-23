module.exports = (sequelize, DataTypes) => {
    const cluster_data = sequelize.define(
      "cluster_data", {
        cluster_id: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
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
        duration: {
          type: DataTypes.INTEGER,
          defaultValue: 0
        }
      }, {
        comment: "cluster data per minute"
      }
    );
    cluster_data.associate = (models) => {
      cluster_data.belongsTo(models.camera, {
        foreignKey: 'camera_id'
      });
    }
    return cluster_data;
  };