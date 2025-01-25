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

    #G.logEntries = [];

    // Basically an enum, right?
    // Don't refer to these numbers directly, in case levels are added later!
    const logLevelNumbers = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
        internalError: 4,
    };

    const levelTags = {
        debug: "`C[DEBUG] `",
        info: " `S[INFO]` ",
        warn: " `K[WARN]` ",
        error: "`D[ERROR]` ",
        internalWarning: "`H[LOGGING WARNING]` ",
        internalError: "`W[LOGGING ERROR]` ",

    };

    function shouldLog(current, actual) {
        return logLevelNumbers[current] <= logLevelNumbers[actual];
    }

    class Logger {
        constructor(parent, name) {
            this._parent = parent || null;
            this._name = name || null;
        }

        internalWarning(msg) {
            #G.logEntries.push({
                level: "internalWarning",
                msg: msg.toString(),
            })
        }

        internalError(msg) {
            #G.logEntries.push({
                level: "internalError",
                msg: msg.toString(),
            });
        }

        log(msg, level) {
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
                tag: this._name,
                msg: msgToPush,
            });
        }

        debug(msg) {
            this.log(msg, "debug")
        }

        info(msg) {
            this.log(msg, "info")
        }

        warn(msg) {
            this.log(msg, "warn")
        }

        error(msg) {
            this.log(msg, "error")
        }

        getOutput(options) {
            options = options || {};
            const logLevel = options.logLevel || "info";
            const omitLevels = options.omitLevels || false;
            const omitNames = options.omitNames || false;

            return #G.logEntries
                .filter(({ tag }) => (this._name == null) || (tag == this._name) || (tag && tag.includes(this._name)))
                .filter(({ level }) => shouldLog(logLevel, level))
                .map(({ level, msg, tag }) => {
                    const levelPrefix = !omitLevels ? levelTags[level] : "";
                    const namePrefix = (!omitNames && tag) ? `[${tag}] ` : "";
                    return levelPrefix + namePrefix + msg;
                })
                .join("\n");
        }

        getLogger(name) {
            if (!name) {
                const thisLoggerName = this._parent ? this._parent._name : "root logger";
                this.internalWarning(`Creating child logger of ${thisLoggerName} without a name!`);
                name = "???";
            }

            const childName = (this._name ? (this._name + "/") : "") + name;
            return new Logger(this, childName);
        }
    }

    const rootLogger = new Logger();

    function parseSpecs(specs) {
        const linesRaw = specs.split("\n");

        const lines = linesRaw.map(line => line.includes(" ") ? line.split(" ")[1] : line);
        const classScores = linesRaw[11].split(" ")
            .map(s => /\d+/.exec(s))
            .map(s => parseInt(s));

        const upgradeSlots = lines[18].split("/").map(n => parseInt(n));
        const upgradesLoaded = lines[19].split("/").map(n => parseInt(n));

        const stripColor = (str) => str.substring(2, str.length - 1);

        return {
            username: stripColor(linesRaw[4].split(" ")[0]),
            class: {
                logo: linesRaw.slice(0, 3).join("\n"),
                name: lines[4].substring(3, lines[4].length - 2), // also strip ()
            },
            tier: parseInt(lines[6]),
            hardline: {
                count: parseInt(lines[8]),
                next: parseInt(stripColor(lines[9]).replace("s", "")),
            },
            scores: {
                architect: classScores[0],
                junkrack: classScores[1],
                infiltrator: classScores[2],
                scavenger: classScores[3],
                executive: classScores[4],
            },
            channel_count: parseInt(lines[13]),
            gc_max: lines[15],
            upgrades: {
                held: upgradeSlots[0],
                max_held: upgradeSlots[1],
                loaded: upgradesLoaded[0],
                max_loaded: upgradesLoaded[1],
            },
            scripts: {
                public: parseInt(lines[22]),
                slots: parseInt(lines[23]),
                chars: parseInt(lines[24]),
            }
        };
    }

    function timeStringToDate(str) {
        // Time strings are formatted as YYMMDD.HHMM
        const year = 2000 + parseInt(str.substring(0, 2));
        const month = parseInt(str.substring(2, 4)) - 1; // IT'S ZERO BASED >:(
        const day = parseInt(str.substring(4, 6));
        // .
        const hour = parseInt(str.substring(7, 9));
        const minute = parseInt(str.substring(9, 11));

        return new Date(year, month, day, hour, minute);
    }

    function findLastIndex(arr, callbackFn) {
        for (let i = arr.length - 1; i >= 0; i--) {
            if (callbackFn(arr[i], i, arr)) return i;
        }

        return -1;
    }

    // How many seconds two dates can be apart before no longer being seen as the "same".
    const maxDateDifference = 120;
    function dateDiffSecs(date1, date2) {
        return Math.abs(date1.getTime() - date2.getTime()) / 1000;
    }

    function getLargeTxOffsets(maxLargeDistance) {
        maxLargeDistance = maxLargeDistance !== undefined ? maxLargeDistance : 2;

        const offsets = [0];

        for (let i = 1; i <= maxLargeDistance; i++) {
            offsets.push(i);
            offsets.push(-i);
        }

        return offsets;
    }

    function txIndexOf(txs, t) {
        const index = txs.findIndex(({ time }) => dateDiffSecs(time, t) <= maxDateDifference);
        if (index < 0) return 0;
        return index;
    }

    function lastTxIndexOf(txs, t) {
        const index = findLastIndex(txs, ({ time }) => dateDiffSecs(time, t) <= maxDateDifference);
        if (index < 0) return txs.length;
        return index;
    }

    function sumTxs(txs, caller) {
        let sum = 0;

        for (const { sender, amount } of txs) {
            sum += (sender == caller ? -1 : 1) * amount;
        }

        return sum;
    }

    return {
        ok: true,
        navKeys,
        knownUsers,
        getPrimes,
        logger: rootLogger,
        parseSpecs,
        timeStringToDate,
        findLastIndex,
        dateDiffSecs,
        getLargeTxOffsets,
        txIndexOf,
        lastTxIndexOf,
        sumTxs,
    };
}
