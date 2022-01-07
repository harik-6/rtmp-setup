const express = require("express");
const helmet = require("helmet");
const axios = require("axios");
const fs = require("fs");
const CronJob = require("cron").CronJob;
const { exec } = require("child_process");

//variables
const NGINX_ACCESS_FILE = "/usr/local/nginx/logs/access.log";
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

//=================================
// HLS COUNT JOB
const hlsCountJob = async () => {
  try {
    const logMap = {};
    const logData = fs.readFileSync(NGINX_ACCESS_FILE, { encoding: "utf8" });
    const stringyfied = logData.toString();
    const regexp = /(.*GET \/hls\/.*m3u8)/g;
    const chregexp = /(\/hls\/.*m3u8)/g;
    const matches = stringyfied.matchAll(regexp);
    for (const match of matches) {
      const log = match[0].toString();
      try {
        const ip = log.split(" - - ")[0];
        const chmatch = log.match(chregexp)[0];
        const byslash = chmatch.split(".m3u8")[0].split("/");
        const channel = byslash[byslash.length - 1];
        if (logMap[channel] === undefined) {
          logMap[channel] = [ip];
        } else {
          logMap[channel].push(ip);
        }
      } catch (cerr) {
        console.log(`Error in running hls count for loop - ${log}`, cerr);
        continue;
      }
    }
    const ipMap = {};
    const ipCountMap = {};
    for (key in logMap) {
      ipMap[key] = [...new Set(logMap[key])];
    }
    for (key in ipMap) {
      ipCountMap[key] = ipMap[key].length;
    }
    const body = {
      ipCountMap,
    };
    console.log("Request body", JSON.stringify(body));
    try {
      await axios.post(
        "https://api.streamwell.in/api/activity/hlscount",
        body,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (resErr) {
      console.log("Error in sending request", resErr.message);
    }
    exec(`cat /dev/null > ${NGINX_ACCESS_FILE}`, (err, _param1, _param2) => {
      if (err) {
        console.log("Error in clearing access log", err);
      }
    });
    console.log("Hls count job ended");
    return;
  } catch (error) {
    console.log("Error in running hls count job", error);
    return;
  }
};

const startHlsCountCronJob = () => {
  // Running every 1 hour to update hls count
  let HLSCOUNT_JOB = new CronJob("0 */1 * * *", async () => {
    hlsCountJob();
  });
  HLSCOUNT_JOB.start();
};
//=================================

//=================================
// BW LIMITER JOB
const startBWLimitingCron = async () => {
  // Runs everyday at 11PM IST
  let CRON_START_JOB = new CronJob("30 3 * * *", async () => {
    exec("wondershaper eth0 30000 5000", (err, _param1, _param2) => {
      if (err) {
        console.log("Error in start limiting BW", error);
        return;
      }
      console.log("BW limit started");
      return;
    });
  });
  // Runs everyday at 6AM IST
  let CRON_STOP_JOB = new CronJob("30 11 * * *", async () => {
    exec("wondershaper clear eth0", (err, _param1, _param2) => {
      if (err) {
        console.log("Error in stop limiting BW", error);
        return;
      }
      console.log("BW limit stopped");
      return;
    });
  });
  CRON_START_JOB.start();
  CRON_STOP_JOB.start();
};

//=================================

// to reboot nginx
app.get("/reboot", async (req, res) => {
  try {
    console.log("Request to restart nginx", new Date().toString());
    // await axios.post("https://api.streamwell.in/api/activity/restart");
    exec("systemctl restart nginx", (err, _param1, _param2) => {
      if (err) {
        res.status(500).json({
          status: "failed",
          error: err.message,
        });
        return;
      }
      res.status(200).json({
        status: "success",
      });
      return;
    });
  } catch (error) {
    console.log("Error in restarting server", error.message);
    res.sendStatus(500).end();
  }
});

// to health ping
app.get("/ping", async (req, res) => {
  res.status(200).json({
    status: "success",
    payload: {
      health: "OK",
      version: process.env.npm_package_version,
    },
  });
});

const startServer = () => {
  try {
    console.log("Starting server at", new Date().toString());
    startHlsCountCronJob();
    startBWLimitingCron();
    app.listen(PORT, () => {
      console.log("Load server running on PORT", PORT);
    });
  } catch (error) {
    console.log("Error in starting server", error.message);
    process.exit(0);
  }
};

startServer();
