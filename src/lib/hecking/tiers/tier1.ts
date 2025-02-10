import { EzDigitSolver, EzPrimeSolver, EzSolver } from '/lib/hecking/solvers/ez';
import { C00xSolver } from '/lib/hecking/solvers/c00x';
import { L0cketSolver } from '/lib/hecking/solvers/l0cket';
import { DataCheckSolver } from '/lib/hecking/solvers/data_check';
import { Solver, SolverConstructor } from '/lib/hecking/common';
import { SolverTier } from '/lib/hecking/solvers';

const t1SolverClasses = {
    ezSolver: EzSolver,
    ezDigitSolver: EzDigitSolver,
    ezPrimeSolver: EzPrimeSolver,
    c00xSolver: C00xSolver,
    l0cketSolver: L0cketSolver,
    dataCheckSolver: DataCheckSolver,
} satisfies Record<string, SolverConstructor<any>>;

export type T1SolverNames = keyof typeof t1SolverClasses;
export type T1Solvers = Record<T1SolverNames, Solver<any>>;

export class T1SolverTier implements SolverTier<T1Solvers> {
    getName(): string {
        return 'T1SolverTier';
    }

    getSolvers() {
        return t1SolverClasses;
    }

    onStateLoad(): void {}
    onStateSave(): void {}
    onErrorExit(): void {}
}
