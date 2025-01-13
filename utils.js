function(context, args)
{
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

	#G.logEntries = [];

	// Basically an enum, right?
	// Don't refer to these numbers directly, in case levels are added later!
	const logLevelNumbers = {
		info: 0,
		warn: 1,
		error: 2,
		internalError: 3,
	};

	const levelTags = {
		info: " `S[INFO]` ",
		warn: " `K[WARN]` ",
		error: "`D[ERROR]` ",
		internalWarning: "`H[LOGGING WARNING]` ",
		internalError: "`W[LOGGING ERROR]` ",

	};

	function shouldLog(current, actual) {
		return logLevelNumbers[current] <= logLevelNumbers[actual];
	}

	function log_internalWarning(self, msg) {
		#G.logEntries.push({
			level: "internalWarning",
			msg: msg.toString(),
		});
	}

	function log_internalError(self, msg) {
		#G.logEntries.push({
			level: "internalError",
			msg: msg.toString(),
		});
	}

	function log_log(self, msg, level) {
		let msgToPush;
		if (msg === undefined) {
			msgToPush = "";
		} else if (msg === null) {
			msgToPush = "null";
		} else {
			msgToPush = msg.toString();
		}

		#G.logEntries.push({
			level: level || "info",
			tag: self._name,
			msg: msgToPush,
		});
	}

	function log_info(self, msg) {
		self.log(msg, "info");
	}

	function log_warn(self, msg) {
		self.log(msg, "warn");
	}

	function log_error(self, msg) {
		self.log(msg, "error");
	}

	function log_getOutput(self, options) {
		options = options || {};
		const logLevel = options.logLevel || "info";
		const omitLevels = options.omitLevels || false;
		const omitNames = options.omitNames || false;

		return #G.logEntries
			.filter(({ tag }) => (tag == self._name) || (tag && tag.includes(self._name)))
			.filter(({ level }) => shouldLog(logLevel, level))
			.map(({ level, msg, tag }) => {
				const levelPrefix = !omitLevels ? levelTags[level] : "";
				const namePrefix = (!omitNames && tag) ? `[${tag}] ` : "";
				return levelPrefix + namePrefix + msg;
			})
			.join("\n");
	}

	function log_getLogger(self, name) {
		if (!name) {
			const thisLoggerName = self._parent ? self._parent._name : "root logger";
			self._internalWarning(`Creating child logger of ${thisLoggerName} without a name!`);
			name = "???";
		}

		const childName = (self._name ? (self._name + "/") : "") + name;
		return new Logger(self, childName);
	}

	function Logger(parent, name) {
		const l = {
			_parent: parent || null,
			_name: name || null,
		};

		l.log = log_log.bind(l, l);
		l.info = log_info.bind(l, l);
		l.warn = log_warn.bind(l, l);
		l.error = log_error.bind(l, l);
		l._internalWarning = log_internalWarning.bind(l, l);
		l._internalError = log_internalError.bind(l, l);
		l.getLogger = log_getLogger.bind(l, l);
		l.getOutput = log_getOutput.bind(l, l);

		return l;
	}

	const rootLogger = new Logger();

	return {
		ok: true,
		navKeys,
		knownUsers,
		logger: rootLogger,
	};
}
