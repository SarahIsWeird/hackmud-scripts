function(context, args)
{
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
	const locket = ["6hh8xw", "cmppiq", "sa23uw", "tvfkyq", "uphlaw", "vc2c7q", "xwz7j4"];

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

	const navKeys = ["navigation", "entry", "get", "see", "command", "process", "open", "action", "nav", "cmd", "show"];
	const knownUsers = [
		"thedude", "yung_lespaul", "b4rry_vv", "amelie", "theformalartist",
		"htubman", "revolution808", "thepowerful", "chad_bose",
		"firebreathingdragon", "duke_ell", "marc_garv", "zap_dweezil", "rain3y",
		"cking", "cheechfiend91", "ice_ventura", "h_jimi", "x_mal",
		"call_me_hal", "gwashc", "q_bey", "m_poppins", "ada_love", "du_boyz",
		"hypati4_370", "d4ria", "bella_swan", "daurmith", "daa_freak",
		"journer_of_truth", "will_de_vaughn", "d0ctor_wh0m", "poitier_27",
		"curtfields0fmay", "troy_cole", "bus_and_parks", "king_in_yellow",
		"there_is_enoether", "c_vader", "scook", "computer_blue",
		"jack_sparrow", "m_clarke_dunk", "wiley_curry", "lizzie_regna",
		"thegreat", "runningman23", "purple1", "boris", "jermaine",
		"youngtwokay", "frantimike", "madthugpug", "inigo", "bassy_thecount",
		"cr1sp", "rey_tr4cer", "king_luther", "leon", "shawn_aa",
		"thegreatvandross", "wonderous_steve", "turner_t", "_3rd_3y3_grill",
		"be_lavar", "carrie_on_", "doc_brown", "huey_n", "jamesb",
		"mh_hamilton", "rob_rob_taylor", "shareef_j", "zap_moon"
	];

	return {
		ok: true,
		colors,
		getColors,
		getPrimes,
		ez: ez,
		locket: locket,
		getDataCheckAnswer,
		navKeys,
		knownUsers,
	};
}
