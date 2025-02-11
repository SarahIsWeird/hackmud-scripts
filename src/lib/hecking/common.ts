import { Logger, Utils } from '/scripts/sarahisweird/utils';
import { HeckingArgs } from '/lib/hecking/args';

export type LockValue = string | number;
export type LockKeys = Record<string, LockValue>;

// https://github.com/samualtnorman/hackmud-script-manager/blob/6eb310aee65e95d0f5cadc180c51a39f182cebde/env.d.ts#L700
type DatabasePrimitive = null | boolean | number | string;
export type DatabaseValue = DatabasePrimitive | DatabaseValue[] | { [key: string]: DatabaseValue };

export type State = Record<string, DatabaseValue>;
export class SolvingError extends Error {}

export interface SolverConstructor<T extends State> {
    new (args: HeckingArgs, utils: Utils, logger: Logger, state?: T): Solver<T>;
}

export type Solution = { [k: string]: string | number | Scriptor | undefined };
export interface Solver<T extends State> {
    canSolve(prompt: string): boolean;
    getInitialSolutions(): Solution;
    getSolution(prompt: string): Solution;
    getState(): T;
}

export type TryAllState = { index: number }
export abstract class TryAllSolver<T extends TryAllState = TryAllState> implements Solver<T> {
    protected index: number;
    protected readonly lockName?: string;
    protected readonly key: string;
    protected readonly values: (string | number)[];
    protected readonly failFlag: string;

    protected constructor(key: string, values: (string | number)[], failFlag: string, state?: T, lockName?: string) {
        this.index = state ? state.index : -1;
        this.lockName = lockName;
        this.key = key;
        this.values = values;
        this.failFlag = failFlag;
    }

    canSolve(prompt: string): boolean {
        if (prompt.includes(this.failFlag)) return true;
        if (prompt.includes('Required unlock parameter') && prompt.includes(this.key)) return true;
        if (this.lockName) return prompt.includes(this.lockName);
        return false;
    }

    getInitialSolutions(): Solution {
        return {
            [ this.key ]: this.index >= 0 ? this.values[this.index] : undefined,
        };
    }

    getSolution(_prompt: string): Solution {
        this.index = (this.index + 1) % this.values.length;
        return this.getInitialSolutions();
    }

    getState(): T {
        return {
            index: this.index,
        } as T;
    }
}
