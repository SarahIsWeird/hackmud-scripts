function(context, args) // { target: #s.some.npc }
{
    const utils = #fs.sarahisweird.utils();
    const lib = #fs.scripts.lib();
    const logger = utils.logger;

    const keys = {};
    let target;
    let res;

    let moneyIsInSahara = false;
    let prevBalance = 0;

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
            c002_complement: colors[complementIndex],
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
        return unlock_c00X("c002", ["c002_complement"], "complement color");
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

    let loadedKey = null;

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
            loadedKey = k3yUpgrade.i;
            logger.info(`Loaded k3y \`0${k3y}\` at upgrade index \`V${k3yUpgrade.i}\`.`);
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
//                           acct_nt unlocker                                 //
////////////////////////////////////////////////////////////////////////////////

    // How many offsets to check for findLargeTransaction.
    const maxLargeDistance = args.max_large_distance || 2;

    function findLargeTransaction(near, withdrawal) {
        const transactions = #hs.accts.transactions({
            count: "all",
            from: withdrawal ? context.caller : undefined,
            to: withdrawal ? undefined : context.caller,
        });

        // keep tally of which tx has the lowest diff to the wanted one

        let nearestDiff = utils.dateDiffSecs(transactions[0].time, near);
        let nearestI = 0;
        while (true) {
            const diff = utils.dateDiffSecs(transactions[nearestI + 1].time, near);
            if (diff > nearestDiff) break;

            nearestDiff = diff;
            nearestI++;
        }

        for (const offset of utils.getLargeTxOffsets(maxLargeDistance)) {
            const tx = transactions[nearestI + offset];
            if (tx === undefined) continue;

            keys.acct_nt = tx.amount;
            res = target.call(keys);

            if (!res.includes("near")) {
                logger.info(`Unlocked acct_nt: ${tx.amount}`);
                return true;
            }
        }

        logger.error("Failed to unlock acct_nt! Try calling with `Nmax_large_distance` greater than 2.");
        return false;
    }

    function netGC(from, to, { depositsOnly, withdrawalsOnly, withMemosOnly, withoutMemosOnly }) {
        depositsOnly = depositsOnly || false;
        withdrawalsOnly = withdrawalsOnly || false;
        withMemosOnly = withMemosOnly || false;
        withoutMemosOnly = withoutMemosOnly || false;

        const acctNtLogger = logger.getLogger("acct_nt");

        let txs = #hs.accts.transactions({
            count: "all",
            from: withdrawalsOnly ? context.caller : undefined,
            to: depositsOnly ? context.caller : undefined,
        });

        if (withMemosOnly) {
            txs = txs.filter(({ memo }) => memo);
        } else if (withoutMemosOnly) {
            txs = txs.filter(({ memo }) => !memo);
        }

        const firstStart = utils.txIndexOf(txs, to);
        const lastEnd = utils.lastTxIndexOf(txs, from);

        txs = txs.slice(firstStart, lastEnd);

        const lastStart = utils.lastTxIndexOf(txs, to);
        let firstEnd = utils.txIndexOf(txs, from);

        acctNtLogger.debug(`Possible starts: ${lastStart + 1}, possible ends: ${txs.length - firstEnd + 1}`);

        for (let startI = lastStart; startI >= 0; startI--) {
            for (let endI = firstEnd - 1; endI < txs.length; endI++) {
                if (startI > endI) continue;

                const sum = utils.sumTxs(txs.slice(startI, endI + 1), context.caller);

                keys.acct_nt = sum;
                res = target.call(keys);

                if (res.split("\n")[0].includes("net")) continue;
                if (res.split("\n")[0].includes("total")) continue;

                logger.info(`Unlocked acct_nt: ${sum}`);
                return true;
            }
        }

        logger.error("Failed to unlock acct_nt!");
        return false;
    }

    function unlock_acct_nt() {
        keys.acct_nt = "";
        res = target.call(keys);

        const prompt = res.split("\n")[0];
        const parts = prompt.split(" ");

        if (prompt.includes("near")) {
            const time = utils.timeStringToDate(parts[parts.length - 1]);
            return findLargeTransaction(time, res.includes("withdrawal"));
        }

        const from = utils.timeStringToDate(parts[parts.length - 3]);
        const to = utils.timeStringToDate(parts[parts.length - 1]);

        return netGC(
            from,
            to,
            {
                depositsOnly: prompt.includes("deposits"),
                withdrawalsOnly: prompt.includes("withdrawals"),
                withMemosOnly: prompt.includes("with memos"),
                withoutMemosOnly: prompt.includes("without memos"),
            }
        );
    }

////////////////////////////////////////////////////////////////////////////////
//                          sn_w_glock unlocker                               //
////////////////////////////////////////////////////////////////////////////////

    const glockBalances = {
        "hunter's": 3006,
        "secret": 7,
        "secure": 443,
        "meaning": 42,
        "beast": 666,
        "special": 38,
        "magician": 1089,
        "elite": 1337,
        "monolithic": 2001,
    };

    function unlock_sn_w_glock() {
        keys.sn_w_glock = "";
        res = target.call(keys);

        const prompt = res.split("\n")[0];

        const glockSolution = Object.entries(glockBalances).find(([ k ]) => prompt.includes(k));
        if (!glockSolution) {
            logger.error("Unknown sn_w_glock prompt: " + prompt);
            return false;
        }

        const [ keyWord, neededBalance ] = glockSolution;
        const { ok, msg } = #ms.sahara.sparkasse({ withdraw: neededBalance });
        if (!ok) {
            logger.error("Failed to get required amount from `Ksahara`: " + msg);
            return false;
        }

        res = target.call(keys);
        prevBalance -= neededBalance; // No free money? :(
        logger.info(`Unlocked sn_w_glock: ${lib.to_gc_str(neededBalance)} (${keyWord})`);
        return true;
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
        "acct_nt": unlock_acct_nt,
        "sn_w_glock": unlock_sn_w_glock,
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

    function getMoneyBack() {
        const { ok } = #ms.sahara.sparkasse({ withdraw: prevBalance });
        if (!ok) {
            logger.error("Failed to get funds back from sahara.sparkasse!");
            logger.error("Please tell Sarah about this! You will get your money back!");
            return false;
        }

        moneyIsInSahara = false;
        logger.warn("Withdrawn money from `Ksahara`.");
        return true;
    }
    
    if (canStartAttempt()) {
        target = args.target;

        prevBalance = #hs.accts.balance();
        if (prevBalance > 32000000000) {
            logger.error("You have more than 32BGC! accts.xfer_gc_to can only transfer 32BGC at once.");
            logger.error("Please get rid of some GC before trying again.");
            return false;
        }

        const { bal: bankBalance, max: maxBankBalance } = #ms.sahara.sparkasse({ get_balance: true });
        const combinedBalance = bankBalance + prevBalance;
        if (combinedBalance > maxBankBalance) {
            logger.error(`\`Ksahara\` can't hold the GC you have! There's only space for ${lib.to_gc_str(maxBankBalance - bankBalance)}.`);
            logger.error("Please make sure you have less than that before trying again.");
            return false;
        }

        logger.warn(`Previous balance: ${lib.to_gc_str(prevBalance)}, transferring to \`Ksahara\`...`);
        #ms.accts.xfer_gc_to({ to: "sahara", amount: prevBalance });
        moneyIsInSahara = true;

        try {
            if (!unlockAll()) {
                logger.info("Keys used: " + JSON.stringify(keys));
            } else if (loadedKey !== null) {
                #ms.sys.manage({ unload: loadedKey });
                logger.info(`Unloaded k3y at upgrade index \`V${loadedKey}\`.`);
            }
        } catch (error) {
            logger.error(error.toString());
        } finally {
            if (moneyIsInSahara) {
                getMoneyBack();
            }
        }
    }

    let message = "";
    const loggerOutput = logger.getOutput({ logLevel: args.debug ? "debug" : "info" });
    if (loggerOutput) message += loggerOutput;
    if (loggerOutput && res) message += "\n";
    if (res) message += res;

    return message;
}
