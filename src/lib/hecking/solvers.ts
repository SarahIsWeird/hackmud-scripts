import { Solver, SolverConstructor } from '/lib/hecking/common';
import { HeckingArgs } from '/lib/hecking/args';
import { Logger, Utils } from '/scripts/sarahisweird/utils';

export type Solvers = Record<string, Solver<any>>;

export interface SolverTierConstructor<Solvers extends {}> {
    new (args: Omit<HeckingArgs, 'tiers'>, utils: Utils, logger: Logger): SolverTier<Solvers>;
}

export interface SolverTier<Solvers extends {}> {
    getName(): string;
    getSolvers(): Record<keyof Solvers, SolverConstructor<any>>;

    onStateLoad(): void;
    onStateSave(): void;
    onErrorExit(): void;
}
