const express = require("express");
const helmet = require("helmet");
const fs = require("fs");
const packagejson = require("../package.json");
const bodyparser = require("body-parser");

//exe
const { exec } = require("child_process");

//variables
const app = express();
const PORT = 9000;
const NGINX_CONF_FILE = "/usr/local/nginx/conf/nginx.conf";
const NGINX_CONF_VALIDATE = "/usr/local/nginx/sbin/nginx -t";

// configuring server
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(helmet());

//=================================

const executeCmd = async (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (err, _param1, _param2) => {
      if (err) {
        console.log(`failed executing ${command} - ${err.message}`);
        reject(err);
      }
      console.log(`success executing ${command} - ${new Date().toString()}`);
      resolve("success");
    });
  });
};

//=================================

// to health ping
app.get("/api/ping", async (_, res) => {
  res.status(200).json({
    status: "success",
    payload: {
      health: "OK",
      version: packagejson["version"],
    },
  });
});

// to reboot nginx
app.post("/api/restart", async (_, res) => {
  try {
    await executeCmd(`systemctl restart nginx`);
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      error: err.message,
    });
  }
});

// to view the config file
app.get("/api/config", async (_, res) => {
  try {
    const conf = fs.readFileSync(NGINX_CONF_FILE, { encoding: "utf8" });
    const stringyfied = conf.toString();
    res.status(200).json({
      payload: stringyfied,
      status: 'success'
    })
  } catch (err) {
    res.status(500).json({
      status: "failed",
      error: err.message,
    });
  }
});

// to edit a file
app.post("/api/config", async (req, res) => {
  const presentConfiguration = fs.readFileSync(NGINX_CONF_FILE, { encoding: "utf8" });
  try {
    const contents = req.body.payload;
    fs.writeFileSync(NGINX_CONF_FILE, contents, { encoding: "utf8" });
    await executeCmd(NGINX_CONF_VALIDATE);
    res.status(200).json({
      status: 'success'
    })
  } catch (err) {
    console.log("error while updating. overriding with previous conf file", err);
    fs.writeFileSync(NGINX_CONF_FILE, presentConfiguration.toString(), { encoding: "utf8" });
    res.status(500).json({
      status: "failed",
      error: err.message,
    });
  }
});

const startServer = () => {
  try {
    console.log("SW server started", new Date().toString());
    app.listen(PORT, () => {
      console.log("SW server running on PORT", PORT);
    });
  } catch (error) {
    console.log("Error in starting SW server", error.message);
    process.exit(0);
  }
};

startServer();
