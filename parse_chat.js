function (context, args) // { msg: "Hi" }
{
	const data = {
		axioms: [ "DATA", "KIN", "FORM", "VOID", "CHAOS", "CHOICE", "LAW", "WILD" ],
		axiomLetters: [ "ALPHA", "BETA", "GAMMA", "DELTA", "EPSILON", "ZETA", "THETA", "LAMBDA", "SIGMA", "TAU", "PHI", "PSI", "OMEGA" ],
		graySectors: [ "K", "HJG", "NGC", "SPC", "VNP" ],
		rarityNames: [ "noob", "kiddie", "h4x0r", "h3rdc0r3", "|_|b3|2", "31337" ],
	};

	data.validSectors = [].concat(data.axioms).concat(data.graySectors);

	const defaultColors = {
		scripts: {
			author: "C",
			trust: "F",
			name: "L",
		},
		gc: {
			numbers: "B",
			GC: "C",
			K: "N",
			M: "L",
			B: "J",
			T: "T",
			Q: "Q",
		},
		axioms: {
			DATA: "q",
			KIN: "N",
			FORM: "l",
			VOID: "I",
			CHAOS: "D",
			CHOICE: "F",
			LAW: "n",
			WILD: "E",
			gray: "C",
			K: "C",
			HJG: "C",
			NGC: "C",
			SPC: "C",
			VNP: "C",
		},
		keys: "N",
		values: "V",
		trustCommunication: "D",
		usernames: {
			at: "C",
			name: [ "J", "K", "M", "W", "L", "B" ],
		},
		dates: {
			yearNumber: "A",
			ad: "B",
			dayNumber: "L",
			d: "C",
		},
		rarities: {
			"noob": 0,
			"kiddie": 1,
			"h4x0r": 2,
			"h4rdc0r3": 3,
			"|_|b3|2": 4,
			"31337": 5,
		},
	};

	const api = {
		data: data,
		colors: defaultColors,
	};

	const getUsage = () => {
		const description = 
			"`N" + "message".padStart(15) + "`: the string to parse (`Falias`: `Nmsg`)\n" +
			"`N" + "extended".padStart(15) + "`: whether to use extended parsing (default: false)\n" +
			"`N" + "api".padStart(15) + "`: ignore other parameters and return API (default: false)\n" +
			"`N" + "cat_mode".padStart(15) + "`: don't `Sparse` ':3' as a object value (default: false)\n" +
			"`N" + "allow_nesting".padStart(15) + "`: allow nesting tokens inside of other tokens (default: false)";

		const usage = "Usage: sarahisweird.parse_chat { `Nmessage`: `Vstr`, `C[args...]` }\n" + description;
		return { ok: false, msg: usage };
	};

	if (!args || (!args.api && !args.msg && !args.message)) return getUsage();
	if (args.api) return api;

	const msg = args.msg !== undefined ? args.msg : args.message;
	if (typeof(msg) !== "string") return getUsage();

	const extendedParsing = !!args.extended;
	const catMode = !!args.cat_mode;

	let i = 0;

	const getChar = () => i < msg.length ? msg[i] : null;
	const advance = () => i++ < msg.length ? (i - 1) : null;
	const getFrom = (start) => msg.substring(start, i);

	const isAlpha = (c) => c == null ? false : /[a-zA-Z]/.test(c);
	const isDigit = (c) => c == null ? false : /\d/.test(c);
	const isAlphaNum = (c) => isAlpha(c) || isDigit(c);

	const wordToken = () => {
		let start = i;
		while (isAlphaNum(getChar())) advance();

		return { i: start, type: "word", value: getFrom(start) };
	};

	const lexNext = () => {
		const c = getChar();
		if (c === null) return null;

		if (isAlphaNum(c)) return wordToken();
		
		if (c === "_") return { i: advance(), type: "_", value: "_" };
		if (c === "@") return { i: advance(), type: "@", value: "@" };
		if (c === ".") return { i: advance(), type: ".", value: "." };
		if (c === ":") return { i: advance(), type: ":", value: ":" };
		if (c === " ") return { i: advance(), type: " ", value: " " };

		return { i: advance(), type: "char", value: c };
	};

	const lex = () => {
		const tokens = [];

		while (true) {
			const token = lexNext();
			if (token === null) break;

			tokens.push(token);
		}

		return tokens;
	};

	const tokens = lex();

	i = 0;
	const peekNext = (offset) => (i + (offset || 0)) < tokens.length ? tokens[i + (offset || 0)] : null;
	const peek = () => peekNext(0);
	const advanceToken = () => { i++; return peekNext(-1) };
	const isValidName = (str) => /^[a-z_][a-z0-9_]+$/.test(str);
	const peekedIsValidName = (offset) => peekNext(offset) && peekNext(offset).type === "word" && isValidName(peekNext(offset).value);
	const typeOfNext = (offset) => peekNext(offset) && peekNext(offset).type;

	const parseGC = () => {
		return null;
	};

	const parseDate = () => {
		if (typeOfNext(0) !== "word") return parseGC();
		const yearWord = peek().value;
		if (!/\d{1,4}AD$/.test(yearWord)) return parseGC();

		if (typeOfNext(1) !== " ") return parseGC();
		if (typeOfNext(2) !== "word") return parseGC();
		const dayWord = peekNext(1).value;
		if (!/^D\d{1,3}/.test(dayWord)) return parseGC();
	};

	const parseAxiomSector = () => {
		// Presumes that the WORD_WORD check has already happened.

		let axiomName = null;
		let axiomNameStart;
		const word1 = peek().value;
		for (const axiom of data.axioms) {
			const maybeAxiomName = word1.substring(word1.length - axiom.length);
			if (maybeAxiomName !== axiom) continue;

			axiomName = maybeAxiomName;
			axiomNameStart = word1.length - axiom.length;
			break;
		}

		if (axiomName === null) return null;
		const actualAxiomName = axiomName.substring(axiomNameStart);

		const sectorName = peekNext(2).value;
		if (!data.axiomLetters.includes(sectorName)) return null;
		if (typeOfNext(3) !== "_") return null;
		if (typeOfNext(4) !== "word") return null;

		const sectorId = peekNext(4).value;
		if (!/^\d/.test(sectorId)) return null;

		// Woo! It is an axiom sector!
		const axiomNameToken = advanceToken(); // Eat axiom name
		advanceToken(); // Eat _
		advanceToken(); // Eat sector name
		advanceToken(); // Eat _

		if (sectorId.length === 1) {
			advanceToken(); // Eat sector id
		} else {
			// Remove sector id from the token, but let it be parsed by others
			const sectorIdToken = peek();
			sectorIdToken.i++;
			sectorIdToken.value = sectorIdToken.value.substring(1);
		}

		const nodes = [];
		if (word1.length !== axiomName.length) {
			nodes.push({
				i: axiomNameToken.i,
				type: "text",
				raw: axiomName.substring(0, axiomNameStart),
			});
		}

		nodes.push({
			i: axiomNameToken.i + axiomNameStart,
			type: "sector",
			axiom: actualAxiomName,
			name: sectorName,
			sectorId: sectorId[0],
			raw: `${actualAxiomName}_${sectorName}_${sectorId[0]}`,
		});

		return nodes;
	};

	const parseGraySector = () => {
		// Presumes that the WORD_WORD check has already happened.

		let sectorName = null;
		let sectorNameStart;
		const word1 = peek().value;
		for (const sector of data.graySectors) {
			const maybeSectorName = word1.substring(word1.length - sector.length);
			if (maybeSectorName !== sector) continue;

			sectorName = maybeSectorName;
			sectorNameStart = word1.length - sector.length;
			break;
		}

		if (sectorName === null) return null;

		const actualSectorName = sectorName.substring(sectorNameStart);

		if (!/^\d{4}/.test(peekNext(2).value)) return null;

		const sectorNameToken = advanceToken(); // Eat sector name
		advanceToken(); // Eat _

		const sectorId = peek().value.substring(0, 4);

		if (sectorId.length === 4) {
			advanceToken(); // Eat sector id
		} else {
			// Remove sector id from the token, but let it be parsed by others
			const sectorIdToken = peek();
			sectorIdToken.i += 4;
			sectorIdToken.value = sectorIdToken.value.substring(4);
		}

		const nodes = [];
		if (word1.length !== sectorName.length) {
			nodes.push({
				i: sectorNameToken.i,
				type: "text",
				raw: sectorName.substring(0, sectorNameStart),
			});
		}

		nodes.push({
			i: sectorNameToken.i + sectorNameStart,
			type: "sector",
			axiom: null,
			name: actualSectorName,
			sectorId: sectorId,
			raw: `${actualSectorName}_${sectorId}`,
		});

		return nodes;
	};

	const parseSector = () => {
		const sector = peek();
		if (sector.type !== "word" || !data.validSectors.includes(sector.value)) return parseDate();
		if (typeOfNext(1) !== "_" || typeOfNext(2) !== "word") return parseDate();

		const axiomNodes = parseAxiomSector();
		if (axiomNodes !== null) return axiomNodes;

		const grayNodes = parseGraySector();
		if (grayNodes !== null) return grayNodes;

		return parseDate();
	};

	const parseScript = () => {
		if (!peekedIsValidName(0)) return parseSector();
		if ((peekNext(1).type !== ".") || !peekedIsValidName(2)) return parseSector();

		const user = advanceToken();
		advanceToken(); // Eat .
		let scriptName = "";

		while (peek() && (peek().type === "_" || peekedIsValidName(0))) {
			scriptName += advanceToken().value;
		}

		// Catch things like sarah.is_weiRD -> the script is "sarah.is_wei"
		const token = peek();
		while (token && token.type === "word" && /[a-z0-9_]/.test(token.value[0])) {
			scriptName += token.value[0];
			token.value = token.value.substring(1);
			token.i++;

			// Sanity check if peekedIsValidName didn't catch this for some reason
			if (token.value === "") tokens.shift();
		}

		return [{
			i: user.i,
			type: "script",
			user: user.value,
			script: scriptName,
			raw: `${user.value}.${scriptName}`,
		}];
	};

	const parseUsername = () => {
		const at = advanceToken(); // Eat @
		const node = { i: at.i, type: "text", raw: "@" };
		// Mentions have to actually be a valid username
		if (!peek() || peek().type !== "word" || !peekedIsValidName(0)) return [node];

		// If the next stuff is a valid script name, it has precedence over mentions!
		if (peekNext(1) && peekNext(1).type === "." && peekedIsValidName(2)) {
			return [node].concat(parseScript());
		}

		const user = advanceToken();
		return [{ i: at.i, type: "mention", user: user.value, raw: `@${user.value}` }];
	};

	const parseNext = () => {
		const token = peek();

		if (token.type == "@") return parseUsername();

		return parseScript();
	};

	const parse = () => {
		let nodes = [];

		while (peek()) {
			nodes = nodes.concat(parseNext());
		}

		return nodes;
	};

	return parse();
}
