const { Subscribe, Channel, Video } = require('../../models');
const { Op } = require('sequelize');

//? Add subscribe
exports.addSubscribe = async (req, res) => {
  try {
    const { id } = req.id;
    const { id: channelId } = req.params;

    //? Handle subscribe yourself
    if (id == channelId) {
      return res.send({
        status: 'Request failed',
        message: 'Cannot subscribe channel yourself',
      });
    }

    const isChannel = await Channel.findOne({
      where: {
        id: channelId,
      },
    });

    console.log(id);
    //? Check existed of channel
    if (!isChannel) {
      return res.send({
        status: 'Request failed',
        message: 'Channel not found',
      });
    }

    const subscribe = await Subscribe.findOne({
      where: {
        channelId,
        subsChannelId: id,
      },
    });

    // //? Check subscribtion existed
    if (subscribe) {
      return res.send({
        status: 'Request failed',
        message: 'Cannot subscribe this channel again',
        data: {
          id: subscribe.channelId,
        },
      });
    }

    //? Add subscribe
    await Subscribe.create({
      channelId,
      subsChannelId: id,
    });

    //? Get channel was subscribed
    const subscribed = await Channel.findOne({
      where: {
        id: channelId,
      },
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt'],
      },
    });

    res.send({
      status: 'Request success',
      message: 'Subscribe was added',
      data: {
        subscribed,
      },
    });
  } catch (err) {
    return res.send({
      status: 'Request failed',
      message: 'Server error',
    });
  }
};

//? Unsubscribe
exports.removeSubscribe = async (req, res) => {
  try {
    //? Init id Channel & Subscribtion
    const { id: subsChannelId } = req.id;
    const { id: channelId } = req.params;

    //? Filter Subscribe
    const subscribtion = await Subscribe.findOne({
      where: {
        channelId,
        subsChannelId,
      },
    });
    console.log(channelId);

    //! if ID not match on params
    if (!subscribtion) {
      return res.send({
        status: 'Request failed',
        message: 'Resource not found',
      });
    }

    //? Delete action
    subscribtion.destroy();

    //? Response
    res.send({
      status: 'Request success',
      message: 'Unsubscribed',
      data: {
        id: channelId,
      },
    });
  } catch (err) {
    return res.send({
      status: 'Request failed',
      message: 'Server error',
    });
  }
};

//? Get My subscribe
exports.getSubscribers = async (req, res) => {
  try {
    const { id } = req.id;

    //? Get channel as login user
    const subscribtion = await Channel.findOne({
      where: {
        id,
      },
      attributes: [],
      include: {
        model: Channel,
        as: 'subscribed',
        through: {
          attributes: [],
        },
        attributes: {
          exclude: ['password', 'createdAt', 'updatedAt', 'thumbnail'],
        },
        include: {
          model: Video,
          as: 'videos',
          attributes: {
            exclude: ['updatedAt', 'channelId', 'ChannelId'],
          },
        },
      },
    });

    if (!subscribtion) {
      return res.send({
        status: 'Request failed',
        message: "don't have a subscriber",
      });
    }
    res.send({
      status: 'Request success',
      message: 'Subscribtion was fetching',
      count: subscribtion.subscribed.length,
      data: subscribtion,
    });
  } catch (err) {
    return res.send({
      status: 'Request failed',
      message: err.message,
    });
  }
};

//? Get subscribe video filter
exports.getSubscribersVideoFilter = async (req, res) => {
  try {
    const { id } = req.id;
    const { title } = req.body;

    //? Get channel as login user
    const subscribtion = await Channel.findOne({
      where: {
        id,
      },
      attributes: [],
      include: {
        model: Channel,
        as: 'subscribed',
        through: {
          attributes: [],
        },
        attributes: {
          exclude: ['password', 'createdAt', 'updatedAt', 'thumbnail'],
        },
        include: {
          model: Video,
          as: 'videos',
          attributes: {
            exclude: ['updatedAt', 'channelId', 'ChannelId'],
          },
        },
      },
    });

    if (!subscribtion) {
      return res.send({
        status: 'Request failed',
        message: "don't have a subscriber",
      });
    }

    let videos = [];
    subscribtion.subscribed.map((channel) =>
      channel.videos.map((video) =>
        videos.push({
          id: video.id,
          title: video.title,
          thumbnail: video.thumbnail,
          video: video.video,
          viewCount: video.viewCount,
          createdAt: video.createdAt,
          channel: {
            id: channel.id,
            channelName: channel.channelName,
          },
        })
      )
    );

    const videoFilter = videos.filter((video) => video.title == req.body.title);
    res.send({
      status: 'Request success',
      message: 'Subscribtion was fetching',
      count: videos.length,
      data: videoFilter,
    });
  } catch (err) {
    return res.send({
      status: 'Request failed',
      message: err.message,
    });
  }
};

//? get subscriber count
exports.getCountSubscriber = async (req, res) => {
  try {
    const { id } = req.id;

    const subscribtion = await Channel.findOne({
      where: {
        id,
      },
      attributes: [],
      include: {
        model: Channel,
        as: 'subscribers',
        through: {
          attributes: [],
        },
        attributes: {
          exclude: ['password', 'createdAt', 'updatedAt', 'thumbnail', 'photo'],
        },
        include: {
          model: Video,
          as: 'videos',
          attributes: {
            exclude: ['updatedAt', 'channelId', 'ChannelId'],
          },
        },
      },
    });

    if (!subscribtion) {
      return res.send({
        status: 'Request failed',
        message: "don't have a subscriber",
      });
    }
    res.send({
      status: 'Request success',
      message: 'Subscribtion was fetching',
      data: subscribtion,
    });

    // const channel = await Channel.findOne({
    //   where: {
    //     id,
    //   },
    // });

    // const channels = await Channel.findAll();

    // //? Get all data Subscribes & filter
    // const subscribe = await Subscribe.findAll();
    // const subsCount = subscribe.filter(
    //   (subscribe) => subscribe.channelId == channel.id
    // );
    // const channaelFilter = channels.filter((s) => s.id == subsCount);

    // if (subsCount.length === 0) {
    //   return res.send({
    //     status: 'Request failed',
    //     message: 'nothing subscribe on this channel',
    //   });
    // }

    // console.log(channaelFilter);

    // res.send({
    //   status: 'Request succes',
    //   message: 'subscribers was fetched',
    //   count: subsCount.length,
    //   data: {
    //     subscribers: subsCount,
    //   },
    // });
  } catch (err) {
    return res.send({
      status: 'Request failed',
      message: err.message,
    });
  }
};

//? Get Subscribe by Id
exports.getSubscribeById = async (req, res) => {
  try {
    const { id } = req.id;
    const { id: channelId } = req.params;

    const subscribe = await Subscribe.findOne({
      where: {
        channelId,
        subsChannelId: id,
      },
      attributes: {
        exclude: [
          'createdAt',
          'updatedAt',
          'password',
          'fullname',
          'avatar',
          'greeting',
          'id',
          'email',
        ],
      },
    });

    if (!subscribe) {
      return res.send({
        status: 'Request failed',
        message: 'Subscribe not found',
      });
    }
    res.send({
      status: 'Request success',
      message: 'Subscribe was fetched',
      data: {
        subscribe,
      },
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: 'Request failed',
      message: 'Server error',
    });
  }
};
