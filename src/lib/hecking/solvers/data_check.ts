import { Solution, Solver } from '/lib/hecking/common';
import { Logger, Utils } from '/scripts/sarahisweird/utils';
import { HeckingArgs } from '/lib/hecking/args';

type DataCheckState = { result?: string };
export class DataCheckSolver implements Solver<DataCheckState> {
    private readonly answers: Record<string, string>;
    private result?: string;

    constructor(_args: HeckingArgs, _utils: Utils, _logger: Logger, state?: DataCheckState) {
        this.result = state?.result;

        const answers = $db.f({ name: 'data_check_answers' }).first();
        if (!answers) throw new Error('Couldn\'t find DATA_CHECK answers in the database!');
        this.answers = answers.answers as Record<string, string>;
    }

    canSolve(prompt: string): boolean {
        if (prompt.includes('DATA_CHECK')) return true;
        return prompt.includes('++++++');
    }

    getInitialSolutions(): Solution {
        return {
            DATA_CHECK: this.result,
        };
    }

    getSolution(prompt: string): Solution {
        this.result = prompt.split('\n')
            .map(line => this.answers[line.replaceAll('.', '')])
            .filter(q => q)
            .join('');
        return this.getInitialSolutions();
    }

    getState(): DataCheckState {
        return {
            result: this.result,
        };
    }
}
