import { Solution, Solver } from '/lib/hecking/common';
import { Logger, Utils } from '/scripts/sarahisweird/utils';
import { HeckingArgs } from '/lib/hecking/args';

// noinspection DuplicatedCode
function findNextLetters(letterSequence: string, count?: number) {
    count = (typeof(count) === "number") ? count : 3;

    const aCharCode = "A".charCodeAt(0);
    const firstOf = (arr: any[]) => arr[0];
    const lastOf = (arr: any[]) => arr[arr.length - 1];

    // First, we convert the letters into numbers. The exact numbering system
    // doesn't matter, it just has to be consistent.
    // We just set A to 0 and Z to 25 for this.
    const charToNumber = (c: string) => c.charCodeAt(0) - aCharCode;
    const numberToChar = (n: number) => String.fromCharCode(n % 26 + aCharCode);
    const numericSequence = letterSequence.split("").map(charToNumber);

    // Then we figure out the distance between the numbers (letters).
    // `steps` will look something like one of these examples:
    //     [ 1, 1, 1 ]
    //     [ 1, 3, 1 ]
    //     [ 3, 1, 3 ]
    //     [ 2, 2, 2 ]
    //     [ -1, -1, -1 ]
    //     [ -1, -3, -1 ]
    const steps = numericSequence.slice(0, numericSequence.length - 1)
        .map((n, i) => numericSequence[i + 1] - n);

    // We use this offset to make sure we hit the right step on all
    // given input string sizes.
    // [ 1, 3, 1 ] => [ 3, 1, 3 ], but [ 1, 3, 1, 3 ] => [ 1, 3, 1 ]
    const offset = (firstOf(steps) !== lastOf(steps)) ? 0 : 1;

    let lastNumber: number = lastOf(numericSequence);
    const nextNumbers = [];
    for (let i = 0; i < count; i++) {
        const stepIndex = (i % 2) + offset;
        const nextNumber = lastNumber + steps[stepIndex % 2];
        nextNumbers.push(nextNumber);
        lastNumber = nextNumber;
    }

    // Convert the numbers back into a string.
    return nextNumbers.map(numberToChar).join("");
}

const countDigits = ({ s, d }: { s: string, d: number }) =>
    s.split('').reduce((acc, char) =>
        acc + (char === d.toString() ? 1 : 0), 0);

const countingScriptor = {
    name: 'sarahisweird.hecking',
    call: countDigits,
};

type ConSpecState = { result?: string };
export class ConSpecSolver implements Solver<ConSpecState> {
    private result?: string;

    constructor(_args: HeckingArgs, _utils: Utils, _logger: Logger, state?: ConSpecState) {
        this.result = state?.result;
    }

    canSolve(prompt: string): boolean {
        if (prompt.includes('CON_SPEC')) return true;
        return prompt.includes('Provide');
    }

    getInitialSolutions(): Solution {
        return { CON_SPEC: this.result };
    }

    getSolution(prompt: string): Solution {
        if (prompt.includes('scriptor')) {
            return { CON_SPEC: countingScriptor };
        }

        const letterSequence = prompt.split('\n')[0];
        this.result = findNextLetters(letterSequence);

        return this.getInitialSolutions();
    }

    getState(): ConSpecState {
        return { result: this.result };
    }
}
