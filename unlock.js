function(context, args) // { target: #s.some.npc }
{
    const utils = #fs.sarahisweird.utils();
    const logger = utils.logger;

    const keys = {};
    let target;
    let res;

    function tryAll(choices, lock, failMsg) {
        let i = 0;
    
        while (i < choices.length) {
            const choice = choices[i];
            keys[lock] = choice;
            res = target.call(keys);

            if (!res.includes(failMsg)) {
                logger.info(`Unlocked ${lock}: ${choice}`);
                return i;
            }

            i++;
        }

        logger.error(`Failed to unlock ${lock}!`);
        return null;
    }

////////////////////////////////////////////////////////////////////////////////
//                          EZ-series unlockers                               //
////////////////////////////////////////////////////////////////////////////////

    const ez = ["open", "unlock", "release"];
    const primeNumbers = utils.getPrimes(100);

    function unlock_ez_21() {
        if (tryAll(ez, "ez_21", "unlock command") == null) {
            logger.error("Failed to unlock EZ_21!");
            return false;
        }

        return true;
    }

    function unlock_ez_35() {
        const ez35Result = tryAll(ez, "ez_35", "unlock command");
        if (ez35Result == null) {
            logger.error("Failed to unlock EZ_35!");
            return false;
        }

        const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        if (tryAll(digits, "digit", "digit") == null) {
            logger.error("Failed to unlock the EZ_35 digit!");
            return false;
        }

        return true;
    }

    function unlock_ez_40() {
        const ez40Result = tryAll(ez, "ez_40", "unlock command");
        if (ez40Result == null) {
            logger.error("Failed to unlock ez_40!");
            return false;
        }

        if (tryAll(primeNumbers, "ez_prime", "prime") == null) {
            logger.error("Failed to unlock the ez_40 prime!");
            return false;
        }

        return true;
    }

////////////////////////////////////////////////////////////////////////////////
//                          c00X-series unlockers                             //
////////////////////////////////////////////////////////////////////////////////

    const colors = ["red", "orange", "yellow", "lime", "green", "cyan", "blue", "purple"];
    function getColors(index) {
        const complementIndex = (index + 4) % 8;
        const triad1Index = (index + 5) % 8;
        const triad2Index = (index + 3) % 8;

        if (index == colors.length) return null;

        return {
            index: index,
            color: colors[index],
            color_digit: colors[index].length,
            color_complement: colors[complementIndex],
            c003_triad_1: colors[triad1Index],
            c003_triad_2: colors[triad2Index],
        };
    }

    function unlock_c00X(name, extraKeys, extraFailMsg) {
        extraKeys = extraKeys || [];
        extraFailMsg = extraFailMsg || null;

        const colorIndex = tryAll(colors, name, "color name");
        if (colorIndex == null) return false;

        const colorData = getColors(colorIndex);
        for (const key of extraKeys) {
            keys[key] = colorData[key];
        }

        res = target.call(keys);
        if (res.includes(extraFailMsg)) {
            logger.error(`Invalid extra values for color ${colorData.name}`);
            return false;
        }

        return true;
    }

    function unlock_c001() {
        return unlock_c00X("c001", ["color_digit"], "color name");
    }

    function unlock_c002() {
        return unlock_c00X("c002", ["c003_complement"], "complement color");
    }

    function unlock_c003() {
        return unlock_c00X("c003", ["c003_triad_1", "c003_triad_2"], "triad color");
    }

////////////////////////////////////////////////////////////////////////////////
//                          l0ck-series unlockers                             //
////////////////////////////////////////////////////////////////////////////////

    const locket = ["6hh8xw", "cmppiq", "sa23uw", "tvfkyq", "uphlaw", "vc2c7q", "xwz7j4"];

    function unlock_l0cket() {
        if (tryAll(locket, "l0cket", "security k3y") == null) {
            logger.error("Failed to unlock l0cket!");
            return false;
        }

        return true;
    }

    function unlock_l0ckbox() {
        const k3y = res.substring(res.length - 6);
        const keysWeHave = #hs.sys.upgrades({
            full: true,
            filter: {
                name: { $in: ["k3y_v1", "k3y_v2"] },
                k3y: k3y,
            },
        });

        if (keysWeHave.length > 0) {
            const k3yUpgrade = keysWeHave[0];
            #ms.sys.manage({ load: k3yUpgrade.i });
            logger.warn(`Loaded k3y \`0${k3y}\` at upgrade index \`V${k3yUpgrade.i}\`. Please unload it yourself.`);
        } else if (args.rental) {
            logger.warn(`We don't have a \`0${k3y}\` k3y upgrade! Requesting one from \`Dr3dbox\`\`4.\` (matr1x.r3dbox)...`);

            const r3dboxResponse = args.rental.call({ request: k3y });
            if (!r3dboxResponse.ok) {
                logger.error("`Dr3dbox``4.` doesn't seem to have this k3y either :(");
                return false;
            }

            const k3yUpgradeId = #hs.sys.upgrades().length - 1; // :3
            #ms.sys.manage({ load: k3yUpgradeId });

            logger.warn(`Loaded k3y \`0${k3y}\` at upgrade index \`V${k3yUpgradeId}\`. Don't forget to return it with matr1x.r3dbox { return: true }!`);
        } else {
            logger.error(`Missing k3y \`0${k3y}\`! If you want to rent it automatically, run:`);
            logger.error(`${context.this_script} { target: #s.${args.target.name}, rental: #s.matr1x.r3dbox }`);
            return false;
        }

        res = target.call(keys);
        return true;
    }

////////////////////////////////////////////////////////////////////////////////
//                           DATA_CHECK unlocker                              //
////////////////////////////////////////////////////////////////////////////////

    const answers = #db.f({ name: 'data_check_answers' }).first().answers;

    function getDataCheckAnswer(prompt) {
        return prompt.split("\n")
            .map(q => answers[q.replaceAll('.', '')])
            .filter(q => q)
            .join("");
    }

    function unlock_data_check() {
        keys.DATA_CHECK = "";
        res = target.call(keys);
        keys.DATA_CHECK = getDataCheckAnswer(res);

        res = target.call(keys);
        if (res.includes("++++++")) {
            logger.error("Failed to unlock DATA_CHECK!");
            return false;
        }

        return true;
    }

////////////////////////////////////////////////////////////////////////////////
//                          CON_SPEC unlocker                                 //
////////////////////////////////////////////////////////////////////////////////

    function findNextLetters(letterSequence, count) {
        count = (typeof(count) === "number") ? count : 3;

        const aCharCode = "A".charCodeAt(0);
        const firstOf = (arr) => arr[0];
        const lastOf = (arr) => arr[arr.length - 1];

        // First we convert the letters into numbers. The exact numbering system
        // doesn't actually matter, it just has to be consistent.
        // We just set A to 0 and Z to 25 for this.
        const charToNumber = (c) => c.charCodeAt(0) - aCharCode;
        const numberToChar = (n) => String.fromCharCode(n % 26 + aCharCode);
        const numericSequence = letterSequence.split("").map(charToNumber);

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

        let lastNumber = lastOf(numericSequence);
        const nextNumbers = [];
        for (let i = 0; i < count; i++) {
            const stepIndex = (i % 2) + offset;
            const nextNumber = lastNumber + steps[stepIndex % 2];
            nextNumbers.push(nextNumber);
            lastNumber = nextNumber;
        }

        // Convert the numbers back into a string.
        return nextNumbers.map(numberToChar).join("");
    }

    function unlock_con_spec() {
        keys.CON_SPEC = "";
        res = target.call(keys);

        const letterSequence = res.split("\n")[0];
        const nextLetters = findNextLetters(letterSequence);
        keys.CON_SPEC = nextLetters;
        res = target.call(keys);
        if (res.includes("Provide the next three letters in the sequence")) {
            logger.error("Failed to unlock CON_SPEC!")
            return false;
        }

        return true;
    }

////////////////////////////////////////////////////////////////////////////////
//                           magnara unlocker                                 //
////////////////////////////////////////////////////////////////////////////////

    function getWords(wordLength) {
        return #db.f({ type: 'dictionary', wordLength: wordLength }).first();
    }

    function areAnagrams(word1, word2) {
        const sortedWord1 = word1.split("").sort().join("");
        const sortedWord2 = word2.split("").sort().join("");

        return sortedWord1 == sortedWord2;
    }

    function unlock_magnara() {
        keys.magnara = "";
        res = target.call(keys);

        const promptParts = res.split("\n")[0].split(" ");
        const scrambledLetters = promptParts[promptParts.length - 1];

        const words = getWords(scrambledLetters.length);
        if (words == null) {
            logger.error(`Missing database entry! (Word length \`V${scrambledLetters.length}\`)`);
            return false;
        }

        for (const word of words.words) {
            if (!areAnagrams(scrambledLetters, word)) continue;

            keys.magnara = word;
            res = target.call(keys);
            if (res.includes("recinroct")) continue;

            logger.info(`Unlocked magnara: \`V${word}\``);
            return true;
        }

        logger.error("Failed to unlock magnara!");
        return false;
    }

////////////////////////////////////////////////////////////////////////////////
//                                Glue code                                   //
////////////////////////////////////////////////////////////////////////////////

    const unlockers = {
        "EZ_21": unlock_ez_21,
        "EZ_35": unlock_ez_35,
        "EZ_40": unlock_ez_40,
        "c001": unlock_c001,
        "c002": unlock_c002,
        "c003": unlock_c003,
        "l0cket": unlock_l0cket,
        "DATA_CHECK": unlock_data_check,
        "CON_SPEC": unlock_con_spec,
        "appropriate k3y:": unlock_l0ckbox,
        "magnara": unlock_magnara,
    };

    function getUnlocker() {
        const parts = res.split("\n");
        const currentLock = parts[parts.length - 1];
        for (const [k, v] of Object.entries(unlockers)) {
            if (currentLock.includes(k)) return v;
        }

        return null;
    }

    function unlockAll() {
        res = target.call(keys);

        let lastUnlocker = null;
        while (res.includes && (res.includes("Denied") || res.includes("To unlock"))) {
            const unlocker = getUnlocker();
            if (unlocker == null) {
                logger.error("No matching unlocker found!")
                return false;
            }

            if (lastUnlocker == unlocker) {
                logger.error("Loop caught!");
                return false;
            }

            if (!unlocker()) {
                return false;
            }

            lastUnlocker = unlocker;
        }

        return true;
    }

    // Fuck you JavaScript.
    function targetWasProvided() {
        if (!args) return false; // typeof(null) === object
        if (typeof(args) !== "object") return false;
        if (!args.target) return false;

        return true;
    }

    function canStartAttempt() {
        if (!targetWasProvided()) {
            logger.error(`Usage: ${context.this_script} { target: #s.some.loc }`);
            return false;
        }

        const specs = utils.parseSpecs(#ms.sys.specs());
        if (specs.upgrades.loaded == specs.upgrades.max_loaded) {
            logger.error("You have to have a free upgrade slot for l0ckbox solving!");
            return false;
        }

        if (args.target.name == "beta.lock_sim") {
            // No hardline needed for locksim :)
            return true;
        }

        const { hardline } = #hs.sys.status();
        if (hardline === 0) {
            logger.error("You must be in hardline to breach other users!");
            return false;
        }

        return true;
    }
    
    if (canStartAttempt()) {
        target = args.target;

        if (!unlockAll()) {
            logger.info("Keys used: " + JSON.stringify(keys));
        }
    }

    let message = "";
    const loggerOutput = logger.getOutput();
    if (loggerOutput) message += loggerOutput;
    if (loggerOutput && res) message += "\n";
    if (res) message += res;

    return message;
}
