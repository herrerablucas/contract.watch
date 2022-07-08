require('dotenv').config();
const cron = require('node-cron');
const axios = require('axios').default;
const { program } = require('commander');

const db = require("./src/services/db.service");

const { consume } = require("./src/services/rabbitmq.service");
const { runSolhintOnContract } = require("./src/controllers/contracts.controller");

program
  .option('-t, --timeout <number>', 'set the timeout to prevent etherscan\'s rate-limit', 5000);

program.parse(process.argv);
const options = program.opts();

const ETHERSCAN_URL = 'https://etherscan.io';
const ETHERSCAN_API_URL = 'https://api.etherscan.io/api';

(async () => {
	try {
		consume("solhint", async (message, channel) => {
			setTimeout(async () => { // necessary because of etherscan's rate-limiting
				const { hash } = JSON.parse(message.content.toString());
				const results = await runSolhintOnContract(hash);

				if (Object.keys(results).length) { // only save output if solhint detected issues 
					let queries = [];
					for (let key in results) {
						queries.push(db.query('INSERT INTO scans (hash, output) VALUES ($1, $2)', [ key, JSON.stringify(results[key]) ]))
					}
					await Promise.allSettled(queries);
				}
				await channel.ack(message);
			}, options.timeout);
	
		})
	} catch (err) {
		console.log(`Couldn't consume the message: ${err}`);
	}
})()

