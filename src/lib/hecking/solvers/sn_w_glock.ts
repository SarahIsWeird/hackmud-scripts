import { Solution, Solver, SolvingError } from '/lib/hecking/common';
import { HeckingArgs } from '/lib/hecking/args';
import { Logger, Utils } from '/scripts/sarahisweird/utils';

const glockBalances = {
    "hunter's": 3006,
    "secret": 7,
    "secure": 443,
    "meaning": 42,
    "beast": 666,
    "special": 38,
    "magician": 1089,
    "elite": 1337,
    "monolithic": 2001,
};

export class SnWGlockSolver extends Object implements Solver<{}> {
    constructor(_args: HeckingArgs, _utils: Utils, _rootLogger: Logger, _state?: {}) {
        super();
    }

    canSolve(prompt: string): boolean {
        for (const glockPrompt of Object.keys(glockBalances)) {
            if (prompt.includes(glockPrompt)) return true;
        }

        return false;
    }

    getInitialSolutions(): Solution {
        return { sn_w_glock: '' };
    }

    getSolution(prompt: string): Solution {
        const solution = Object.entries(glockBalances)
            .find(([ k ]) => prompt.includes(k));

        if (!solution) {
            throw new SolvingError(`Unknown glock prompt: ${prompt}`);
        }

        $ms.sahara.sparkasse({ withdraw: solution[1] });
        $G.glockAmount = solution[1];
        return this.getInitialSolutions();
    }

    getState(): {} {
        return {};
    }
}
