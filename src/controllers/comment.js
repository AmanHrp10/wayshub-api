const { Video, Channel, Comment } = require('../../models');
const Joi = require('joi');

exports.getAllCommentsByVideoId = async (req, res) => {
  try {
    const { id } = req.params;
    const videoById = await Video.findOne({ where: { id } });

    if (!videoById) {
      return res.send({
        status: 'Request failed',
        message: 'Video not found',
      });
    }

    const commentsByVideo = await Comment.findAll({
      where: {
        videoId: id,
      },
      attributes: ['id', 'comment'],
      include: {
        model: Channel,
        as: 'channel',
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'password'],
        },
      },
    });
    if (commentsByVideo.length === 0) {
      res.send({
        status: 'Request success',
        message: 'Comments not exist',
        count: commentsByVideo.length,
        data: {
          comments: commentsByVideo,
        },
      });
    }
    res.send({
      status: 'Request success',
      message: 'Data successfully fetching',
      count: commentsByVideo.length,
      data: {
        comments: commentsByVideo,
      },
    });
  } catch (err) {
    res.send({
      status: 'Request failed',
      message: 'Server error',
    });
  }
};

exports.getCommentById = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const videoById = await Video.findOne({ where: { id } });

    //? Check video existed
    if (!videoById) {
      return res.send({
        status: 'Request failed',
        message: `Video id ${id} not found`,
        data: {
          video: videoById,
        },
      });
    }
    const comment = await Comment.findOne({
      where: {
        id: commentId,
      },
      attributes: ['id', 'comment'],
      include: {
        model: Channel,
        as: 'channel',
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'password'],
        },
      },
    });

    //? Check Comment existed
    if (!comment) {
      res.send({
        status: 'Request success',
        message: `Comment id ${commentId} not exist`,
        data: {
          comment,
        },
      });
    }
    res.send({
      status: 'Request success',
      message: 'Data successfully fetching',
      data: {
        comment,
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

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: channelId } = req.id;
    const { body } = req;

    const newComment = await Comment.create({
      comment: body.comment,
      channelId,
      videoId: id,
    });

    const addComment = await Comment.findOne({
      where: {
        id: newComment.id,
      },
      attributes: ['id', 'comment'],
      include: {
        model: Channel,
        as: 'channel',
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'password'],
        },
      },
    });

    res.send({
      status: 'Request success',
      message: 'Comment was adding',
      data: {
        comment: addComment,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: 'Request failed',
      message: err.message,
    });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { body } = req;

    //? Check existed video
    const videoExisted = await Video.findOne({
      where: {
        id,
      },
    });

    if (!videoExisted) {
      return res.send({
        status: 'Request failed',
        message: `Video id ${id} not found`,
        data: {
          id,
        },
      });
    }

    const commentAfterUpdate = await Comment.findOne({
      where: {
        id: commentId,
      },
    });

    //? Check existed ufter update
    if (!commentAfterUpdate) {
      return res.send({
        status: 'Request failed',
        message: `Comment id ${commentId} not found`,
        data: {
          id: commentId,
        },
      });
    }

    //? Update
    await Comment.update(body, {
      where: {
        id: commentId,
      },
    });

    //? Show comment Updated
    const comment = await Comment.findOne({
      where: {
        id: commentId,
      },
      attributes: ['id', 'comment'],
      include: {
        model: Channel,
        as: 'channel',
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'password'],
        },
      },
    });
    res.send({
      status: 'Request success',
      message: 'Comment was updated',
      data: {
        comment,
      },
    });
  } catch (err) {
    return res.send({
      status: 'Request failed',
      message: err.message,
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    //? Check existed video
    const videoExisted = await Video.findOne({
      where: {
        id,
      },
    });

    if (!videoExisted) {
      return res.send({
        status: 'Request failed',
        message: `Video id ${id} not found`,
        data: {
          id,
        },
      });
    }

    const commentAfterUpdate = await Comment.findOne({
      where: {
        id: commentId,
      },
    });

    //? Check existed ufter update
    if (!commentAfterUpdate) {
      return res.send({
        status: 'Request failed',
        message: `Comment id ${commentId} not found`,
        data: {
          id: commentId,
        },
      });
    }

    const comment = await Comment.destroy({
      where: {
        id: commentId,
      },
    });
    res.send({
      status: 'Request success',
      message: 'Comment was Deleted',
      data: {
        comment,
      },
    });
  } catch (err) {
    return res.send({
      status: 'Request failed',
      message: 'Server error',
    });
  }
};
