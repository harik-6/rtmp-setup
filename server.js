const express = require("express");
const helmet = require("helmet");
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

(() => {
  try {
    app.listen(PORT, () => {
      console.log("server running on PORT", PORT, new Date().toString());
    });
  } catch (error) {
    console.log("error in starting util server", error.message);
    process.exit(0);
  }
})();
