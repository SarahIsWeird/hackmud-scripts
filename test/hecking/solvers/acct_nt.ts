import { HeckingArgs } from '/lib/hecking/args';
import { LogLevel } from '/lib/logging';
import { AcctNtSolver, AcctNtState } from '/lib/hecking/solvers/acct_nt';
import utilsScript from '/scripts/sarahisweird/utils';
import allTransactionsRaw from '../../data/transactions.json';
import { afterAll, expect, test } from 'vitest';
import { Solution } from '/lib/hecking/common';

const allTransactions: Transaction[] = allTransactionsRaw
    .map((tx) => ({ ...tx, time: new Date(tx.time) }));

const context: Context = {
    caller: 'sarahisweird',
    this_script: 'example.script',
    calling_script: null,
    rows: 420,
    cols: 69,
};

const utils = utilsScript(context);

const heckingArgs = (target: Scriptor): HeckingArgs => ({
    caller: 'sarahisweird',
    logLevel: LogLevel.ERROR,
    maxLargeTxDistance: 2,
    profiler: false,
    rental: null,
    reset: false,
    suppliedKeys: {},
    target: target,
    tiers: [],
});

// @ts-ignore
global.$hs = {
    accts: {},
};

// @ts-ignore
global.$hs.accts.transactions = (args?: Record<string, any>) => {
    if (!args) return allTransactions;

    let txs = allTransactions;
    if (!args.count) args.count = 10;
    if (args.count !== 'all') {
        txs = txs.slice(0, args.count);
    }

    if (args.to) {
        txs = txs.filter(({ recipient }) => recipient === args.to);
    }

    if (args.from) {
        txs = txs.filter(({ sender }) => sender === args.from);
    }

    if (args.script) {
        txs = txs.filter(({ script }) => script === args.script);
    }

    return txs;
};

const makeAccountantSolver = (target: Scriptor, state?: AcctNtState): AcctNtSolver =>
    new AcctNtSolver(heckingArgs(target), utils, utils.logger, state);

type AccountantSolution = number;
type Accountant = [ Scriptor, AccountantSolution ];

const makeLargeTxAccountant = (): Accountant => {
    const isWithdrawal = Math.random() < 0.5;

    let txs: Transaction[] = [];
    while (txs.length === 0) {
        const acctNtMin = 4;
        const start = Math.floor(Math.random() * 10);
        const end = Math.min(start + acctNtMin, allTransactions.length);
        txs = allTransactions
            .slice(start, end)
            .filter(tx =>
                isWithdrawal
                    ? tx.sender === context.caller
                    : tx.recipient === context.caller)
    }

    const tx = txs.reduce((prev, curr) =>
        prev.amount > curr.amount ? prev : curr);

    let kind = isWithdrawal ? 'withdrawal' : 'deposit';

    const dateString = utils.dateToTimeString(tx.time);

    const scriptor = {
        name: 'example.loc',
        call: (args?: { acct_nt?: number }) => {
            if (!args || !('acct_nt' in args))
                return '`VLOCK_ERROR`\nDenied access by #FUTUREtech `Nacct_nt` lock.';

            if (args.acct_nt !== tx.amount)
                return `Get me the amount of a large ${kind} near ${dateString}`;

            return '`NLOCK_UNLOCKED` acct_nt\nSystem breached.';
        },
    };

    return [ scriptor, tx.amount ];
};

test('AcctNtSolver can solve large transactions', { timeout: 60000 }, () => {
    const RUNS = 10000;
    let successes = 0;

    for (let i = 0; i < RUNS; i++) {
        const [ scriptor, answer ] = makeLargeTxAccountant();
        const solver = makeAccountantSolver(scriptor);

        let lastKeys: Solution = {};
        let didSolve = false;
        while (!didSolve) {
            const lockResponse = scriptor.call(lastKeys) as string;
            expect(solver.canSolve(lockResponse)).toBe(true);
            try {
                lastKeys = {
                    ...lastKeys,
                    ...solver.getSolution(lockResponse),
                };
            } catch (e) {
                didSolve = true;
            }

            if (lastKeys.acct_nt == answer) {
                didSolve = true;
                break;
            }
        }

        // expect(lastKeys).toHaveProperty('acct_nt', answer);
        if (lastKeys.acct_nt === answer) successes++;
    }

    expect(successes).toBe(RUNS);
});

afterAll(() => {
    // console.log(utils.logger.getOutput());
});
