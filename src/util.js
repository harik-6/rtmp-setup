//exe
const { exec } = require("child_process");

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

module.exports = {
	executeCmd
}