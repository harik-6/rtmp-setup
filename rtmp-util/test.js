const axios = require("axios");
const ip = require("ip");

//exe
const { exec } = require("child_process");

//variables
const API = "https://api.streamwell.in/api";

// configuring server

//=================================
// BW LIMITER JOB
const testbandwidth = async () => {
  const ipaddr = ip.address();
  console.log("ipaddress - ", ipaddr);
  console.log(`url - ${API}/server/ip?addr=${ipaddr}`);
  const resp = await axios.get(`${API}/server/ip?addr=${ipaddr}`);
  console.log("payload", resp.payload);
  console.log(`exe - wondershaper eth0 ${bwIn} ${bwOut}`);
  exec(`wondershaper eth0 ${bwIn} ${bwOut}`, (err, _param1, _param2) => {
    if (err) {
      console.log("error in start limiting BW", err);
      return;
    }
    console.log(`bw limit started in-${bwIn} out-${bwOut}`);
    return;
  });
};

//=================================

(() => {
  testbandwidth();
})();
