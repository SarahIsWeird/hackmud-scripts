import { authorizedUsers } from '/lib/common';

export default function(context: Context, args?: any) {
	// Sparkasse is a German bank. :)

	const lib = $fs.scripts.lib();
	const caller = context.caller;
	const callingScript = context.calling_script;

	const authorizedCallingScripts = [
		"sarahisweird.unlocker",
		"sarahisweird.hecking",
	];

	if (!authorizedUsers.includes(caller) && !authorizedCallingScripts.includes(callingScript || '')) {
		$ms.accts.xfer_gc_to({ to: 'sahara', amount: '1GC', memo: '>:(' });
		return { ok: false, msg: '\`DYou are not authorized to use this script!\`' };
	}

	const usage = {
		ok: false,
		msg: `Usage: ${context.this_script} { ` +
			'`Nget_balance`: `Vtrue` `C|` ' +
			'`Nwithdraw`: `Vamount` `C|` ' +
			'`Nlist_keys`: `Vtrue` `C|` ' +
			'`Nk3y`: `Vkey` ' +
			'}',
	};

	if (!args || typeof(args) !== 'object') {
		return usage;
	}

	if (args.get_balance) {
		const balance = $fs.accts.balance_of_owner();
		return { ok: true, bal: balance, max: 5_000_000_000 };
	}

	if (args.withdraw) {
		const withdrawAmount = args.withdraw;
		$fs.accts.xfer_gc_to_caller({ amount: withdrawAmount, memo: "Wenn's ums Geld geht, Sparkasse." });

		return { ok: true, msg: 'Wenns ums Geld geht, Bank?' };
	}

	if (!authorizedUsers.includes(caller)) return { ok: false, msg: 'No keys for you!' };

	const keys = $fs.sys.upgrades_of_owner({
		full: true,
		filter: {
			name: { $in: ['k3y_v1', 'k3y_v2'] },
		} as unknown as Partial<{ name: string }>, // :(
	});

	if (!Array.isArray(keys)) {
		return { ok: false, msg: 'Failed to get own keys!' };
	}

	if (args.list_keys) {
		const sortedKeys = keys.map(upgrade => upgrade.k3y as string).sort();
		return lib.uniq(sortedKeys);
	}

	if (args.k3y) {
		const index = keys.findIndex(upgrade => upgrade.k3y === args.k3y);
		if (index === -1) return { ok: false, msg: 'No havey :(' };

		const result = $fs.sys.xfer_upgrade_to_caller({ i: keys[index].i, memo: ':3' });
		if (!result.ok) return result;

		return { ok: true, msg: '<3' };
	}

	return usage;
}
