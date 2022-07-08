const { consume } = require("../services/rabbitmq.service");
const { runSolhintOnContract } = require("../controllers/contracts.controller");

module.exports = {
	name: 'solhit',
	call: () => {
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
	}
}