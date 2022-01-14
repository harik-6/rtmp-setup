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

// stop bw
app.post("/api/exec", async (_, res) => {
  try {
    const command = req.query["cmd"].toString();
    await executeCmd(command);
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
