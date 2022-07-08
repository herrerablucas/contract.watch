const amqp = require("amqplib");

const connect = async () => {
	const conn = await amqp.connect("amqp://localhost");
	return await conn.createChannel();
}

const createQueue = async (channel, queue) => {
	try {
    	channel.assertQueue(queue, { durable: true });
		return { ok: true, channel };
    } catch(err) {
		return { ok: false, err };
	}
}

const sendToQueue = async (queue, message) => {
	try {
		const channel = await connect();
		await createQueue(channel, queue);
		await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
		return {ok: true }
	} catch (err) {
		console.log({ ok: false, err });
	}
}
 
const consume = async (queue, callback) => {
	try {
		const channel = await connect();
		await createQueue(channel, queue);
		await channel.consume(queue, (message) =>
			callback(message, channel), { noAck: false }
		);
		return { ok: true };
	} catch (err) {
		console.log({ ok: false, err });
	}
}
 
module.exports = {
	sendToQueue,
	consume
}