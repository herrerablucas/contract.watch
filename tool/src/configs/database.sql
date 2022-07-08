CREATE TABLE contracts (
    id serial PRIMARY KEY,
    hash TEXT UNIQUE NOT NULL,
	name TEXT,
	compiler TEXT,
	version TEXT,
	balance NUMERIC,
	txns INTEGER,
	license TEXT,
	added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scans (
	id serial PRIMARY KEY,
	output TEXT NOT NULL,
	hash TEXT NOT NULL,
	added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_contract
    	FOREIGN KEY(hash) 
			REFERENCES contracts(hash)
);