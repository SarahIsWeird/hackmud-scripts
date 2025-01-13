function(context, args)
{
	const lib = #fs.scripts.lib();
	const utils = #fs.sarahisweird.utils();

	const blogValues = ["blog", "news_posts", "news", "happening", "action", "posts", "developments", "latest", "updates"];

	if (args == null) {
		return { ok: false, msg: "Either use /scrape or sarahisweird.scraper show." };
	}

	if (args.input == "show") {
		return { ok: true, msg: `We know of ${utils.knownUsers.length} users:\n${utils.knownUsers.join(", ")}` };
	}

	let shifts = "";

	function getUsers(target) {
		const callKeys = {};
		let res = target.call(callKeys);
		if (res.ok == false && res.msg && res.msg.includes("Shift operation")) {
			shifts += `Shift operation in progress for ${target.name}!\n`;
			return null;
		}

		let keyFound = false;
		for (const blogToTest of blogValues) {
			for (const keyToTest of utils.navKeys) {
				callKeys[keyToTest] = blogToTest;
			}

			res = target.call(callKeys)

			if (lib.is_arr(res)) {
				keyFound = true;
				break;
			}
		}

		if (!keyFound) {
			#D(`Couldn't find blog for ${target.name}`);
			return null;
		}

		const users = [];
		const ofProjectRegex = /\n([a-zA-Z0-9_]+) of pr/;
		const whenAskedRegex = / ([a-zA-Z0-9_]+) when /;
		for (const entry of res) {
			let user = ofProjectRegex.exec(entry);
			if (user != null) {
				users.push(user[1]);
				continue;
			}

			user = whenAskedRegex.exec(entry);
			if (user != null) {
				users.push(user[1]);
			}
		}

		return users;
	}

	const allUsersTmp = [];
	for (const target of args.targets) {
		const res = getUsers(target);
		if (res == null) continue;
		allUsersTmp.push(res);
	}

	const allUsers = lib.uniq(allUsersTmp.flat().sort());
	const newUsers = allUsers.filter(user => !utils.knownUsers.includes(user));
	const userStrings = newUsers
		.map(user => `"${user}"`)
		.join(", ");
	const msg = `${shifts}Found ${allUsers.length - newUsers.length} old and ${newUsers.length} new user(s):\n${userStrings}`;

	return { ok: true, msg: msg };
}
