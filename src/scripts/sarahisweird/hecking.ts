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
    magnaraI: number,
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
    let loadedKey = null;
    let prevBalance = $hs.accts.balance();
    let magnaraI: number = 0;

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
        magnaraI = savedResult.magnaraI;

        logger.info('Restored previous unlock progress.');
        logger.debug(`Restored keys: ${JSON.stringify(keys)}`);
        logger.debug(`Restored tryAllState: ${JSON.stringify(tryAllState)}`);
        logger.debug(`Restored magnara index: ${magnaraI}`);
    }

    const debugPoke = () => {
        res = time('debugPoke', () => {
            const start = Date.now();
            while (Date.now() < (start + 200)) {
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

            keys[key] = v;
            logger.trace(`Trying ${key}: ${v}`);
            poke();

            if (!res.includes(failFlag)) {
                tryAllState = null;
                return k;
            }

            tryAllState.index = k;
        }

        return null;
    };

////////////////////////////////////////////////////////////////////////////////
//                          EZ-series unlockers                               //
////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////
//                          c00X-series unlockers                             //
////////////////////////////////////////////////////////////////////////////////

    const colors = [ 'red', 'orange', 'yellow', 'lime', 'green', 'cyan', 'blue', 'purple' ];
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
        let colorIndex = tryAll(colors, name, 'color name');
        if (colorIndex == null) {
            logger.error(`Failed to unlock ${name}!`);
            return false;
        } else if (colorIndex == -1) {
            colorIndex = colors.indexOf(keys[name] as string);
            logger.trace(`Restored color index ${colorIndex} for ${name}.`);
        }

        const colorData = getColors(colorIndex);
        for (const key of extraKeys) {
            keys[key] = colorData![key as keyof typeof colorData];
        }

        poke();
        if (res.includes(extraFailMsg)) {
            logger.error(`Invalid extra values for color ${colorData!.color}!`);
            return false;
        }

        logger.info(`Unlocked \`S${name}\`: \`V${colors[colorIndex]}, \`${extraKeys.map(k=>`\`V${keys[k]}\``).join(', ')}`)
        return true;
    };

    const unlockC001 = () => {
        return unlockC00X('c001', ['color_digit'], 'color digit');
    };

    const unlockC002 = () => {
        return unlockC00X('c002', ['c002_complement'], 'complement color');
    };

    const unlockC003 = () => {
        return unlockC00X('c003', ['c003_triad_1', 'c003_triad_2'], 'triad color');
    };

////////////////////////////////////////////////////////////////////////////////
//                          l0ck-series unlockers                             //
////////////////////////////////////////////////////////////////////////////////

    function unlockL0cket() {
        const locketK3ys = ['6hh8xw', 'cmppiq', 'sa23uw', 'tvfkyq', 'uphlaw', 'vc2c7q', 'xwz7j4'];

        if (tryAll(locketK3ys, 'l0cket', 'security k3y') == null) {
            logger.error('Failed to unlock l0cket!');
            return false;
        }

        return true;
    }

    function unlockL0ckbox() {
        const k3y = res.substring(res.length - 6);
        const keysWeHave = $hs.sys.upgrades({
            full: true,
            filter: {
                name: { $in: ['k3y_v1', 'k3y_v2'] },
                k3y: k3y,
            },
        }) as unknown as Upgrade[];

        if (keysWeHave.length > 0) {
            const k3yUpgrade = keysWeHave[0];
            $ms.sys.manage({ load: k3yUpgrade.i });
            loadedKey = k3yUpgrade.i;
            logger.info(`Loaded k3y \`0${k3y}\` at upgrade index \`V${k3yUpgrade.i}\`.`);
        } else if (rental) {
            logger.warn(`We don't have a \`0${k3y}\` k3y upgrade! Requesting one from \`Dr3dbox\`\`4.\` (matr1x.r3dbox)...`);

            $ms.sahara.sparkasse({ withdraw: prevBalance });
            const r3dboxResponse = rental.call({ request: k3y }) as unknown as { ok: boolean };
            prevBalance = $hs.accts.balance();
            $ms.accts.xfer_gc_to({ to: 'sahara', amount: prevBalance });

            if (!r3dboxResponse.ok) {
                logger.error("`Dr3dbox``4.` doesn't seem to have this k3y either :(");
                return false;
            }

            const k3yUpgradeId = ($hs.sys.upgrades() as unknown as Upgrade[]).length - 1; // :3
            $ms.sys.manage({ load: k3yUpgradeId });

            logger.warn(`Loaded k3y \`0${k3y}\` at upgrade index \`V${k3yUpgradeId}\`. Don't forget to return it with matr1x.r3dbox { return: true }!`);
        } else {
            logger.error(`Missing k3y \`0${k3y}\`! If you want to rent it automatically, run:`);
            logger.error(`${context.this_script} { target: #s.${target.name}, rental: #s.matr1x.r3dbox }`);
            return false;
        }

        poke();
        return true;
    }

////////////////////////////////////////////////////////////////////////////////
//                           DATA_CHECK unlocker                              //
////////////////////////////////////////////////////////////////////////////////

    const answers: Record<string, string> = $db.f({ name: 'data_check_answers' }).first()!.answers as Record<string, string>;

    function getDataCheckAnswer(prompt: string) {
        return prompt.split('\n')
            .map(q => answers[q.replaceAll('.', '')])
            .filter(q => q)
            .join('');
    }

    function unlockDataCheck() {
        keys.DATA_CHECK = '';
        poke();
        keys.DATA_CHECK = getDataCheckAnswer(res);

        poke();
        if (res.includes('++++++')) {
            logger.error('Failed to unlock DATA_CHECK!');
            return false;
        }

        logger.debug(`Unlocked \`SDATA_CHECK\`: \`V${keys.DATA_CHECK}\``)
        return true;
    }

////////////////////////////////////////////////////////////////////////////////
//                          CON_SPEC unlocker                                 //
////////////////////////////////////////////////////////////////////////////////

    function findNextLetters(letterSequence: string, count?: number) {
        count = (typeof(count) === 'number') ? count : 3;

        const aCharCode = 'A'.charCodeAt(0);
        const firstOf = (arr: any[]) => arr[0];
        const lastOf = (arr: any[]) => arr[arr.length - 1];

        // First we convert the letters into numbers. The exact numbering system
        // doesn't actually matter, it just has to be consistent.
        // We just set A to 0 and Z to 25 for this.
        const charToNumber = (c: string) => c.charCodeAt(0) - aCharCode;
        const numberToChar = (n: number) => String.fromCharCode(n % 26 + aCharCode);
        const numericSequence = letterSequence.split('').map(charToNumber);

        // Then we figure out the distance between the numbers (letters).
        // `steps` will look something like one of these examples:
        //     [ 1, 1, 1 ]
        //     [ 1, 3, 1 ]
        //     [ 3, 1, 3 ]
        //     [ 2, 2, 2 ]
        //     [ -1, -1, -1 ]
        //     [ -1, -3, -1 ]
        const steps = numericSequence.slice(0, numericSequence.length - 1)
            .map((n, i) => numericSequence[i + 1] - n);
        
        // We use this offset to make sure we hit the right step on all
        // given input string sizes.
        // [ 1, 3, 1 ] => [ 3, 1, 3 ], but [ 1, 3, 1, 3 ] => [ 1, 3, 1 ]
        const offset = (firstOf(steps) !== lastOf(steps)) ? 0 : 1;

        let lastNumber: number = lastOf(numericSequence);
        const nextNumbers = [];
        for (let i = 0; i < count; i++) {
            const stepIndex = (i % 2) + offset;
            const nextNumber = lastNumber + steps[stepIndex % 2];
            nextNumbers.push(nextNumber);
            lastNumber = nextNumber;
        }

        // Convert the numbers back into a string.
        return nextNumbers.map(numberToChar).join('');
    }

    function unlockConSpec() {
        keys.CON_SPEC = '';
        poke();

        const letterSequence = res.split('\n')[0];
        const nextLetters = findNextLetters(letterSequence);
        keys.CON_SPEC = nextLetters;
        poke();
        if (res.includes('Provide the next three letters in the sequence')) {
            logger.error('Failed to unlock CON_SPEC!')
            return false;
        }

        logger.debug(`Unlocked SCON_SPEC: ${nextLetters}`)
        return true;
    }

////////////////////////////////////////////////////////////////////////////////
//                           magnara unlocker                                 //
////////////////////////////////////////////////////////////////////////////////

    type DictionaryEntry = { type: 'dictionary', wordLength: number, words: string[] };
    function getWords(wordLength: number): DictionaryEntry {
        return $db.f({ type: 'dictionary', wordLength: wordLength }).first() as unknown as DictionaryEntry;
    }

    function areAnagrams(word1: string, word2: string) {
        const sortedWord1 = word1.split('').sort().join('');
        const sortedWord2 = word2.split('').sort().join('');

        return sortedWord1 == sortedWord2;
    }

    function unlockMagnara() {
        keys.magnara = '';
        poke();

        const promptParts = res.split('\n')[0].split(' ');
        const scrambledLetters = promptParts[promptParts.length - 1];

        const words = getWords(scrambledLetters.length);
        if (words == null) {
            logger.error(`Missing database entry! (Word length \`V${scrambledLetters.length}\`)`);
            return false;
        }

        for (let i = magnaraI; i < words.words.length; i++) {
            const word = words.words[i];
            if (!areAnagrams(scrambledLetters, word)) continue;

            logger.trace(`Trying magnara: ${word}`);
            keys.magnara = word;
            poke();
            if (res.includes('recinroct')) continue;

            logger.info(`Unlocked magnara: \`V${word}\``);
            return true;
        }

        logger.error('Failed to unlock magnara!');
        return false;
    }

    const unlockers = {
        'EZ_21': unlockEz21,
        'EZ_35': unlockEz35,
        'EZ_40': unlockEz40,
        'c001': unlockC001,
        'c002': unlockC002,
        'c003': unlockC003,
        'l0cket': unlockL0cket,
        'appropriate k3y': unlockL0ckbox,
        'DATA_CHECK': unlockDataCheck,
        'CON_SPEC': unlockConSpec,
        'magnara': unlockMagnara,
    };

    const getUnlocker = (): [string | null, Unlocker | null] => {
        const parts = res.split('\n');
        const currentLock = parts[parts.length - 1];
        for (const [ k, v ] of Object.entries(unlockers)) {
            if (currentLock.includes(k)) return [ k, v ];
        }

        return [ null, null ];
    };

    const shouldContinueUnlocking = (): boolean =>
        res.includes && (res.includes('Denied') || res.includes('To unlock'));

    const maybeResume = (): boolean => {
        if (!tryAllState) return true;

        resuming = true;
        const unlocker = unlockers[tryAllState.unlocker as keyof typeof unlockers];
        if (!time(tryAllState.unlocker, unlocker)) return false;
        resuming = false;

        return true;
    }

    const unlockAll = (): boolean => {
        if (!maybeResume()) return false;

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

    const saveProgress = () => {
        if (tryAllState) {
            delete keys[tryAllState.key];
        }

        const upsertResult = $db.us({ type: 'heckingSavedResult', loc: target.name }, {
            $set: {
                keys: keys,
                tryAllState: tryAllState,
                magnaraI: magnaraI,
            },
        });

        if (upsertResult.length !== 1) {
            logger.warn('Multiple progresses are saved!');
        }

        if (upsertResult[0].ok) {
            logger.info('Progress was saved.');
        } else {
            logger.warn('Progress couldn\'t be saved to the database!');
        }
    };

    try {
        unlockAll();
    } catch (e) {
        if (e instanceof OutOfTimeError) {
            logger.warn('Less than a second of runtime left! Saving results...');
            saveProgress();
        } else if (e instanceof Error) {
            logger.error(`${e.message}\n${e.stack}`);
        } else {
            logger.error(`An error occurred: ${e}`);
        }
    }

    profilingLogger.info(`Time spent poking: ${timeSpentPoking}ms`);
    logger.info('\n' + res);

    return { ok: true, msg: logger.getOutput({ logLevel }) };
};
