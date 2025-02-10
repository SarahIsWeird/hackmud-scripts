import { Solution, Solver } from '/lib/hecking/common';
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
        const parts = prompt.split('\n');
        if (parts[parts.length - 1].includes('acct_nt')) return { acct_nt: '' };

        if (!this.values || (this.promptHash !== stringHash(prompt))) {
            this.populateSolutions(parts[parts.length - 1]);
        } else if (this.index + 1 === this.values.length) {
            this.logger.error('Failed to find correct solution for acct_nt!');
            throw new Error();
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
        const start = Math.max(nearestTxI - this.maxLargeTxDistance, 0);
        const end = Math.min(nearestTxI + this.maxLargeTxDistance, transactions.length);

        this.values = transactions.slice(start, end)
            .map(tx => tx.amount)
            .sort((a, b) => b - a);
    }

    private populateNetGCSolutions(prompt: string) {
        const parts = prompt.split(' ');
        const fromStr = parts[parts.length - 3];
        const toStr = parts[parts.length - 1];

        const fromRaw = this.utils.timeStringToDate(fromStr);
        const toRaw = this.utils.timeStringToDate(toStr);

        const MS_IN_A_MINUTE = 1000 * 60;
        const earliestFrom = new Date(fromRaw.valueOf() - MS_IN_A_MINUTE);
        const latestFrom = new Date(fromRaw.valueOf() + MS_IN_A_MINUTE);
        const earliestTo = new Date(toRaw.valueOf() - MS_IN_A_MINUTE);
        const latestTo = new Date(toRaw.valueOf() + MS_IN_A_MINUTE);

        this.logger.info(`${fromStr} to ${toStr}`);
        this.logger.info(`${earliestFrom} to ${earliestTo}`);
        this.logger.info(`${latestFrom} to ${latestTo}`);

        const withMemosOnly = prompt.includes('with memo');
        const withoutMemosOnly = prompt.includes('without memo');

        const transactions = $hs.accts.transactions({ count: 'all' })
            .filter(({ time }) =>
                (time >= earliestFrom) && (time <= latestTo))
            .filter(({ memo }) => {
                if (withMemosOnly) return memo;
                if (withoutMemosOnly) return !memo;
                return true;
            });

        const lastStart = this.utils.lastTxIndexOf(transactions, toRaw);
        const earliestEnd = this.utils.txIndexOf(transactions, fromRaw);
        this.logger.info(`${lastStart} to ${earliestEnd}`);

        this.values = [];
        for (let startI = lastStart; startI >= 0; startI--) {
            for (let endI = earliestEnd - 1; endI < transactions.length; endI++) {
                if (startI > endI) continue;

                const sum = this.utils.sumTxs(transactions.slice(startI, endI + 1), this.caller);
                this.values.push(sum);
            }
        }
    }
}
