function(context, args) // { target: #s.some.npc }
{
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

	/***********************
	 * EZ-series unlockers *
	 ***********************/

	function isPrime(n) {
		for (let i = 2; i <= (n / 2); i++) {
			if ((n % i) == 0) return false;
		}

		return true;
	}

	function getPrimes(primeLimit) {
		let primeNumbers = [];

		for (let n = 2; n < primeLimit; n++) {
			if (isPrime(n)) primeNumbers.push(n);
		}

		return primeNumbers;
	}

	const ez = ["open", "unlock", "release"];
	const primeNumbers = getPrimes(100);

	function unlock_ez_21() {
		if (tryAll(ez, "ez_21", "unlock command") == null) {
			#D("Fez_21!");
			return false;
		}

		return true;
	}

	function unlock_ez_35() {
		const ez35Result = tryAll(ez, "ez_35", "unlock command");
		if (ez35Result == null) {
			#D("F ez_35!");
			return false;
		}

		const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
		if (tryAll(digits, "digit", "digit") == null) {
			#D("Fa ez_35 digit!");
			return false;
		}

		return true;
	}

	function unlock_ez_40() {
		const ez40Result = tryAll(ez, "ez_40", "unlock command");
		if (ez40Result == null) {
			#D("Failed to unlock ez_40!");
			return false;
		}

		if (tryAll(primeNumbers, "ez_prime", "prime") == null) {
			#D("Failed to unlock ez_40 prime!");
			return false;
		}

		return true;
	}

	/*************************
	 * c00X-series unlockers *
	 *************************/

	const colors = ["red", "orange", "yellow", "lime", "green", "cyan", "blue", "purple"];
	function getColors(index) {
		const complementIndex = (index + 4) % 8;
		const triad1Index = (index + 5) % 8;
		const triad2Index = (index + 3) % 8;

		if (index == colors.length) return null;

		return {
			index: index,
			color: colors[index],
			complement: colors[complementIndex],
			triad1: colors[triad1Index],
			triad2: colors[triad2Index],
		};
	}

	function unlock_c001() {
		const c001Index = tryAll(colors, "c001", "color name");
		if (c001Index == null) {
			#D("Failed to unlock c001!");
			return false;
		}

		keys.color_digit = getColors(c001Index).color.length;
		res = target.call(keys);
		if (res.includes("color digit")) {
			#D("Invalid color digit!");
			return false;
		}
		return true;
	}

	function unlock_c002() {
		const c002Index = tryAll(colors, "c002", "color name");
		if (c002Index == null) {
			#D("Failed to unlock c002!");
			return false;
		}

		keys.c002_complement = getColors(c002Index).complement;
		res = target.call(keys);
		if (res.includes("complement color")) {
			#D("Invalid complement color!");
			return false;
		}

		return true;
	}

	function unlock_c003() {
		const c003Index = tryAll(colors, "c003", "color name");
		if (c003Index == null) {
			#D("Failed to unlock c003!");
			return false;
		}

		const colors = getColors(c003Index);
		keys.c003_triad_1 = colors.triad1;
		keys.c003_triad_2 = colors.triad2;
		res = target.call(keys);
		if (res.includes("triad color.")) {
			#D("Invalid triad color!");
			return false;
		}

		return true;
	}

	/*************************
	 * l0ck-series unlockers *
	 *************************/

	const locket = ["6hh8xw", "cmppiq", "sa23uw", "tvfkyq", "uphlaw", "vc2c7q", "xwz7j4"];

	function unlock_l0cket() {
		if (tryAll(locket, "l0cket", "security k3y") == null) {
			#D("Failed to unlock l0cket!");
			return false;
		}

		return true;
	}

	/***********************
	 * DATA_CHECK unlocker *
	 ***********************/

	const answers = {
		"pet, pest, plague and meme are accurate descriptors of the ++++++": "bunnybat",
		"user ++++++ provides instruction via script": "teach",
		"users gather in channel CAFE to share ++++++": "poetry",
		"communications issued by user ++++++ demonstrate structural patterns associated with humor": "sans_comedy",
		"safety depends on the use of scripts.++++++": "get_level",
		"user 'on_th3_1ntern3ts' has ++++++ many things": "heard",
		"service ++++++ provides atmospheric updates via the port epoch environment": "weathernet",
		"a ++++++ is a household cleaning device with a rudimentary networked sentience": "robovac",
		"\"did you know\" is a communication pattern common to user ++++++": "fran_lee",
		"user ++++++ uses the port epoch environment to request gc": "outta_juice",
		"data does not contain truth is the first part of an idiom spread by the ++++++ assembly": "skimmerite",
		"sheriff nub holds sway over the town of ol' ++++++": "nubloopstone",
		"conditions are clear above ++++++ and the city is within operational radius": "",
		"the listed components of the breakfast galleon are inside, outside, and ++++++": "crowsnest",
		"robovac_++++++, moreso than most of its kind, has a tendency to become stuck": "idp1p1",
		"the fourth hidden theme is ++++++": "executives",
	};

	function getDataCheckAnswer(prompt) {
		return prompt.split("\n")
			.map(q => answers[q])
			.filter(q => q)
			.join("");
	}

	function unlock_data_check() {
		keys.DATA_CHECK = "";
		res = target.call(keys);
		keys.DATA_CHECK = getDataCheckAnswer(res);

		res = target.call(keys);
		if (res.includes("++++++")) {
			#D("Failed to unlock DATA_CHECK!");
			return false;
		}

		return true;
	}

	/*************
	 * Glue code *
	 *************/

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
