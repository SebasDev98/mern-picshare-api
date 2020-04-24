const express = require("express");
const User = require("./../models/User");
const userRouter = express.Router();
const authMiddleware = require("./../middlewares/authentication");
const authUtils = require("./../utils/auth");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

userRouter.post("/login", async (req, res) => {
  let { body } = req;

  if (!body.email || !body.password) {
    return res.status(400).send({
      message: "UserName or Password is not valid",
    });
  }

  try {
    const user = await User.findOne({ email: body.email }).exec();

    if (!user) {
      return res.status(400).send({
        message: "UserName or Password is not valid",
      });
    }

    if (!bcrypt.compareSync(body.password, user.password)) {
      return res.status(400).send({
        ok: false,
        err: {
          message: "UserName or Password is not valid",
        },
      });
    }

    const result = authUtils.getToken(user);

    if (result.success) {
      res.json({
        user,
        token: result.token,
      });
    } else {
      return res.status(500).send({
        error: result.error,
      });
    }
  } catch (error) {
    return res.status(500).send({
      error,
    });
  }
});

userRouter.post("/signup", async (req, res) => {
  let { body } = req;
  const salt = bcrypt.genSaltSync(10);

  try {
    let user = new User({
      userName: body.userName,
      email: body.email,
      password: bcrypt.hashSync(body.password, salt),
    });

    const newUser = await user.save(user);

    const token = jwt.sign(
      {
        user: newUser,
      },

      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN, //10 days
      }
    );

    res.json({
      user: newUser,
      token,
    });
  } catch (error) {
    return res.status(500).send({
      error,
    });
  }
});

userRouter.get("/verify-token", authMiddleware.checkToken, (req, res) => {
  const { user, token } = req;
  res.status(200).json({ user, token });
});

//verificar funcionamiento de token
// userRouter.get("/getToken", authMiddleware.checkToken, (req, res) => {
//   res.json(req.user);
// });

module.exports = userRouter;
