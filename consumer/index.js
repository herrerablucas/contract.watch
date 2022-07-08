require('dotenv').config();
const cron = require('node-cron');
const axios = require('axios').default;
const { program } = require('commander');

const db = require("./src/services/db.service");

const modules = require("./src/modules/index");

program
	.option('-t, --timeout <number>', 'set the timeout to prevent etherscan\'s rate-limit', 5000)
	.option('-m, --module <name>', 'set the module the consumer will run');

program.parse(process.argv);
const options = program.opts();

(async () => {
	if (!(options.module in modules)) {
		console.log('Invalid module. There\'s no registered module with this name.');
		return process.exit(1);
	}
	modules[options.module].call();
})()

