const serverless = require("serverless-http");
const express = require("express");
const { Router } = express;
const { isAuthorized } = require("@tinacms/auth");
const { createMediaHandler } = require("next-tinacms-cloudinary/dist/handlers");

const app = express();

const router = Router();

const handler = createMediaHandler({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  authorized: async (req, _res) => {
    try {
      if (process.env.NODE_ENV == "development") {
        return true;
      }

      const user = await isAuthorized(req);

      return user && user.verified;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
});

router.get("/cloudinary/media", handler);

router.post("/cloudinary/media", handler);

router.delete("/cloudinary/:media", (req, res) => {
  req.query.media = ["media", req.params.media];
  return handler(req, res);
});

app.use("/api/", router);

const serverlessHandler = serverless(app);
module.exports.handler = async (event, context) => {
  const result = await serverlessHandler(event, context);
  return result;
};
