const jwt = require('jsonwebtoken');

exports.auth = async (req, res, next) => {
  let token, header;

  //! Check token input on Authorization form
  if (
    !(header = req.header('Authorization')) ||
    !(token = header.replace('Bearer ', ''))
  ) {
    return res.status(401).send({
      status: 'Response failed',
      error: {
        message: 'Access Denied',
      },
    });
  }
  try {
    const privateKey = process.env.JWT_PRIVATE_KEY;
    const verified = jwt.verify(token, privateKey);
    req.id = verified;
    next();
  } catch (err) {
    res.status(500).send({
      status: 'Request failed',
      error: {
        message: 'Invalid token',
      },
    });
  }
};
