const express = require("express");
const helmet = require("helmet");
const { exec } = require("child_process");
//variables
const app = express();
const PORT = 63000;

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
        reject(err);
      }
      resolve(true);
    });
  });
};

app.post("/update", async (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      message: "update started",
    });
    console.log("creating temp dir");
    await executeCmd("mkdir temp");
    console.log("cloning repo");
    await executeCmd(
      "cd temp && git clone https://github.com/harik-6/rtmp-setup.git && cd .."
    );
    console.log("moving package.json and src dir");
    await executeCmd("mv ~/rtmp-setup/temp/src ~/rtmp-setup/src");
    await executeCmd(
      "mv ~/rtmp-setup/temp/package.json ~/rtmp-setup/package.json"
    );
    console.log("installing dep");
    await executeCmd("cd ~/rtmp-setup && npm install");
    console.log("cleaning up temp");
    await executeCmd("rm -rf ~/rtmp-setup/temp");
    console.log("restarting sw server");
    await executeCmd("pm2 restart sw");
  } catch (e) {}
});

const startServer = () => {
  try {
    console.log("Legacy server started", new Date().toString());
    app.listen(PORT, () => {
      console.log("Legacy server running on PORT", PORT);
    });
  } catch (error) {
    console.log("Error in starting legacy server", error.message);
    process.exit(0);
  }
};

startServer();
