const { Channel } = require('../../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { cloudinary } = require('../../config/cloudinary');

exports.register = async (req, res) => {
  try {
    const { body } = req;

    const photo = await cloudinary.api.resource(
      '/defaultPhoto/defaultProfile_shw4p3',
      { resource_type: 'image' },
      (error, result) => {
        if (error) {
          return res.send({
            status: 'Request failed',
            message: 'Server error',
          });
        }
      }
    );

    const thumbnail = await cloudinary.api.resource(
      '/defaultThumbnail/thumbnail_ap09qs',
      { resource_type: 'image' },
      (error, result) => {
        if (error) {
          return res.send({
            status: 'Request failed',
            message: 'Server Error',
          });
        }
      }
    );

    const filePhoto = {
      path: photo.secure_url,
      filename: photo.public_id,
    };

    const fileThumbnail = {
      path: thumbnail.secure_url,
      filename: thumbnail.public_id,
    };
    console.log(JSON.stringify(fileThumbnail));
    console.log(JSON.stringify(filePhoto));

    const schema = Joi.object({
      email: Joi.string().email().min(10).required(),
      password: Joi.string().min(8).required(),
      channelName: Joi.string().min(2).required(),
      description: Joi.string().min(10).required(),
    });
    const { error } = schema.validate(body, { abortEarly: false });

    if (error) {
      return res.send({
        status: 'Validation error',
        message: error.details.map((err) => err.message),
      });
    }

    const checkEmail = await Channel.findOne({
      where: {
        email: body.email,
      },
    });

    if (checkEmail) {
      return res.send({
        status: 'Request failed',
        message: 'Email already exist',
      });
    }

    const { email, password, channelName, description } = body;
    const passwordHash = await bcrypt.hash(password, 10);

    const channel = await Channel.create({
      email,
      password: passwordHash,
      channelName,
      description,
      thumbnail: JSON.stringify(fileThumbnail),
      photo: JSON.stringify(filePhoto),
    });

    const privateKey = process.env.JWT_PRIVATE_KEY;

    const token = jwt.sign(
      {
        id: channel.id,
      },
      privateKey
    );

    res.send({
      status: 'Request success',
      message: 'Your account was registered',
      data: {
        channel: {
          id: channel.id,
          email: channel.email,
          channelName: channel.channelName,
          description: channel.description,
          photo: channel.photo,
          thumbnail: channel.thumbnail,
          token,
        },
      },
    });
  } catch (err) {
    return res.send({
      status: 'Request failed',
      message: 'Server error',
    });
  }
};
