const express = require("express");
const path = require("path");
const imagesRouter = express.Router();
const fs = require("fs");

imagesRouter.get("/:image", async (req, res) => {
  try {
    let image = req.params.image;

    let imagePath = path.resolve(__dirname, `../uploads/${image}`);

    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
    } else {
      return res.status(500).send({ message: "Nonexistent file" });
    }
  } catch (error) {
    return res.status(500).send({
      error,
    });
  }
});

module.exports = imagesRouter;
