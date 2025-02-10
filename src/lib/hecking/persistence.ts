import { HeckingArgs } from '/lib/hecking/args';
import { Logger, Utils } from '/scripts/sarahisweird/utils';
import { mapValues } from '/lib/common';
import { SolverConstructor, State } from '/lib/hecking/common';
import { Solvers } from '/lib/hecking/solvers';

type SavedState = {
    type: 'hecking_saved_state',
    loc: string,
    unlockerStates: Record<string, State>,
};

const loadStates = (args: HeckingArgs, rootLogger: Logger): Record<string, State> => {
    const logger = rootLogger.getLogger('`YDB`');

    for (const tier of args.tiers) {
        rootLogger.debug(`Calling onStateLoad hook of ${tier.getName()}`)
        tier.onStateLoad();
    }

    if (args.reset) {
        logger.warn('Resetting state!');
        $db.r({ type: 'hecking_saved_state', loc: args.target.name });
    }

    const savedStates = $db.f({
        type: 'hecking_saved_state',
        loc: args.target.name
    }).first() as SavedState | null;

    if (!savedStates) {
        logger.debug('No saved state found.');
        return {};
    }

    return savedStates?.unlockerStates;
};

export const loadSolvers = (args: HeckingArgs, utils: Utils, logger: Logger): Solvers => {
    const states = loadStates(args, logger);

    const solvers: Solvers = {} as Solvers;
    for (const tier of args.tiers) {
        for (const [ name, ctor ] of Object.entries(tier.getSolvers())) {
            solvers[name] = new (ctor as SolverConstructor<any>)(args, utils, logger, states[name]);
        }
    }

    return solvers;
};

export const saveSolverStates = (args: HeckingArgs, rootLogger: Logger, solvers: Solvers) => {
    const logger = rootLogger.getLogger('`YDB`');

    const solverStates = mapValues(solvers, solver => solver.getState());

    for (const tier of args.tiers) {
        rootLogger.debug(`Calling onStateSave hook of ${tier.getName()}`)
        tier.onStateSave();
    }

    const dbResult = $db.us({
        type: 'hecking_saved_state',
        loc: args.target.name,
    }, {
        $set: { unlockerStates: solverStates },
    });

    if (dbResult.find(({ ok }) => !ok)) {
        logger.error('Failed to save the state!');
    }

    if (dbResult.reduce((sum, { n }) => sum + n, 0) > 1) {
        logger.warn('Multiple states found in the database! Undefined behavior may occur.');
        logger.warn('To fix this, run with `Nreset`: `Vtrue`.');
    }
};
