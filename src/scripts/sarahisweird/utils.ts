import { LogLevel } from "/lib/logging";

type LogEntry = {
    level: LogLevel,
    msg: string,
    tag?: string,
};

const logEntries: LogEntry[] = [];

const utils = (_context: Context, _args?: unknown) => {
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
        "mh_hamilton", "rob_rob_taylor", "shareef_j", "zap_moon", "chub_thrumby",
        "catness", "foxy_guy", "free_man_morg", "indie_jones", "rocky_b",
        "turn_a_nat", "hermione", "juno_macguff", "lion_eyes", "med_evarz",
        "sidney_prescott", "theshrillery", "i_am_the_eggman", "sportsfan2031"
    ];

    function isPrime(n: number): boolean {
        for (let i = 2; i <= (n / 2); i++) {
            if ((n % i) == 0) return false;
        }

        return true;
    }

    function getPrimes(primeLimit: number): number[] {
        let primeNumbers = [];

        for (let n = 2; n < primeLimit; n++) {
            if (isPrime(n)) primeNumbers.push(n);
        }

        return primeNumbers;
    }

    const levelTags = {
        [ LogLevel.TRACE ]: "[`cTRACE`] ",
        [ LogLevel.DEBUG ]: "[`CDEBUG`] ",
        [ LogLevel.INFO ]: " [`AINFO`] ",
        [ LogLevel.WARN ]: " [`KWARN`] ",
        [ LogLevel.ERROR ]: "[`DERROR`] ",
        [ LogLevel.INTERNAL_WARNING ]: "[`HLOGGING WARNING`] ",
        [ LogLevel.INTERNAL_ERROR ]: "[`WLOGGING ERROR`] ",
    };

    function shouldLog(current: LogLevel, actual: LogLevel): boolean {
        return current <= actual;
    }

    class Logger {
        _parent: Logger | null;
        _name: string | null;

        constructor(parent?: Logger, name?: string) {
            this._parent = parent || null;
            this._name = name || null;
        }

        internalWarning(msg: string) {
            logEntries.push({
                level: LogLevel.INTERNAL_WARNING,
                msg: msg.toString(),
            });
        }

        // Might be needed in the future.
        // noinspection JSUnusedGlobalSymbols
        internalError(msg: string) {
            logEntries.push({
                level: LogLevel.INTERNAL_ERROR,
                msg: msg.toString(),
            });
        }

        log(msg: string, level: LogLevel) {
            let msgToPush;
            if (msg === undefined) {
                msgToPush = "";
            } else if (msg === null) {
                msgToPush = "null";
            } else {
                msgToPush = msg.toString();
            }

            logEntries.push({
                level: level,
                tag: this._name || undefined,
                msg: msgToPush,
            });
        }

        trace(msg: string) {
            this.log(msg, LogLevel.TRACE);
        }

        debug(msg: string) {
            this.log(msg, LogLevel.DEBUG)
        }

        info(msg: string) {
            this.log(msg, LogLevel.INFO)
        }

        warn(msg: string) {
            this.log(msg, LogLevel.WARN)
        }

        error(msg: string) {
            this.log(msg, LogLevel.ERROR)
        }

        getOutput(options: { logLevel?: LogLevel, omitLevels?: boolean, omitNames?: boolean } = {}) {
            options = options || {};
            const logLevel = options.logLevel !== undefined ? options.logLevel : LogLevel.INFO;
            const omitLevels = options.omitLevels || false;
            const omitNames = options.omitNames || false;

            return logEntries
                .filter(({ tag }) => (this._name == null) || (tag == this._name) || (tag && tag.includes(this._name)))
                .filter(({ level }) => shouldLog(logLevel, level))
                .map(({ level, msg, tag }) => {
                    const levelPrefix = !omitLevels ? levelTags[level] : "";
                    const namePrefix = (!omitNames && tag) ? `[${tag}] ` : "";
                    return levelPrefix + namePrefix + msg;
                })
                .join("\n");
        }

        getLogger(name: string) {
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
    const nullLogger = new Logger();
    nullLogger.log = () => {};
    nullLogger.getLogger = function () { return this; };
    nullLogger.getOutput = () => '';

    function parseSpecs(specs: string) {
        const linesRaw = specs.split("\n");

        const lines = linesRaw.map(line => line.includes(" ") ? line.split(" ")[1] : line);
        const classScores = linesRaw[11].split(" ")
            .map((s: string) => /\d+/.exec(s))
            .map(s => parseInt(s as unknown as string));

        const upgradeSlots = lines[18].split("/").map(n => parseInt(n));
        const upgradesLoaded = lines[19].split("/").map(n => parseInt(n));

        const stripColor = (str: string) => str.substring(2, str.length - 1);

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

    function timeStringToDate(str: string) {
        // Time strings are formatted as YYMMDD.HHMM
        const year = 2000 + parseInt(str.substring(0, 2));
        const month = parseInt(str.substring(2, 4)) - 1; // IT'S ZERO BASED >:(
        const day = parseInt(str.substring(4, 6));
        // .
        const hour = parseInt(str.substring(7, 9));
        const minute = parseInt(str.substring(9, 11));

        return new Date(year, month, day, hour, minute);
    }

    function dateToTimeString(date: Date): string {
        const year = date.getUTCFullYear().toString().slice(2);
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = date.getUTCDate().toString().padStart(2, '0');
        const hour = date.getUTCHours().toString().padStart(2, '0');
        const minute = date.getUTCMinutes().toString().padStart(2, '0');

        return `${year}${month}${day}.${hour}${minute}`;
    }

    function findLastIndex<T>(arr: T[], callbackFn: (t: T, i: number, arr: T[]) => boolean): number {
        for (let i = arr.length - 1; i >= 0; i--) {
            if (callbackFn(arr[i], i, arr)) return i;
        }

        return -1;
    }

    // How many seconds two dates can be apart before no longer being seen as the "same".
    const maxDateDifference = 120;
    function dateDiffSecs(date1: Date, date2: Date) {
        return Math.abs(date1.getTime() - date2.getTime()) / 1000;
    }

    function getLargeTxOffsets(maxLargeDistance: number) {
        maxLargeDistance = maxLargeDistance !== undefined ? maxLargeDistance : 2;

        const offsets = [0];

        for (let i = 1; i <= maxLargeDistance; i++) {
            offsets.push(i);
            offsets.push(-i);
        }

        return offsets;
    }

    function txIndexOf(txs: Transaction[], t: Date) {
        const index = txs.findIndex(({ time }) => dateDiffSecs(time, t) <= maxDateDifference);
        if (index < 0) return 0;
        return index;
    }

    function lastTxIndexOf(txs: Transaction[], t: Date) {
        const index = findLastIndex(txs, ({ time }) => dateDiffSecs(time, t) <= maxDateDifference);
        if (index < 0) return txs.length;
        return index;
    }

    function sumTxs(txs: Transaction[], caller: string) {
        let sum = 0;

        for (const { sender, amount } of txs) {
            sum += (sender == caller ? -1 : 1) * amount;
        }

        return sum;
    }

    function isScriptor(val: any): val is Scriptor {
        if (!val || (typeof(val) !== 'object')) return false;
        if (!val.name || (typeof(val.name) !== 'string')) return false;
        if (!val.call) return false;
        return typeof(val.call) === 'function';
    }

    return {
        ok: true,
        navKeys,
        knownUsers,
        getPrimes,
        logger: rootLogger,
        nullLogger,
        parseSpecs,
        timeStringToDate,
        dateToTimeString,
        findLastIndex,
        dateDiffSecs,
        getLargeTxOffsets,
        txIndexOf,
        lastTxIndexOf,
        sumTxs,
        isScriptor,
    };
};

export default utils;

export type Utils = ReturnType<typeof utils>;
export type Logger = Utils['logger'];
export type UserSpecs = ReturnType<Utils['parseSpecs']>;
