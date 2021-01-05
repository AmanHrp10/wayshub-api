const { Channel, Video } = require('../../models');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  try {
    //? Record data from form-data
    const { body } = req;

    //? Validation
    const schema = Joi.object({
      email: Joi.string().email().required().min(10),
      password: Joi.string().required().min(8),
    });

    //? Selection error form validation
    const { error } = schema.validate(body, { abortEarly: false });

    //? Show error
    if (error) {
      return res.send({
        status: 'Request failed',
        message: error.details.map((err) => err.message),
      });
    }

    //? Record data from form-data
    const { email, password } = req.body;

    //? check-in existed email
    const channel = await Channel.findOne({
      where: {
        email,
      },
      include: {
        model: Video,
        as: 'videos',
        attributes: {
          exclude: ['channelId', 'ChannelId', 'updatedAt'],
        },
      },
    });

    //?if email not exist
    if (!channel) {
      return res.send({
        status: 'Request failed',
        error: {
          message: 'Invalid login',
        },
      });
    }

    //? take a password decrypt from database, and matching
    const passEncrypt = await bcrypt.compare(password, channel.password);

    //? if not password
    if (!passEncrypt) {
      return res.send({
        status: 'Request failed',
        message: 'Invalid login',
      });
    }

    //? Init token login
    const privateKey = process.env.JWT_PRIVATE_KEY;
    const token = jwt.sign({ id: channel.id }, privateKey);

    //? Response login
    res.send({
      status: 'Request succes',
      message: 'Successfully login',
      data: {
        channel: {
          id: channel.id,
          email: channel.email,
          channelName: channel.channelName,
          photo: channel.photo,
          thumbnail: channel.thumbnail,
          description: channel.description,
          token,
        },
      },
    });
  } catch (err) {
    return res.status(500).send({
      status: 'Request failed',
      message: err.message,
    });
  }
};
