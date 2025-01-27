import { LogLevel } from '/lib/logging';

type LockValue = string | number;
type LockKeys = Record<string, LockValue>;

type CallArgs = {
    target?: Scriptor,
    rental?: Scriptor,
    debug?: boolean,
    trace?: boolean,
    profiler?: boolean,
    verbose?: boolean,
    keys?: LockKeys,
    locksim?: boolean,
    reset?: boolean,
};

type SavedTryAllState = {
    unlocker: string,
    key: string,
    index: number,
};

type SavedResult = {
    type: 'heckingSavedResult',
    loc: string,
    keys: LockKeys,
    tryAllState: SavedTryAllState | null,
};

type Unlocker = () => boolean;

export default function (context: Context, args?: unknown) {
    const lib = $fs.scripts.lib();
    const utils = $fs.sarahisweird.utils() as ReturnType<$sarahisweird$utils$>;
    const logger = utils.logger.getLogger('`MHECK`');
    const knownLockSims = [ 'beta.lock_sim', 'example.loc' ];

    const usageMsg =
`Usage: sarahisweird.hecking { \`Ntarget\`: #s.some.loc\`c, [args]\` }
Available arguments:
  \`Ntarget\`: \`Vscriptor\` | The \`Lloc\` to unlock
  \`Nrental\`: \`Vscriptor\` | A \`Lloc\` targeting a rental service. (default: \`Vnone\`)
                     - Currently supported: matr1x.r3dbox
   \`Ndebug\`: \`Vboolean\`  | Enable debug logging (default: \`Vfalse\`)
   \`Ntrace\`: \`Vboolean\`  | Enable trace logging (default: \`Vfalse\`)
                     - Overrides \`Ndebug\`.
                     - Warning: \`Dincredibly\` spammy!
\`Nprofiler\`: \`Vboolean\`  | Enable profiling (default: \`Vfalse\`)
                     - Extended profiling available via \`Ntrace\`.
    \`Nkeys\`: \`Vobject\`   | Additional arguments (default: \`V{}\`)
                     - Passed to the \`Ntarget\` when unlocking.
                     - If lock solutions are present, they are used
                       instead of a solution from an unlock function!
                       Caveat: saved solutions have precedence over provided keys.
 \`Nlocksim\`: \`Vboolean\`  | Skip hardline check (default: \`Vfalse\`)
                     - Automatically applied for beta.lock_sim and example.loc
   \`Nreset\`: \`Vboolean\`  | Reset database entry for this loc.
`;

    const usage = { ok: false, msg: usageMsg };
    if (!args || !lib.is_obj(args)) return usage;
    if (!utils.isScriptor(args.target)) return usage;
    if (args.rental && !utils.isScriptor(args.target)) return usage;
    if (args.keys && !lib.is_obj(args.keys)) return usage;

    const target = args.target as Scriptor;
    const rental = args.rental
        ? args.rental as Scriptor
        : null;
    const logLevel = args.trace
        ? LogLevel.TRACE
        : (args.debug
            ? LogLevel.DEBUG
            : LogLevel.INFO);
    const profiler = !!args.profiler;
    const userSuppliedKeys = args.keys
        ? args.keys as LockKeys
        : null;
    const isLocksim = !!args.locksim || knownLockSims.includes(target.name);
    const reset = !!args.reset;

    if (!isLocksim && ($hs.sys.status().hardline === 0)) {
        logger.error('You must be in hardline to breach other users!');
        logger.error('If you are using a locksim, you can set `Nlocksim`: `Vtrue` to bypass this check.')
        return { ok: false, msg: logger.getOutput() };
    }

    const profilingLogger = profiler ? logger.getLogger('`HPROFILER`') : utils.nullLogger;

    let res = '';
    const keys = userSuppliedKeys || {};
    let timeSpentPoking = 0;
    let lastTime = 0;
    let currentUnlockerName: string | null = null;
    let tryAllState: SavedTryAllState | null = null;
    let resuming = false;

    const time = <T>(name: string, cb: () => T, logLevel: LogLevel = LogLevel.INFO): T => {
        const start = Date.now();
        const result = cb();
        lastTime = Date.now() - start;
        profilingLogger.log(`${name}: ${lastTime}ms`, logLevel);
        return result;
    };

    if (reset) {
        $db.r({ type: 'heckingSavedResult', loc: target.name });
    }

    const savedResult = $db.f({ type: 'heckingSavedResult', loc: target.name }).first() as SavedResult | null;
    if (savedResult) {
        for (const [ k, v ] of Object.entries(savedResult.keys)) {
            keys[k] = v;
        }

        tryAllState = savedResult.tryAllState;

        logger.info('Restored previous unlock progress.');
        logger.debug(`Restored keys: ${JSON.stringify(keys)}`);
        logger.debug(`Restored tryAllState: ${JSON.stringify(tryAllState)}`);
    }

    const debugPoke = () => {
        res = time('debugPoke', () => {
            const start = Date.now();
            while (Date.now() < (start + 300)) {
                timeSpentPoking += 0.00000001;
            };
            return target.call(keys);
        }, LogLevel.TRACE) as string;
        timeSpentPoking += lastTime;
    };

    const normalPoke = () => {
        res = time('poke', () => target.call(keys), LogLevel.TRACE) as string;
        timeSpentPoking += lastTime;
    };

    const poke = debugPoke;

    class OutOfTimeError extends Error {
        timeLeft: number;

        constructor(...params: any[]) {
            super(...params);

            this.timeLeft = _END - Date.now();
        }
    }

    const REQUIRED_TIME = 1000;
    const assertTimeLeft = () => {
        if ((Date.now() + REQUIRED_TIME) < _END) return;
        throw new OutOfTimeError();
    };

    const tryAll = <U extends LockValue>(choices: Array<U>, key: string, failFlag: string): number | null => {
        let start = 0;
        if (resuming) {
            if (tryAllState?.key != key) return -1;

            start = tryAllState.index;
            resuming = false;
        }
        
        if (!tryAllState) {
            tryAllState = {
                unlocker: currentUnlockerName!,
                key: key,
                index: 0,
            };
        }

        for (const [ k, v ] of choices.slice(start).entries()) {
            assertTimeLeft();

            tryAllState.index = k;

            keys[key] = v;
            logger.trace(`Trying ${key}: ${v}`);
            poke();

            if (!res.includes(failFlag)) {
                tryAllState = null;
                return k;
            }
        }

        return null;
    };

    const unlockEz = (name: string) => {
        const ezUnlockCommands = [ 'open', 'unlock', 'release' ];

        if (tryAll(ezUnlockCommands, name, 'unlock command') == null) {
            logger.error(`Failed to unlock ${name.toUpperCase()}!`);
            return false;
        }

        return true;
    };

    const unlockEz21 = () => {
        if (!unlockEz('ez_21')) return false;

        logger.info(`Unlocked \`SEZ_21\`: \`V${keys.ez_21}\`.`);
        return true;
    };

    const unlockEz35 = () => {
        const digits = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];

        if (!unlockEz('ez_35')) return false;
        if (tryAll(digits, 'digit', 'digit') == null) {
            logger.error('Failed to unlock EZ_35 digit!');
            return false;
        }

        logger.info(`Unlocked \`SEZ_35\`: \`V${keys.ez_35}\`, \`V${keys.digit}\``);
        return true;
    };

    const unlockEz40 = () => {
        const primes = utils.getPrimes(100);

        if (!unlockEz('ez_40')) return false;
        if (tryAll(primes, 'ez_prime', 'prime') == null) {
            logger.error('Failed to unlock EZ_40 prime!');
            return false;
        }

        logger.info(`Unlocked \`SEZ_40\`: \`V${keys.ez_40}\`, \`V${keys.ez_prime}\``);
        return true;
    };

    const colors = ['red', 'orange', 'yellow', 'lime', 'green', 'cyan', 'blue', 'purple'];
    const getColors = (index: number) => {
        const complementIndex = (index + 4) % 8;
        const triad1Index = (index + 5) % 8;
        const triad2Index = (index + 3) % 8;

        if (index == colors.length) return null;

        return {
            index: index,
            color: colors[index],
            color_digit: colors[index].length,
            c002_complement: colors[complementIndex],
            c003_triad_1: colors[triad1Index],
            c003_triad_2: colors[triad2Index],
        };
    };

    const unlockC00X = (name: string, extraKeys: string[], extraFailMsg: string) => {
        const colorIndex = tryAll(colors, name, 'color name');
        if (colorIndex == null) {
            logger.error(`Failed to unlock ${name}!`);
            return false;
        }

        const colorData = getColors(colorIndex);
        for (const key of extraKeys) {
            keys[key] = colorData![key as keyof typeof colorData];
        }

        if (res.includes(extraFailMsg)) {
            logger.error(`Invalid extra values for color ${colorData!.color}`);
            return false;
        }

        return true;
    };

    const unlockC001 = () => {
        return unlockC00X('c001', ['color_digit'], 'color name');
    };

    const unlockC002 = () => {
        return unlockC00X('c002', ['c002_complement'], 'complement color');
    };

    const unlockC003 = () => {
        return unlockC00X('c003', ['c003_triad_1', 'c003_triad_2'], 'triad color');
    };

    const unlockers = {
        'EZ_21': unlockEz21,
        'EZ_35': unlockEz35,
        'EZ_40': unlockEz40,
        'c001': unlockC001,
        'c002': unlockC002,
        'c003': unlockC003,
    };

    const getUnlocker = (): [string | null, Unlocker | null] => {
        const parts = res.split("\n");
        const currentLock = parts[parts.length - 1];
        for (const [ k, v ] of Object.entries(unlockers)) {
            if (currentLock.includes(k)) return [ k, v ];
        }

        return [ null, null ];
    };

    const shouldContinueUnlocking = (): boolean =>
        res.includes && (res.includes('Denied') || res.includes('To unlock'));

    const unlockAll = (): boolean => {
        if (tryAllState) {
            resuming = true;
            const unlocker = unlockers[tryAllState.unlocker as keyof typeof unlockers];
            if (!time(tryAllState.unlocker, unlocker)) return false;
        }

        poke();

        let lastUnlocker: Unlocker | null = null;
        while (shouldContinueUnlocking()) {
            const [ unlockerName, unlocker ] = getUnlocker();
            if (unlocker == null) {
                logger.error('No matching unlocker found!');
                return false;
            } else if (lastUnlocker == unlocker) {
                logger.error(`Loop caught for unlocker ${unlockerName}!`);
                return false;
            }

            currentUnlockerName = unlockerName;
            const result = time(unlockerName as string, unlocker);
            if (!result) return false;

            lastUnlocker = unlocker;
        }

        return true;
    };

    try {
        unlockAll();
    } catch (e) {
        if (e instanceof OutOfTimeError) {
            if (tryAllState) {
                delete keys[tryAllState.key];
            }

            const upsertResult = $db.us({ type: 'heckingSavedResult', loc: target.name }, {
                $set: {
                    keys: keys,
                    tryAllState: tryAllState,
                },
            });

            if (upsertResult.length !== 1) {
                logger.warn('Multiple progressed are saved!');
            }

            if (upsertResult[0].ok) {
                logger.info('Progress was saved.');
            } else {
                logger.warn('Progress couldn\'t be saved to the database!');
            }
        } else if (e instanceof Error) {
            logger.error(`${e.message}\n${e.stack}`);
        } else {
            logger.error(`An error occurred: ${e}`);
        }
    }

    profilingLogger.info(`Time spent poking: ${timeSpentPoking}ms`);

    return { ok: true, msg: logger.getOutput({ logLevel }) };
};
