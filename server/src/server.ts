import mongoose from "mongoose"
import http from "http"
import express from "express"
import { config } from "./config/config"
import Logging from "./library/Logging";

const app = express();

/**Connect to database */
mongoose
  .connect(config.mongo.url, { retryWrites: true, w: "majority" })
  .then(() => {
    Logging.info("Connected to database");
    startServer();
  })
  .catch((error) => {
    Logging.error("Unable to connect");
    Logging.error(error);
  });

/**Start server when database is connected */

const startServer = () => {
  app.use((req, res, next) => {
    /**Log the request */
    Logging.info(
      `Incoming -> method [${req.method}] - url [${req.url}] - IP: [${req.socket.remoteAddress}]`
    );

    res.on("finish", () => {
      /**Log the response */
      Logging.info(
        `Incoming -> method [${req.method}] - url [${req.url}] - IP: [${req.socket.remoteAddress}] - statusCode: [${res.statusCode}]`
      );
    });

    next();
  });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  /**Rules of API */
  app.use((req, res, next) => {
    res.header("Access-Control_Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method == "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,DELETE,POST");
      return res.status(200).json({});
    }
    next();
  });

  /**Routes */

  /**API check */
  app.get("/test", (req, res, next) => {
    return res.status(200).json({ message: "API running" });
  });

  /**Error handler */
  app.use((req, res, next) => {
    const error = new Error("not found!");
    Logging.error(error);
    return res.status(404).json({ message: error.message });
  });

  http
    .createServer(app)
    .listen(config.server.port, () =>
      Logging.info(`Server running on port ${config.server.port}`)
    );
};