function(context, args) // { target: #s.some.npc }
{
	const u = #fs.sarahisweird.utils();
	const primeNumbers = u.getPrimes(100);

	const keys = {};

	const target = args.target;
	let res = target.call(keys);

	function tryAll(choices, lock, failMsg) {
		let i = 0;
	
		while (i < choices.length) {
			const choice = choices[i];
			keys[lock] = choice;
			res = target.call(keys);

			if (!res.includes(failMsg)) {
				#D(`Unlocked ${lock}: ${choice}`);
				return i;
			}

			i++;
		}

		#D(`Failed to unlock ${lock}!`);
		return null;
	}

	function unlock_ez_21() {
		if (tryAll(u.ez, "ez_21", "unlock command") == null) {
			#D("Fez_21!");
			return false;
		}

		return true;
	}

	function unlock_ez_35() {
		const ez35Result = tryAll(u.ez, "ez_35", "unlock command");
		if (ez35Result == null) return #D("F ez_35!");

		const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
		if (tryAll(digits, "digit", "digit") == null) {
			#D(keys);
			#D("Fa ez_35 digit!");
			return false;
		}

		return true;
	}

	function unlock_ez_40() {
		const ez40Result = tryAll(u.ez, "ez_40", "unlock command");
		if (ez40Result == null) return #D("Failed to unlock ez_40!");

		if (tryAll(primeNumbers, "ez_prime", "prime") == null) {
			#D(keys);
			#D("Failed to unlock ez_40 prime!");
			return false;
		}

		return true;
	}

	function unlock_c001() {
		const c001Index = tryAll(u.colors, "c001", "color name");
		if (c001Index == null) {
			#D("F c001!");
			return false;
		}

		keys.color_digit = u.getColors(c001Index).color.length;
		res = target.call(keys);
		if (res.includes("color digit")) {
			#D(keys);
			#D("Invalid color digit!");
			return false;
		}
		return true;
	}

	function unlock_c002() {
		const c002Index = tryAll(u.colors, "c002", "color name");
		if (c002Index == null) {
			#D("Failed to unlock c002!");
			return false;
		}

		keys.c002_complement = u.getColors(c002Index).complement;
		res = target.call(keys);
		if (res.includes("complement color")) {
			#D(keys);
			#D("Invalid complement color!");
			return false;
		}

		return true;
	}

	function unlock_c003() {
		const c003Index = tryAll(u.colors, "c003", "color name");
		if (c003Index == null) return #D("Failed to unlock c003!");

		const colors = u.getColors(c003Index);
		keys.c003_triad_1 = colors.triad1;
		keys.c003_triad_2 = colors.triad2;
		res = target.call(keys);
		if (res.includes("triad color.")) {
			#D("Invalid triad color!");
			return false;
		}

		return true;
	}

	function unlock_l0cket() {
		if (tryAll(u.locket, "l0cket", "security k3y") == null) {
			#D("Failed to unlock l0cket!");
			return false;
		}

		return true;
	}

	function unlock_data_check() {
		keys.DATA_CHECK = "";
		res = target.call(keys);
		keys.DATA_CHECK = u.getDataCheckAnswer(res);

		res = target.call(keys);
		if (res.includes("++++++")) {
			#D("Failed to unlock DATA_CHECK!");
			return false;
		}

		return true;
	}

	const unlockers = {
		"EZ_21": unlock_ez_21,
		"EZ_35": unlock_ez_35,
		"EZ_40": unlock_ez_40,
		"c001": unlock_c001,
		"c002": unlock_c002,
		"c003": unlock_c003,
		"l0cket": unlock_l0cket,
		"DATA_CHECK": unlock_data_check,
	};

	function getUnlocker() {
		const parts = res.split("\n");
		const currentLock = parts[parts.length - 1];
		for (const [k, v] of Object.entries(unlockers)) {
			if (currentLock.includes(k)) return v;
		}

		return null;
	}

	let lastUnlocker = null;
	while (res.includes && res.includes("Denied")) {
		const unlocker = getUnlocker();
		if (unlocker == null) {
			#D(keys);
			#D(res);
			return #D("No matching unlocker found!");
		}

		if (lastUnlocker == unlocker) {
			#D("Loop caught!");
			#D(keys);
			return #D(res);
		}

		if (!unlocker()) {
			#D(keys);
			return #D(res);
		}

		lastUnlocker = unlocker;
	}

	#D(keys);
	return #D(res);
}
