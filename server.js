const express = require("express");
const helmet = require("helmet");
const ip = require("ip");
const axios = require("axios");
const packagejson = require("./package.json");
const { exec } = require("child_process");

//variables
const app = express();
const PORT = 9000;

// configuring server
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(helmet());

const executeCmd = async (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (err, _param1, _param2) => {
      if (err) {
        console.error(`failed executing ${command} - ${err.message}`);
        reject(err);
        return;
      }
      console.log(`success executing ${command}`);
      resolve("success");
    });
  });
};

// to health ping
app.get("/api/ping", async (_, res) => {
  res.status(200).json({
    status: "success",
    payload: {
      health: "ok",
      version: packagejson["version"],
    },
  });
});

// stop server
app.post("/api/kill", async (_, res) => {
  try {
    await executeCmd(`systemctl stop nginx`);
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

// start bw
app.post("/api/bw/start", async (req, res) => {
  const bwIn = req.query.bwin;
  const bwOut = req.query.bwout;
  try {
    await executeCmd(`wondershaper eth0 ${bwIn} ${bwOut}`);
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

// stop bw
app.post("/api/bw/stop", async (_, res) => {
  try {
    await executeCmd(`wondershaper clear eth0`);
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

//reset views
const resetViews = () => {
  try {
    await axios.post("https://api.streamwell.in/api/view/reset", {
      ip: ip.address(),
    });
  } catch (e) {
    console.error(`error in reseting views ${e}`);
  }
};

(() => {
  try {
    app.listen(PORT, () => {
      console.log("server running on PORT", PORT, new Date().toString());
    });
    await resetViews();
  } catch (error) {
    console.log("error in starting util server", error.message);
    process.exit(0);
  }
})();
