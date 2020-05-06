const Router = require("express-promise-router");
const db = require("../../utils/db");
const {
	UpdateCacheData,
	GetServerCache,
	ClearCache,
} = require("../../utils/data");
const { verifyRequest, verifyParam } = require("../../utils/request");
const notifier = require("../../notification/notifier");

const config = require("config");
const states = config.get("states");

const router = new Router();

router.post("/:serverid", async function (req, res, next) {
	let server = req.params.serverid;

	if (verifyRequest(req) === false || verifyParam(server) === false) {
		res.json({ result: false, msg: "request invalid" });
		return;
	}

	// Update cache
	let serverCache = GetServerCache(server);
	if (!serverCache) {
		let dbData = await db.query(
			`SELECT * FROM servers WHERE identifier='${server}'`
		);
		if (dbData && dbData.rows.length > 0) {
		} else {
			await db.query(`INSERT INTO servers(
                name, 
                identifier) 
            VALUES (
                '${server}',
                '${server}')`);
		}
		ClearCache();
	}

	let data = req.body;
	if (data.cpu && data.cpu.usage) {
		UpdateCacheData(server, "cpu", data.cpu.usage);

		if (data.cpu.loadavg && data.cpu.loadavg.length > 1) {
			let identifier = `${server}-cpu`;
			let cpuAvg = data.cpu.loadavg[1];
			if (cpuAvg >= states.cpu.danger)
				notifier.SendDanger(server, `Average CPU load in the last 5 minutes is: ${cpuAvg.toFixed(1)} %, current is: ${data.cpu.usage.toFixed(1)} %`, identifier);
			else if (cpuAvg >= states.cpu.warn)
				notifier.SendWarning(server, `Average CPU load in the last 5 minutes is ${cpuAvg.toFixed(1)}`, identifier);
			else
				notifier.ClearIdentifier(identifier);
		}
	}
	if (data.memory && data.memory.usedMemMb && data.memory.totalMemMb) {
		let memoryAvg = (data.memory.usedMemMb / data.memory.totalMemMb) * 100;
		UpdateCacheData(server, "memory", memoryAvg);

		let identifier = `${server}-memory`;
		if (memoryAvg >= states.memory.danger)
			notifier.SendDanger(server, `Current memory usages is: ${memoryAvg.toFixed(1)} %`, identifier);
		else if (memoryAvg >= states.memory.warn)
			notifier.SendWarning(server, `Current memory usages is: ${memoryAvg.toFixed(1)} %`, identifier);
		else
			notifier.ClearIdentifier(identifier);
	}
	if (data.network && data.network.total) {
		UpdateCacheData(server, "networkInput", data.network.total.inputMb);
		UpdateCacheData(server, "networkOutput", data.network.total.outputMb);
	}
	if (data.disk && data.disk.usedPercentage) {
		let diskAvg = parseFloat(data.disk.usedPercentage);
		UpdateCacheData(server, "disk", diskAvg);

		let identifier = `${server}-disk`;
		if (diskAvg >= states.disk.danger)
			notifier.SendDanger(server, `${diskAvg.toFixed(1)} % disk space are used`, identifier);
		else if (diskAvg >= states.disk.warn)
			notifier.SendWarning(server, `${diskAvg.toFixed(1)} % disk space are used`, identifier);
		else
			notifier.ClearIdentifier(identifier);
	}
	if (data.os && data.os.uptime)
		UpdateCacheData(server, "uptime", data.os.uptime);
	if (data.process && data.process.total)
		UpdateCacheData(server, "process", data.process.total);
	if (data.file && data.file.open) {
		UpdateCacheData(server, "openFiles", data.file.open);

		let identifier = `${server}-openFiles`;
		if (data.file.open >= states.disk.danger)
			notifier.SendDanger(server, `Total opened files is reaching limit, current is: ${data.file.open}`, identifier);
		else if (data.file.open >= states.disk.warn)
			notifier.SendWarning(server, `Total opened files is: ${data.file.open}`, identifier);
		else
			notifier.ClearIdentifier(identifier);
	}
	if (data.time) UpdateCacheData(server, "time", data.time);

	// Insert to Database
	try {
		await db.query(`INSERT INTO logs(
            cpu, 
            memory, 
            network, 
            disk, 
            os, 
            process, 
            file, 
            time,
            server) 
        VALUES (
            '${data.cpu ? JSON.stringify(data.cpu) : "{}"}',
            '${data.memory ? JSON.stringify(data.memory) : "{}"}',
            '${data.network ? JSON.stringify(data.network) : "{}"}',
            '${data.disk ? JSON.stringify(data.disk) : "{}"}',
            '${data.os ? JSON.stringify(data.os) : "{}"}',
            '${data.process ? JSON.stringify(data.process) : "{}"}',
            '${data.file ? JSON.stringify(data.file) : "{}"}',
            ${data.time},
            '${server}')`);

		res.json({ result: true });
	} catch (err) {
		console.info(`Request from ${server} to logs:`);
		console.info(data);
		console.error(err);

		res.json({ result: false, msg: "insert to db failed" });
	}
});

module.exports = router;
