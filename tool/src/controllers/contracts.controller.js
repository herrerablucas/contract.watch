const cheerio = require("cheerio");
const axios = require('axios').default;
const db = require("../services/db.service");
const LatestContract = require("../utils/contract");

const { sendToQueue } = require("../services/rabbitmq.service");

const ETHERSCAN_URL = 'https://etherscan.io';

const getVerifiedContracts = async (page, page_size) => {
	try {
		const { data } = await axios.get(
			`${ETHERSCAN_URL}/contractsVerified/${page}`, {
				params: {
					ps: page_size
				}
		});
		return data;
	} catch(err) {
		return [];
	}
}

const getLastestVerifiedContracts = async () => {
	let contracts = [];

	for (let i = 0; i < 1; i++) {
		contracts.push(getVerifiedContracts(i, 10));
	}

	return (await Promise.all(
		(await Promise.all(contracts))
			.map((contract) => parseVerifiedContracts(contract)
	))).flat();
}

const parseVerifiedContracts = async (data) => {
	try {
		const $ = cheerio.load(data);

		let contracts = [];

		const body = $("tbody tr");
		body.each(function (idx, el) {
			let contract = []; 
			$(this).children()
				.each((i, el) => contract.push($(el).text().trim()));

			let [ hash, name, compiler, version, balance, txns, setting, verified, audited, license ] = contract;
			contracts.push({ hash, name, compiler, version, balance, txns, setting, verified, audited, license });
		});

		return contracts;
	} catch (err) {
		console.log(err);
		return [];
	}
}

const getLastTrackedContract = async () => {
	let { rows: [hash] } = await db.query('SELECT hash from contracts ORDER BY added_at ASC LIMIT 1');
	return (hash ? hash : []);
}

const filterTrackedContracts = (contracts) => {
	let index;
	for (let i = 0; i < contracts.length; i++) {
		if (contracts[i][0] == LatestContract.get()) {
			index = i;
			break;	
		}
	}
	return contracts.slice(0, index != -1 ? index : contracts.length);
}

const fetchNewContracts = async(options) => {
	let contracts = await getLastestVerifiedContracts();

	contracts = filterTrackedContracts(contracts);

	let results = await Promise.allSettled(contracts.map(({ hash, name, compiler, version, balance, txns, license }) =>
		db.query('INSERT INTO contracts (hash, name, compiler, version, balance, txns, license) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING hash',
		[ hash, name, compiler, version, parseFloat(balance), parseInt(txns), license ])
	));

	let firstFulfilled;
	for (let i = 0; i < results.length; i++) {
		if (results[i].status == "fulfilled") {
			let hash = results[i].value.rows[0].hash;
			if (!firstFulfilled) LatestContract.set(hash);

			if (options.solhint) {
				sendToQueue("solhint", { hash });
			}
		}
	}

	if (options.solhint) {
		console.log('Running solhint on new contracts');
	}
}

const getContracts = async (req, res, next) => {
	let { page, pageSize } = req.query;

	let rows;
	if (page && pageSize) {
		rows = await db.query(
			`SELECT
				id, hash, name, compiler, version, balance, txns, license, added_at
			FROM
				contracts
			ORDER BY added_at ASC
			LIMIT $1 OFFSET (($2 - 1) * $1)`,
			[pageSize, page]
		);
	} else {
		rows = await db.query('SELECT id, hash, name, compiler, version, balance, txns, license, added_at from contracts');
	}
	res.status(200).json({ contracts: rows.rows });
}

module.exports = {
	getLastTrackedContract,
	fetchNewContracts,
	getContracts,	
}

