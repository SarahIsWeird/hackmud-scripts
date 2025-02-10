import { L0ckboxSolver } from '/lib/hecking/solvers/l0ckbox';
import { ConSpecSolver } from '/lib/hecking/solvers/con_spec';
import { MagnaraSolver } from '/lib/hecking/solvers/magnara';
import { AcctNtSolver } from '/lib/hecking/solvers/acct_nt';
import { Solver, SolverConstructor } from '/lib/hecking/common';
import { SolverTier } from '/lib/hecking/solvers';
import { SnWGlockSolver } from '/lib/hecking/solvers/sn_w_glock';

const t2SolverClasses = {
    l0ckboxSolver: L0ckboxSolver,
    conSpecSolver: ConSpecSolver,
    magnaraSolver: MagnaraSolver,
    acctNtSolver: AcctNtSolver,
    snWGlockSolver: SnWGlockSolver,
} satisfies Record<string, SolverConstructor<any>>;

export type T2SolverNames = keyof typeof t2SolverClasses;
export type T2Solvers = Record<T2SolverNames, Solver<any>>;

export class T2SolverTier implements SolverTier<T2Solvers> {
    oldBalance: number = 0;

    getName(): string {
        return 'T2SolverTier';
    }

    getSolvers(): Record<keyof T2Solvers, SolverConstructor<any>> {
        return t2SolverClasses;
    }

    onStateLoad() {
        this.oldBalance = $hs.accts.balance();
        $ms.accts.xfer_gc_to({ to: "sahara", amount: this.oldBalance });
    }

    private returnMoney() {
        if ($G.glockAmount) this.oldBalance -= $G.glockAmount;
        $ms.sahara.sparkasse({ withdraw: this.oldBalance });
    }

    onStateSave() {
        this.returnMoney();
    }

    onErrorExit() {
        this.returnMoney();
    }
}
