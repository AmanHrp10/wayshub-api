const { Video, Channel, Comment } = require('../../models');
const Joi = require('joi');
const { Op } = require('sequelize');

//?  Get videos all
exports.getVideoAll = async (req, res) => {
  try {
    const { offset, limit } = req.params;

    const videos = await Video.findAll({
      subQuery: false,
      offset: parseInt(offset),
      limit: parseInt(limit),
      attributes: {
        exclude: ['channelId', 'updatedAt', 'ChannelId'],
      },
      include: [
        {
          model: Channel,
          as: 'channel',
          attributes: {
            exclude: [
              'createdAt',
              'updatedAt',
              'ChannelId',
              'subscribeId',
              'commentId',
              'password',
            ],
          },
        },
        {
          model: Comment,
          as: 'comments',
        },
      ],
    });
    if (!videos) {
      res.send({
        status: 'Request success',
        message: `Channel not exist`,
        count: videos.length,
        data: {
          videos,
        },
      });
    }
    res.send({
      status: 'Request success',
      message: 'Data succesfully fetched',
      count: videos.length,
      data: {
        videos,
      },
    });
  } catch (err) {
    res.send({
      status: 'Request failed',
      message: err.message,
    });
  }
};

//? Get video by id
exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ['channelId', 'updatedAt', 'ChannelId'],
      },
      include: [
        {
          model: Channel,
          as: 'channel',
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'password'],
          },
          include: {
            model: Channel,
            as: 'subscribers',
            attributes: ['id', 'email', 'channelName'],
            through: {
              attributes: [],
            },
          },
        },
        {
          model: Comment,
          as: 'comments',
          attributes: {
            exclude: [
              'createdAt',
              'updatedAt',
              'channelId',
              'videoId',
              'ChannelId',
              'VideoId',
            ],
          },
          include: {
            model: Channel,
            as: 'channel',
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'password'],
            },
          },
        },
      ],
    });
    if (!video) {
      res.send({
        status: 'Request success',
        message: `Video id ${id} not exist`,
        data: {
          video,
        },
      });
    }
    res.send({
      status: 'Request success',
      message: 'Data succesfully fetched',
      data: {
        video,
      },
    });
  } catch (err) {
    res.send({
      status: 'Request failed',
      message: {
        error: 'Server error',
      },
    });
  }
};

//? Add video
exports.addVideo = async (req, res) => {
  try {
    const { id } = req.id;
    const { body, files } = req;

    const fileThumbnail = files.thumbnail ? files.thumbnail[0].filename : null;
    const fileVideo = files.video ? files.video[0].filename : null;
    const pathThumbnail = files.thumbnail ? files.thumbnail[0].path : null;
    const pathVideo = files.video ? files.video[0].path : null;
    console.log(files);

    if (!id) {
      return res.send({
        status: 'Request failed',
        message: 'Invalid user',
      });
    }

    //? Validation
    const schema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
    });

    const { error } = schema.validate();

    //? Error Joi
    if (error) {
      if (fileThumbnail) {
        cloudinary.uploader.destroy(fileThumbnail.filename, (error, result) => {
          console.log(error, result);
        });
      }

      if (fileVideo) {
        cloudinary.uploader.destroy(
          fileVideo.filename,
          { resource_type: 'video' },
          (error, result) => {
            console.log(error, result);
          }
        );
      }
      return res.send({
        status: 'Request failed',
        message: error.message,
      });
    }

    if (!fileThumbnail) {
      if (fileVideo) {
        cloudinary.uploader.destroy(
          fileVideo.filename,
          { resource_type: 'video' },
          (error, result) => {
            console.log(error, result);
          }
        );
      }
      return res.send({
        status: 'Request failed',
        message: 'Please select thumbnail',
      });
    }

    if (!fileVideo) {
      if (fileThumbnail) {
        cloudinary.uploader.destroy(fileThumbnail.filename, (error, result) => {
          console.log(error, result);
        });
      }
      return res.send({
        status: 'Request failed',
        message: 'Please select video',
      });
    }

    const newVideo = await Video.create({
      ...body,
      channelId: id,
      thumbnail: pathThumbnail,
      video: pathVideo,
      viewCount: 0,
    });

    const video = await Video.findOne({
      where: {
        id: newVideo.id,
      },
      attributes: {
        exclude: ['updatedAt', 'channelId', 'ChannelId'],
      },
      include: [
        {
          model: Channel,
          as: 'channel',
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'password'],
          },
        },
        {
          model: Comment,
          as: 'comments',
          attributes: {
            exclude: [
              'createdAt',
              'updatedAt',
              'channelId',
              'videoId',
              'ChannelId',
              'VideoId',
            ],
          },
        },
      ],
    });
    res.send({
      status: 'Request success',
      message: 'Video succesfully Added',
      data: {
        video,
      },
    });
  } catch (err) {
    res.send({
      status: 'Request failed',
      message: 'Server error',
    });
  }
};

//? Update video
exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;

    const detailVideo = await Video.findOne({ where: { id } });

    if (!detailVideo) {
      return res.status(404).send({
        status: 'Request failed',
        message: `Video with id ${id} not found`,
        data: [],
      });
    }
    const schema = Joi.object({
      title: Joi.string(),
      description: Joi.string(),
    });

    const { error } = schema.validate(body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).send({
        status: 'Request failed',
        error: {
          message: error.details.map((err) => err.message),
        },
      });
    }

    await Video.update(body, { where: { id } });

    const videoUpdated = await Video.findOne({
      where: { id },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'ChannelId', 'channelId'],
      },
      include: {
        model: Channel,
        as: 'channel',
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'password'],
        },
      },
    });

    //? Response Video after updated
    res.send({
      status: 'Request success',
      message: 'Video succesfully updated',
      data: {
        video: videoUpdated,
      },
    });
  } catch (err) {
    res.send({
      status: 'Request failed',
      message: {
        error: 'Server error',
      },
    });
  }
};

//? Delete video
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVideo = await Video.destroy({
      where: { id },
    });

    //? Where id not exist
    if (!deletedVideo) {
      return res.send({
        status: 'Request failed',
        message: `Video with id ${id} not found`,
        data: {
          video: deletedVideo,
        },
      });
    }

    //? Response after deleted
    res.send({
      status: 'Request success',
      message: 'Video succesfully deleted',
      data: {
        video: deletedVideo,
      },
    });
  } catch (err) {
    res.send({
      status: 'Request failed',
      message: {
        error: 'Server error',
      },
    });
  }
};

exports.getSearchVideo = async (req, res) => {
  try {
    const { title } = req.body;

    const videos = await Video.findAll({
      where: {
        title: {
          [Op.like]: `%${title}%`,
        },
      },
      attributes: {
        exclude: ['updatedAt', 'channelId', 'ChannelId', 'description'],
      },
      include: {
        model: Channel,
        as: 'channel',
        attributes: ['id', 'channelName'],
      },
    });
    if (videos.length === 0) {
      return res.send({
        status: 'Request failed',
        message: 'Not a video',
      });
    }

    res.send({
      status: 'Request success',
      message: 'Videos was finding',
      data: {
        videos,
      },
    });
  } catch (err) {
    return res.send({
      status: 'Request failed',
      message: 'Server error',
    });
  }
};
