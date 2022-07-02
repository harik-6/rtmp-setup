const { executeCmd } = require('./util');

const updateFile = () => {
  try {
    console.log(
      "---------------------------UPDATE STARTED---------------------------------"
    );
    console.log("Creating 'temp' directory");
    await executeCmd("mkdir ~/temp");
    console.log("Cloning repo");
    await executeCmd(
      "cd ~/temp && git clone https://github.com/harik-6/rtmp-setup.git && cd .."
    );
    console.log("Removing present 'src' directory");
    await executeCmd("rm -rf ~/rtmp-setup/src");
    console.log("Updating 'src' directory");
    await executeCmd("mv ~/temp/rtmp-setup/src ~/rtmp-setup/src");
    console.log("Updating 'package.json' file");
    await executeCmd(
      "mv ~/temp/rtmp-setup/package.json ~/rtmp-setup/package.json"
    );
    console.log("Installing npm dependacies");
    await executeCmd("cd ~/rtmp-setup && npm install");
    console.log("Cleaning up 'temp' directory");
    await executeCmd("rm -rf ~/temp");
    console.log("Restarting SW server");
    await executeCmd("pm2 restart sw-server");
    console.log("GET call to server/api/ping to check new version number");
    console.log(
      "---------------------------UPDATE COMPLETED---------------------------------"
    );
  } catch (e) {
    console.error("Error in updating code", e);
  }
}

module.exports = {
  updateFile
}