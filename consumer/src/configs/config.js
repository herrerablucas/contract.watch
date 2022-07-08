const db = {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
}

const etherscan = {
	apiKey: process.env.ETHERSCAN_API_KEY
}

const rabbitmq = {
	ipAddress: process.env.RABBITMQ_IP_ADDRESS
}

module.exports = {
	db,
	etherscan,
	rabbitmq
}