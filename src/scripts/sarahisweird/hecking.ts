import { Utils } from '/scripts/sarahisweird/utils';
import { parseArgs, usage } from '/lib/hecking/args';
import { loadSolvers, saveSolverStates } from '/lib/hecking/persistence';
import { filterValues } from '/lib/common';
import { SolvingError } from '/lib/hecking/common';
import { Solvers } from '/lib/hecking/solvers';

export default function (context: Context, rawArgs?: unknown) {
    const utils = $fs.sarahisweird.utils() as Utils;
    const logger = utils.logger.getLogger('`MHECK`');

    const args = parseArgs(context, utils, rawArgs);
    if (args === null) return usage;

    const failure = () =>
        ({ ok: false, msg: logger.getOutput({ logLevel: args?.logLevel }) });

    const profilingLogger = logger.getLogger('`3PROFILER`');
    if (!args.profiler) {
        profilingLogger.log = () => {};
    }

    let keys: Record<string, string | number | Scriptor | undefined> = {};
    let res: string = '';
    const poke = () => {
        const start = Date.now();

        const definedKeys = filterValues(keys, v => v !== undefined);
        logger.trace(`Poking with keys: ${JSON.stringify(definedKeys)}`);
        res = args.target.call(definedKeys) as string;

        profilingLogger.trace(`Poke took ${Date.now() - start}ms.`);
    };

    const locScriptLevel = $fs.scripts.get_level({ name: args.target.name });
    if (typeof(locScriptLevel) === 'object') {
        logger.error(`Loc ${args.target.name} doesn't exist!`);
        return failure();
    }

    const locResponse = args.target.call({});
    if (typeof(locResponse) !== 'string') {
        logger.error('The provided target doesn\'t seem to be a loc!');
        return failure();
    } else if (locResponse.includes('hardline required')) {
        logger.error('You must be in hardline to breach this target!');
        return failure();
    }

    const hasTimeLeft = (): boolean =>
        (Date.now() + 1000) < _END;

    const addInitialSolutions = (solvers: Solvers) => {
        for (const solver of Object.values(solvers)) {
            keys = { ...keys, ...solver.getInitialSolutions() };
        }
    };

    const doSolvePass = (solvers: Solvers): boolean => {
        let matchingSolverFound = false;
        const parts = res.split('\n');
        const lastLine = parts[parts.length - 1];
        for (const unlocker of Object.values(solvers)) {
            if (!unlocker.canSolve(lastLine)) continue;
            matchingSolverFound = true;

            keys = { ...keys, ...unlocker.getSolution(res) };
            break;
        }

        if (!matchingSolverFound) {
            logger.error('No matching solver found!');
            return false;
        }

        return true;
    };

    let success = true;
    try {
        const solvers = loadSolvers(args, utils, logger);
        addInitialSolutions(solvers);

        poke();
        while (!res.includes('breached')) {
            if (!hasTimeLeft()) {
                logger.warn('Not enough time left!');
                break;
            }

            if (!doSolvePass(solvers)) break;
            poke();
        }

        saveSolverStates(args, logger, solvers);
    } catch (e) {
        if (e instanceof SolvingError) {}
        else if (e instanceof Error) {
            logger.error(`${e.name}: ${e.message}\n${e.stack}`);
        } else {
            logger.error(`${e}`);
        }

        success = false;

        for (const tier of args.tiers) {
            tier.onErrorExit();
        }
    }

    logger.info('Output:\n' + res);
    return { ok: success, msg: logger.getOutput({ logLevel: args.logLevel }) };
};
