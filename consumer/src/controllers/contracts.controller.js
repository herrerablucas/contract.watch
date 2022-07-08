const axios = require('axios').default;

const { processStr } = require("solhint");
const { loadConfig } = require('solhint/lib/config/config-file');

const ETHERSCAN_API_URL = 'https://api.etherscan.io/api';

const getContractSource = async (contract_address) => {
	try {
		const { data } = await axios.get(`${ETHERSCAN_API_URL}`, {
			params: { 
				module: 'contract',
				action: 'getsourcecode',
				address: contract_address,
				apiKey: process.env.ETHERSCAN_API_KEY
			}
		});

		return data;
	} catch(err) {
		return [];
	}
}

const runSolhintOnContract = async(contract_address) => {
	let { status, message, result: [ contract ] } = await getContractSource(contract_address);

	let outputs = {};
	if (status == '1' && message == 'OK') {
		let multipleSources = {};
		try {
			let { sources } = JSON.parse(contract.SourceCode.slice(1, -1));
			for (let key in sources) {
				let context = sources[key].content;

				let { reports } = processStr(context, loadConfig());

				multipleSources[key] = reports;
			}
			outputs[contract_address] = multipleSources;
		} catch(err) {
			let source = contract.SourceCode;
			let { reports } = processStr(source, loadConfig());
			
			multipleSources[contract.ContractName] = reports;
			outputs[contract_address] = multipleSources;
		}
	}

	return outputs;
}

module.exports = {
	runSolhintOnContract,
	getContractSource
}