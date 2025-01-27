function(context, args)
{
	// Sparkasse is a German bank. :)

	const caller = context.caller;
	const callingScript = context.calling_script;

	const authorizedCallingScripts = [
		"sarahisweird.unlocker",
		"sarahisweird.hecking",
	];
	const authorizedUsers = [
		'sarahisweird',
		'sahara',
	];

	if (!authorizedUsers.includes(caller) && !authorizedCallingScripts.includes(callingScript)) {
		#ms.accts.xfer_gc_to({ to: 'sahara', amount: '1GC', memo: '>:(' });
		return { ok: false, msg: '\`DYou are not authorized to use this script!\`' };
	}

	if (!args || typeof(args) !== 'object' || (!args.get_balance && (args.withdraw === undefined))) {
		return { ok: false, msg: `Usage: ${context.this_script} { \`Nget_balance\`: \`Vtrue\` \`C|\` \`Nwithdraw\`: \`Vamount\` }` };
	}

	if (args.get_balance) {
		const balance = #fs.accts.balance_of_owner();
		return { ok: true, bal: balance, max: 5_000_000_000 };
	}

	const withdrawAmount = args.withdraw;
	#fs.accts.xfer_gc_to_caller({ amount: withdrawAmount, memo: "Wenn's ums Geld geht, Sparkasse." });

	return { ok: true, msg: 'Wenns ums Geld geht, Bank?' };
}
