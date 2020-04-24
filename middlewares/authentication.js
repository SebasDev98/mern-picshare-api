const jwt = require("jsonwebtoken");
const User = require("./../models/User");
const authUtil = require("./../utils/auth");

const checkToken = (req, res, next) => {
  const token = req.headers.authorization;

  const result = authUtil.decodeToken(token);

  if (result.success) {
    User.findById(result.decodedToken.user._id, (error, user) => {
      if (error) {
        return res.status(500).send({ error });
      }

      if (!user) {
        return res.status(401).send({
          message: "Invalid Token",
        });
      }

      req.user = user;
      req.token = result.decodedToken;
      next();
    });
  } else {
    return res.status(401).send({
      message: "Invalid Token",
    });
  }
};

module.exports = {
  checkToken,
};
