import { L0ckboxSolver } from '/lib/hecking/solvers/l0ckbox';
import { ConSpecSolver } from '/lib/hecking/solvers/con_spec';
import { MagnaraSolver } from '/lib/hecking/solvers/magnara';
import { AcctNtSolver } from '/lib/hecking/solvers/acct_nt';
import { Solver, SolverConstructor } from '/lib/hecking/common';
import { SolverTier } from '/lib/hecking/solvers';

const t2SolverClasses = {
    l0ckboxSolver: L0ckboxSolver,
    conSpecSolver: ConSpecSolver,
    magnaraSolver: MagnaraSolver,
    acctNtSolver: AcctNtSolver,
} satisfies Record<string, SolverConstructor<any>>;

export type T2SolverNames = keyof typeof t2SolverClasses;
export type T2Solvers = Record<T2SolverNames, Solver<any>>;

export class T2SolverTier implements SolverTier<T2Solvers> {
    getName(): string {
        return 'T2SolverTier';
    }

    getSolvers(): Record<keyof T2Solvers, SolverConstructor<any>> {
        return t2SolverClasses;
    }

    onStateLoad() {}
    onStateSave() {}
}
