function(context, args)
{
	const lib = #fs.scripts.lib();

	const txs = #hs.accts.transactions({ count: "all" });

	const { start, end } = args;
	let foundStart = false;
	let foundEnd = false;
	let net = 0;
	for (const tx of txs) {
		const { time, amount, sender } = tx;
		const timeStr = lib.to_game_timestr(time);
		if (!foundStart && timeStr != start) continue;
		foundStart = true;

		if (foundEnd && timeStr != end) break;
		if (timeStr == end) foundEnd = true;

		if (args.memos) {
			if (tx.memo && (sender != "sarahisweird")) {
				net += amount;
			}
		} else {
			net += amount * (sender == "sarahisweird" ? -1 : 1);
		}
	}

	return net;
}
