import { Solution, Solver, SolvingError } from '/lib/hecking/common';
import { HeckingArgs } from '/lib/hecking/args';
import { Logger, Utils } from '/scripts/sarahisweird/utils';
import { stringHash } from '/lib/common';

export type AcctNtState = {
    index: number;
    values?: number[];
    promptHash?: number;
};

export class AcctNtSolver implements Solver<AcctNtState> {
    private readonly logger: Logger;
    private readonly utils: Utils;
    private readonly caller: string;
    private readonly maxLargeTxDistance: number;

    private index: number;
    private values?: number[];
    private promptHash?: number;

    constructor(args: HeckingArgs, utils: Utils, logger: Logger, state?: AcctNtState) {
        this.logger = logger.getLogger('`3acct_nt`');
        this.utils = utils;
        this.caller = args.caller;
        this.maxLargeTxDistance = args.maxLargeTxDistance;

        this.index = state?.index || 0;
        this.values = state?.values;
        this.promptHash = state?.promptHash;
    }

    canSolve(prompt: string): boolean {
        if (prompt.includes('acct_nt')) return true;
        if (prompt.includes('What was the net')) return true;
        if (prompt.includes('Get me the amount')) return true;
        return prompt.includes('transactions');
    }

    getInitialSolutions(): Solution {
        return {
            acct_nt: this.values ? this.values[this.index] : undefined,
        };
    }

    getSolution(prompt: string): Solution {
        if (prompt.includes('acct_nt')) return { acct_nt: '' };

        if (!this.values || (this.promptHash !== stringHash(prompt))) {
            this.populateSolutions(prompt);
        } else if (this.index === this.values.length) {
            this.logger.error('Failed to find correct solution for acct_nt!');
            throw new SolvingError();
        } else {
            this.index++;
        }

        return this.getInitialSolutions();
    }

    getState(): AcctNtState {
        return {
            index: this.index,
            values: this.values,
            promptHash: this.promptHash,
        };
    }

    private populateSolutions(prompt: string) {
        this.promptHash = stringHash(prompt);

        if (prompt.includes('near')) {
            this.populateLargeTransactionSolutions(prompt);
        } else {
            this.populateNetGCSolutions(prompt);
        }
    }

    private findNearestTransactionIndex(transactions: Transaction[], time: Date): number {
        let nearestDiff = Infinity;
        let nearestI = -1;

        for (const [ i, tx ] of transactions.entries()) {
            const diff = this.utils.dateDiffSecs(tx.time, time);
            if (diff > nearestDiff) break;

            nearestDiff = diff;
            nearestI = i;
        }

        return nearestI;
    }

    private populateLargeTransactionSolutions(prompt: string) {
        const parts = prompt.split(' ');
        const timeStr = parts[parts.length - 1];

        const time= this.utils.timeStringToDate(timeStr);
        const isDeposit = prompt.includes('deposit');

        const transactions = $hs.accts.transactions({
            count: 'all',
            from: isDeposit ? undefined : this.caller,
            to: isDeposit ? this.caller : undefined,
        });

        const nearestTxI = this.findNearestTransactionIndex(transactions, time);
        this.values = [];
        for (const offset of this.utils.getLargeTxOffsets(this.maxLargeTxDistance)) {
            const transaction = transactions[nearestTxI + offset];
            if (!transaction) continue; // May be out-of-range!

            this.values.push(transaction.amount);
        }
    }

    private populateNetGCSolutions(prompt: string) {
        throw new Error('Net GC solver not yet implemented!');
    }
}
