const express = require("express");

const postRouter = express.Router();
const Post = require("./../models/post");
const authentication = require("./../middlewares/authentication");
const Comment = require("./../models/Comment");
const View = require("./../models/View");
const Like = require("./../models/Like");
const validExtensions = ["png", "jpg", "jpeg"];
const path = require("path");
const authUtil = require("./../utils/auth");
const fs = require("fs");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

postRouter.get("/", async (req, res) => {
  try {
    const posts = await Post.find().exec();

    res.json(posts);
  } catch (error) {
    return res.status(500).send(error);
  }
});

postRouter.get("/:postId", async (req, res) => {
  const token = req.headers.authorization;
  const result = authUtil.decodeToken(token);

  try {
    const post = await Post.findById(req.params.postId).exec();
    let like = undefined;

    if (!post) {
      return res.status(400).send({
        message: "This post does not exist",
      });
    }

    if (result && result.success) {
      like = await Like.findOne({
        author: result.decodedToken.user._id,
        post: post._id,
      });
    }

    const comments = await Comment.find({ post: post._id }).exec();

    res.json({ post, comments, like });
  } catch (error) {
    return res.status(500).send(error);
  }
});

postRouter.post("/", authentication.checkToken, (req, res) => {
  const { files, body } = req;

  if (!files || !files.postImg) {
    return res.status(400).send({
      message: "Post's Image is required",
    });
  }
  if (body.text.length == 0) {
    return res.status(400).send({
      message: "Post's description is required",
    });
  }
  const file = files.postImg;
  const fileName = files.postImg.name.split(".");

  const extension = fileName[fileName.length - 1];

  if (validExtensions.indexOf(extension) < 0) {
    return res.status(400).send({
      message: `Allowed Extensions : ${validExtensions.join(",")}`,
    });
  }

  const newFileName = `${new Date().getTime().toString()}-${file.name}`;

  const imageFullPath = path.resolve(__dirname, `./../uploads/${newFileName}`);

  file.mv(path.resolve(imageFullPath), async (error) => {
    if (error) return res.status(500).send(error);
    try {
      const result = await cloudinary.v2.uploader.upload(imageFullPath, {
        use_filename: true,
        unique_filename: false,
      });

      let post = new Post({
        text: body.text,
        authorName: req.user.userName,
        imageId: result.secure_url,
        imageName: newFileName,
        author: req.user._id,
      });

      const newPost = await post.save();
      res.json({
        post: newPost,
      });

      //Removes temp file
      fs.unlink(imageFullPath, (error) => {
        if (error) console.log(`${imageFullPath} was not deleted`);
      });
    } catch (error) {
      return res.status(400).send(error);
    }
  });
});

postRouter.post("/:postId/comments", authentication.checkToken, (req, res) => {
  const { body, user, params } = req;

  Post.findById(params.postId, (error, post) => {
    if (error) {
      return res.status(400).send(error);
    }

    let comment = new Comment({
      text: body.text,
      authorName: user.userName,
      author: user._id,
      post: post._id,
    });

    comment.save((error, newComment) => {
      if (error) {
        return res.status(400).send(error);
      }

      return res.json({ comment: newComment });
    });
  });
});

postRouter.post(
  "/:postId/likes",
  authentication.checkToken,
  async (req, res) => {
    const { user, params } = req;

    try {
      let like = await Like.findOne({
        post: params.postId,
        author: user._id,
      }).exec();

      if (like) {
        return res.status(400).send({
          like,

          message: "You have already reacted to this post",
        });
      }

      let post = await Post.findById(params.postId).exec();

      if (!post) {
        return res.status(400).send({
          message: "This post does not exists",
        });
      }

      like = new Like({
        author: user._id,
        post: post._id,
      });

      const newLike = await like.save();
      const updatedPost = await Post.findByIdAndUpdate(
        post._id,
        { likes: post.likes + 1 },
        { new: true }
      ).exec();

      return res.json({ like: newLike, post: updatedPost });
    } catch (error) {
      return res.status(500).send({ error });
    }
  }
);

postRouter.post(
  "/:postId/views",
  authentication.checkToken,
  async (req, res) => {
    const { user, params } = req;

    try {
      let view = await View.findOne({
        post: params.postId,
        author: user._id,
      }).exec();

      /**
       * Depends on businnes propouses, if I want to know how
       * many times an User saw a Post or not
       * If I need that information, I should save another View Document
       * and If not, I shouldnt
       */

      let post = await Post.findById(params.postId).exec();

      if (view) {
        return res.json({
          view,
          post,
        });
      }

      if (!post) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "This post does not exists",
          },
        });
      }

      view = new View({
        author: user._id,
        post: post._id,
      });

      const newView = await view.save();
      const updatedPost = await Post.findByIdAndUpdate(
        post._id,
        { views: post.views + 1 },
        { new: true }
      ).exec();

      return res.json({ view: newView, post: updatedPost });
    } catch (error) {
      return res.status(500).send({
        error,
      });
    }
  }
);

module.exports = postRouter;
