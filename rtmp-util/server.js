const express = require("express");
const helmet = require("helmet");
const fs = require("fs");
const packagejson = require("./package.json");

//exe
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
// app.use((req, res, next) => {
//   if (req.headers.origin === "api.streamwell.in") {
//     next();
//   } else {
//     res.status(401).json({
//       error: "unauthorized",
//     });
//   }
// });

//=================================

const logger = {
  log: (...args) => {
    console.log(new Date().toString(), args.join(" "));
  },
  error: (...args) => {
    console.error("\x1b[31m", new Date().toString(), args.join(" "), "\x1b[0m");
  },
};

const executeCmd = async (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (err, _param1, _param2) => {
      if (err) {
        logger.error(`failed executing ${command} - ${err.message}`);
        reject(err);
        return;
      }
      logger.log(`success executing ${command}`);
      resolve("success");
    });
  });
};

const getHlsCount = async () => {
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
        logger.error(`error in running hls count for loop - ${log}`, cerr);
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
    return ipCountMap;
  } catch (error) {
    throw new Error(error.message);
  }
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

//hls count
app.get("/api/hls", async (_, res) => {
  try {
    const count = await getHlsCount();
    await executeCmd(`cat /dev/null > ${NGINX_ACCESS_FILE}`);
    res.status(200).json({
      status: "success",
      payload: count,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      payload: error.message,
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

// to reboot nginx
app.post("/api/restart", async (req, res) => {
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

const startServer = () => {
  try {
    logger.log("util server started", new Date().toString());
    app.listen(PORT, () => {
      logger.log("util server running on PORT", PORT);
    });
  } catch (error) {
    logger.log("error in starting util server", error.message);
    process.exit(0);
  }
};

startServer();
