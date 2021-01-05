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

      Comment.belongsTo(models.Channel, {
        as: 'channel',
      });
      Comment.belongsTo(models.Video, {
        as: 'video',
      });
    }
  }
  Comment.init(
    {
      comment: DataTypes.STRING,
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
