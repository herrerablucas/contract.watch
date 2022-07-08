require('dotenv').config();
const cheerio 	  = require("cheerio");
const cron 	  	  = require('node-cron');
const express     = require("express");
const { program } = require('commander');

program
  .option('-s, --solhint', 'run solhint module on new contracts')

program.parse(process.argv);
const options = program.opts();

const app     = express();
const port    = process.env.PORT || 3002;

const LatestContract  = require("./src/utils/contract");
const contractsRouter = require('./src/routes/contracts.route');
const scansRouter     = require('./src/routes/scans.route');

const {
	getLastTrackedContract,
	fetchNewContracts,
	getLastestVerifiedContracts
} = require('./src/controllers/contracts.controller');

app.use('/contracts', contractsRouter);
app.use('/scans', scansRouter);

(async () => {
	LatestContract.set(await getLastTrackedContract());

	cron.schedule('*/5 * * * *', () => {
		console.log('Fetching new contracts...');
		await fetchNewContracts(options);
	});
})();

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

