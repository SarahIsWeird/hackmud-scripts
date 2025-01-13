function(context, args) // { target: #s.cyberdine.memberlogin, user: "" }
{
	const lib = #fs.scripts.lib();
	const utils = #fs.sarahisweird.utils();

	const usage = { ok: false, msg: `Usage: ${context.this_script} { target: #s.0 }` };
	if (!lib.is_obj(args)) return usage;

	const { target, user_only: getUserOnly } = args;
	if (!lib.is_obj(target) || !lib.is_str(target.name) || !lib.is_func(target.call)) return usage;

	const keys = {};
	function setNav(navTarget) {
		for (const navKey of utils.navKeys) {
			keys[navKey] = navTarget;
		}
	}

	setNav("order_qrs");

	let username = null;
	for (const user of utils.knownUsers) {
		keys.username = user;
		const res = target.call(keys);
		if (res.includes("member") || res.includes("account")) {
			continue;
		}

		username = user;
		break;
	}

	if (username == null) {
		return { ok: false, msg: "Couldn't find correct username!" };
	}

	if (getUserOnly) {
		return { ok: true, msg: `${target.name} {username: "${username}"}` };
	}

	const data = #fs.dtr.qr({ t: target, a: keys });

	const highsecLocs = [];
	const midsecLocs = [];

	setNav("cust_service");
	for (const order of data) {
		keys.order_id = order.id;

		const serviceResponse = target.call(keys);
		const locs = [...serviceResponse.matchAll(/\s(\w+\.\w+)\s/g)]
			.map(match => match[1])
			.filter(loc => loc != "NaN.NaN");

		for (const loc of locs) {
			const secLevel = #fs.scripts.get_level({ name: loc });
			if (secLevel == 3) {
				highsecLocs.push(loc);
			} else if (secLevel == 2) {
				midsecLocs.push(loc);
			}
		}
	}

	const msg = `Found ${highsecLocs.length} HIGHSEC locs:\n${highsecLocs.join("\n")}\nFound ${midsecLocs.length} MIDSEC locs:\n${midsecLocs.join("\n")}`;

	return { ok: true, msg };
}
