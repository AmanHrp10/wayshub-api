const Joi = require('joi');
const { Channel, Video, Subscribe, Comment } = require('../../models');
const { cloudinary } = require('../../config/cloudinary');

//? Get all channels
exports.getChannelsAll = async (req, res) => {
  try {
    const channels = await Channel.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'password'],
      },
      include: {
        model: Channel,
        as: 'subscribed',
        through: { attributes: [] },
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'password', 'Subscribes'],
        },
      },
    });
    if (!channels) {
      res.send({
        status: 'Request success',
        message: 'Data not found',
        count: channels.length,
        data: {
          channels,
        },
      });
    }
    res.send({
      status: 'Data fetched',
      message: 'Data succesfully fetched',
      count: channels.length,
      data: {
        channels,
      },
    });
  } catch (err) {
    res.send({
      status: 'Request failed',
      message: 'Server error',
    });
  }
};

//? Get Channel Login
exports.getMyProfile = async (req, res) => {
  try {
    const { id } = req.id;

    const user = await Channel.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt'],
      },
      include: [
        {
          model: Video,
          as: 'videos',
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'channelId', 'ChannelId'],
          },
        },
        {
          model: Channel,
          as: 'subscribers',
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'password'],
          },
          through: {
            attributes: [],
          },
        },
        {
          model: Channel,
          as: 'subscribed',
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'password'],
          },
          through: {
            attributes: [],
          },
        },
      ],
    });

    if (!user) {
      return res.send({
        status: 'Request failed',
        message: 'Channel not found',
      });
    }

    res.send({
      status: 'Request success',
      message: 'Profile was fetched',
      data: {
        user,
      },
    });
  } catch (err) {
    return res.send({
      status: 'Request failed',
      message: err.message,
    });
  }
};

//? Get data by id
exports.getChannelById = async (req, res) => {
  try {
    // const { id } = req.id;
    const { id } = req.params;

    //! Coba
    const subscriber = await Subscribe.findAll();

    const subsCount = subscriber.filter(
      (subsCount) => subsCount.channelId == id
    );

    console.log(subsCount.length);

    const channel = await Channel.findOne({
      where: {
        id,
      },

      attributes: {
        exclude: ['updatedAt', 'createdAt', 'password'],
      },
      include: [
        {
          model: Video,
          as: 'videos',
          attributes: {
            exclude: ['updatedAt', 'channelId', 'ChannelId'],
          },
        },
        {
          model: Channel,
          as: 'subscribed',
          through: {
            attributes: [],
          },
          attributes: {
            exclude: ['password', 'createdAt', 'updatedAt', 'Subscribes'],
          },
        },
      ],
    });
    if (!channel) {
      res.send({
        status: 'Request success',
        message: 'Data not found',
        data: {
          channel,
        },
      });
    }
    res.send({
      status: 'Request success',
      message: 'Data succesfully fetched',
      data: {
        channel,
        subscribers: subsCount.length,
      },
    });
  } catch (err) {
    res.status(500).send({
      status: 'Request failed',
      message: 'Server error',
    });
  }
};

//? Edit

exports.editChannel = async (req, res) => {
  try {
    const { id: userId } = req.id;
    const { id } = req.params;
    const { body, files } = req;

    const channel = await Channel.findOne({
      id,
    });

    const fileThumbnail = files.thumbnail
      ? files.thumbnail[0]
      : JSON.parse(channel.thumbnail);
    const filePhoto = files.photo ? files.photo[0] : JSON.parse(channel.photo);

    if (userId != id) {
      if (fileThumbnail.encoding) {
        if (fileThumbnail.filename !== 'defaultThumbnail/thumbnail_ap09qs') {
          cloudinary.uploader.destroy(
            fileThumbnail.filename,
            (error, result) => {
              console.log(error, result);
            }
          );
        }
      }

      if (filePhoto.encoding) {
        if (filePhoto.filename !== 'defaultPhoto/defaultProfile_shw4p3') {
          cloudinary.uploader.destroy(filePhoto.filename, (error, result) => {
            console.log(error, result);
          });
        }
      }
      return res.send({
        status: 'Request failed',
        message: 'Invalid user',
      });
    }

    const schema = Joi.object({
      email: Joi.string().min(10).email(),
      channelName: Joi.string().min(2),
      description: Joi.string(),
    });

    const { error } = schema.validate(body, {
      abortEarly: false,
    });

    if (error) {
      if (fileThumbnail.encoding) {
        if (fileThumbnail.filename !== 'defaultThumbnail/thumbnail_ap09qs') {
          cloudinary.uploader.destroy(
            fileThumbnail.filename,
            (error, result) => {
              console.log(error, result);
            }
          );
        }
      }

      if (filePhoto.encoding) {
        if (filePhoto.filename !== 'defaultPhoto/defaultProfile_shw4p3') {
          cloudinary.uploader.destroy(filePhoto.filename, (error, result) => {
            console.log(error, result);
          });
        }
      }
      return res.send({
        status: 'Request failed',
        message: error.message,
      });
    }

    const thumbnailUpload = {
      path: fileThumbnail.path,
      filename: fileThumbnail.filename,
    };

    const photoUpload = {
      path: filePhoto.path,
      filename: filePhoto.filename,
    };
    await Channel.update(
      {
        ...body,
        thumbnail: JSON.stringify(thumbnailUpload),
        photo: JSON.stringify(photoUpload),
      },
      {
        where: {
          id,
        },
      }
    );

    const channelUpdated = await Channel.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'password'],
      },
    });
    res.status(200).send({
      status: 'Request succes',
      message: 'Channel was updated',
      data: {
        channel: channelUpdated,
      },
    });
  } catch (err) {
    return res.status(500).send({
      status: 'Request failed',
      message: err.message,
    });
  }
};

//? Delete
exports.deleteChannel = async (req, res) => {
  try {
    const { id: userId } = req.id;
    const { id } = req.params;

    if (userId !== id) {
      return res.send({
        status: 'Request failed',
        message: 'Invalid user',
      });
    }

    const channelById = await Channel.findOne({
      where: {
        id,
      },
    });

    if (!channelById) {
      return res.send({
        status: 'Request failed',
        message: 'Channel not found',
      });
    }

    await Subscribe.destroy({
      where: {
        channelId: id,
      },
    });

    await Subscribe.destroy({
      where: {
        subsChannelId: id,
      },
    });

    await Comment.destroy({
      where: {
        channelId: id,
      },
    });

    const videos = await Video.findAll({
      where: {
        channelId: id,
      },
    });

    let videoId = [];

    videos.map((video) => videoId.push(video.id));

    await Comment.destroy({
      where: {
        id: videoId,
      },
    });

    await Video.destroy({
      where: {
        channelId: id,
      },
    });

    await Channel.destroy({
      where: {
        id,
      },
    });

    const deletedChannel = await Channel.destroy({ where: { id } });

    res.send({
      status: 'Request succes',
      message: 'Channel was deleted',
      data: {
        channel: deletedChannel,
      },
    });
  } catch (err) {
    return res.send({
      status: 'Request failed',
      message: err.message,
    });
  }
};
