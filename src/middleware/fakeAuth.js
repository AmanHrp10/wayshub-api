const isLogin = false;

exports.auth = (req, res, next) => {
  isLogin
    ? next()
    : res.send({
        message: 'you nothing access for page',
      });
};
