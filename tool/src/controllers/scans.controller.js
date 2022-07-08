const db = require("../services/db.service");

const getScans = async (req, res, next) => {
	let { page, pageSize } = req.query;

	let rows;
	if (page && pageSize) {
		rows = await db.query(
			`SELECT
				id, hash, output, added_at
			FROM
				scans
			ORDER BY added_at ASC
			LIMIT $1 OFFSET (($2 - 1) * $1)`,
			[pageSize, page]
		);
	} else {
		rows = await db.query('SELECT id, hash, output, added_at from scans');
	}
	res.status(200).json({ contracts: rows.rows });
}

module.exports = {
	getScans
}