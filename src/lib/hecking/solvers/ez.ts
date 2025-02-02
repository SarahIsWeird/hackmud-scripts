import { Solution, TryAllState, TryAllSolver, Solver } from '/lib/hecking/common';
import { Logger, Utils } from '/scripts/sarahisweird/utils';
import { HeckingArgs } from '/lib/hecking/args';

const unlockCommands = [ 'open', 'release', 'unlock' ];

type EzIndices = {
    ez_21: number,
    ez_35: number,
    ez_40: number,
};

const ezTypes: (keyof EzIndices)[] = [ 'ez_21', 'ez_35', 'ez_40' ];

type EzState = { name: keyof EzIndices | null, indices: EzIndices };
export class EzSolver implements Solver<EzState> {
    private type?: keyof EzIndices;
    private readonly indices: EzIndices;

    constructor(_args: HeckingArgs, _utils: Utils, _logger: Logger, state?: EzState) {
        this.type = state?.name || undefined;
        this.indices = state?.indices || {
            ez_21: -1,
            ez_35: -1,
            ez_40: -1,
        }
    }

    canSolve(prompt: string): boolean {
        const type = ezTypes
            .find(type => prompt.includes(type.toUpperCase()));

        if (type) {
            this.type = type;
            return true;
        }

        return prompt.includes('is not the correct unlock command.');
    }

    getInitialSolutions(): Solution {
        return {
            ez_21: this.indices.ez_21 >= 0 ? unlockCommands[this.indices.ez_21] : undefined,
            ez_35: this.indices.ez_35 >= 0 ? unlockCommands[this.indices.ez_35] : undefined,
            ez_40: this.indices.ez_40 >= 0 ? unlockCommands[this.indices.ez_40] : undefined,
        };
    }

    getSolution(_prompt: string): { [p: string]: string | number } {
        if (!this.type) throw new Error('Illegal state: name is undefined!');

        this.indices[this.type] = (this.indices[this.type] + 1) % 3;

        return {
            [ this.type ]: unlockCommands[this.indices[this.type]],
        };
    }

    getState(): EzState {
        return {
            name: this.type || null,
            indices: this.indices,
        };
    }
}

export class EzDigitSolver extends TryAllSolver {
    constructor(_args: HeckingArgs, _utils: Utils, _logger: Logger, state?: TryAllState) {
        super('digit', [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ], 'correct digit', state);
    }
}

export class EzPrimeSolver extends TryAllSolver {
    constructor(_args: HeckingArgs, utils: Utils, _logger: Logger, state?: TryAllState) {
        super('ez_prime', utils.getPrimes(100), 'correct prime', state);
    }
}
