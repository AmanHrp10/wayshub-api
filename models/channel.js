'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Channel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //  * Relationship
      Channel.belongsToMany(models.Channel, {
        as: 'subscribers',
        foreignKey: 'channelId',
        through: 'Subscribes',
      });
      Channel.belongsToMany(models.Channel, {
        as: 'subscribed',
        foreignKey: 'subsChannelId',
        through: 'Subscribes',
      });

      //* Relationship
      Channel.hasMany(models.Videos, {
        as: 'videos',
      });
      Channel.hasMany(models.Comment, {
        as: 'comments',
      });
    }
  }
  Channel.init(
    {
      email: DataTypes.STRING,
      channelName: DataTypes.STRING,
      description: DataTypes.STRING,
      thumbnail: DataTypes.STRING,
      photo: DataTypes.STRING,
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Channel',
    }
  );
  return Channel;
};
