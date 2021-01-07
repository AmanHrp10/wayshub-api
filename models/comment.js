'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //* Relationship

      Comment.belongsTo(models.Video, {
        foreignKey: 'videoId',
        as: 'video',
      });

      Comment.belongsTo(models.Channel, {
        foreignKey: 'channelId',
        as: 'channel',
      });
    }
  }
  Comment.init(
    {
      comment: DataTypes.TEXT,
      channelId: DataTypes.INTEGER,
      videoId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Comment',
    }
  );
  return Comment;
};
