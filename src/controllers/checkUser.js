const { Channel, Video } = require('../../models');

exports.checkAuth = async (req, res) => {
  try {
    const channelId = req.id.id;

    const channel = await Channel.findOne({
      where: {
        id: channelId,
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'password'],
      },
      include: {
        model: Video,
        as: 'videos',
        attributes: {
          exclude: ['channelId', 'ChannelId', 'updatedAt'],
        },
      },
    });
    res.send({
      status: 'Request succes',
      message: 'Channel Valid',
      data: {
        channel,
      },
    });
  } catch (err) {
    return res.send({
      status: 'Request failed',
      message: 'User not valid',
    });
  }
};
