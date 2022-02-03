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

app.post("/legacy/ping", async (req, res) => {
  res.status(200).json({
    status: "success",
    payload: {
      health: "OK",
    },
  });
});

app.post("/legacy/update", async (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      message: "update started",
    });
    console.log(
      "---------------------------UPDATE STARTED---------------------------------"
    );
    console.log("Stopping SW server");
    await executeCmd("pm2 stop sw");
    console.log("Creating 'temp' directory");
    await executeCmd("mkdir temp");
    console.log("Cloning repo");
    await executeCmd(
      "cd temp && git clone https://github.com/harik-6/rtmp-setup.git && cd .."
    );
    console.log("Removing present 'src' directory");
    await executeCmd("rm -rf ~/rtmp-setup/src");
    console.log("Updating 'src' directory");
    await executeCmd("mv ~/rtmp-setup/temp/rtmp-setup/src ~/rtmp-setup/src");
    console.log("Updating 'package.json' file");
    await executeCmd(
      "mv ~/rtmp-setup/temp/rtmp-setup/package.json ~/rtmp-setup/package.json"
    );
    console.log("Installing npm dependacies");
    await executeCmd("cd ~/rtmp-setup && npm install");
    console.log("Cleaning up 'temp' directory");
    await executeCmd("rm -rf ~/rtmp-setup/temp");
    console.log("Restarting SW server");
    await executeCmd("pm2 restart sw");
    console.log("GET call to server/api/ping to check new version number");
    console.log(
      "---------------------------UPDATE COMPLETED---------------------------------"
    );
  } catch (e) {
    console.error("Error in updating code", e);
  }
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
