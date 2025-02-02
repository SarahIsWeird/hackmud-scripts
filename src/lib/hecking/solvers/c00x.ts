import { Solution, Solver } from '/lib/hecking/common';
import { Logger, Utils } from '/scripts/sarahisweird/utils';
import { HeckingArgs } from '/lib/hecking/args';

const colors = ["red", "orange", "yellow", "lime", "green", "cyan", "blue", "purple"];

type C00xIndices = {
    c001: number;
    c002: number;
    c003: number;
};

const c00xTypes: (keyof C00xIndices)[] = [ 'c001', 'c002', 'c003' ];
type C00xState = { type: keyof C00xIndices | null, indices: C00xIndices };
export class C00xSolver implements Solver<C00xState> {
    private type?: keyof C00xIndices;
    private readonly indices: C00xIndices;

    constructor(_args: HeckingArgs, _utils: Utils, _logger: Logger, state?: C00xState) {
        this.type = state?.type || undefined;
        this.indices = state?.indices || {
            c001: -1,
            c002: -1,
            c003: -1,
        };
    }

    canSolve(prompt: string): boolean {
        const type = c00xTypes
            .find(type => prompt.includes(type));

        if (type) {
            this.type = type;
            return true;
        }

        return prompt.includes('is not the correct color name.');
    }

    getInitialSolutions(): Solution {
        let triads: [ string, string ] | undefined = undefined;
        if (this.indices.c003 >= 0) triads = this.getTriads();

        return {
            c001: this.indices.c001 >= 0 ? colors[this.indices.c001] : undefined,
            color_digit: this.indices.c001 >= 0 ? this.getColorDigit() : undefined,
            c002: this.indices.c002 >= 0 ? colors[this.indices.c002] : undefined,
            c002_complement: this.indices.c002 >= 0 ? this.getComplementColor() : undefined,
            c003: this.indices.c003 >= 0 ? colors[this.indices.c003] : undefined,
            c003_triad_1: triads?.[0],
            c003_triad_2: triads?.[1],
        };
    }

    getSolution(_prompt: string): Solution {
        if (!this.type) throw new Error('Illegal state: this.type is undefined!');

        this.indices[this.type] = (this.indices[this.type] + 1) % 8;
        return this.getInitialSolutions();
    }

    getState(): C00xState {
        return {
            type: this.type || null,
            indices: this.indices,
        };
    }

    private getColorDigit(): number {
        return colors[this.indices.c001].length;
    }

    private getComplementColor(): string {
        return colors[(this.indices.c002 + 4) % 8];
    }

    private getTriads(): [ string, string ] {
        return [
            colors[(this.indices.c003 + 5) % 8],
            colors[(this.indices.c003 + 3) % 8],
        ];
    }
}
