import { Solution, Solver, SolvingError } from '/lib/hecking/common';
import { HeckingArgs } from '/lib/hecking/args';
import { Logger, Utils } from '/scripts/sarahisweird/utils';

const areAnagrams = (word1: string, word2: string): boolean => {
    const sortedWord1 = word1.split("").sort().join("");
    const sortedWord2 = word2.split("").sort().join("");

    return sortedWord1 == sortedWord2;
}

const getPermutationsWith = (prevPerms: number[], index: number): number[][] => {
    if (prevPerms.length === 0) return [[ index ]];

    const perms: number[][] = [];
    for (let i = 0; i <= prevPerms.length; i++) {
        let perm = prevPerms.slice(0, i);
        perm.push(index);
        perm = perm.concat(prevPerms.slice(i));
        perms.push(perm);
    }

    return perms;
}

const getIndexPermutations = (limit: number): number[][] => {
    if (limit === 0) return [[ 0 ]];
    return getIndexPermutations(limit - 1)
        .flatMap(perm => getPermutationsWith(perm, limit));
}

const uniqArrayReducer = <T>(arr: T[], value: T) => {
    if (arr[arr.length - 1] === value) return arr;
    arr.push(value);
    return arr;
};

type MagnaraState = { index: number, values: string[], prompt?: string, didPermute: boolean };
export class MagnaraSolver implements Solver<MagnaraState> {
    private readonly logger: Logger;

    private index: number;
    private values: string[];
    private prompt?: string;
    private didPermute: boolean;

    constructor(_args: HeckingArgs, _utils: Utils, logger: Logger, state?: MagnaraState) {
        this.logger = logger.getLogger('`Mmagnara`');

        this.index = state ? state.index : -1;
        this.values = state?.values || [];
        this.prompt = state?.prompt;
        this.didPermute = state?.didPermute || false;
    }

    canSolve(prompt: string): boolean {
        if (prompt.includes('magnara')) return true;
        return prompt.includes('recinroct');
    }

    getInitialSolutions(): Solution {
        if (!this.prompt) return {};
        return { magnara: this.values[this.index] || '' };
    }

    getSolution(prompt: string): Solution {
        const parts = prompt.split(' ');
        const magnaraPrompt = parts[parts.length - 1];
        if (magnaraPrompt == 'lock.') return { magnara: '' };

        if (!this.prompt || (this.prompt !== magnaraPrompt)) {
            this.prompt = magnaraPrompt;
            this.fillInValues(magnaraPrompt);
        }

        if (this.index == this.values.length) {
            if (this.didPermute) {
                this.logger.error(`Didn't find correct answer by permuting either!`);
                throw new SolvingError();
            }

            this.permutePrompt(magnaraPrompt);
        }

        if (this.values.length > 0) {
            this.index++;
        }

        return this.getInitialSolutions();
    }

    getState(): MagnaraState {
        return {
            index: this.index,
            values: this.values,
            prompt: this.prompt,
            didPermute: this.didPermute,
        };
    }

    private fillInValues(prompt: string) {
        const words = $db.f({
            type: 'dictionary',
            wordLength: prompt.length,
        }).first()?.words as string[] | null;

        if (!words) {
            this.logger.error(`Missing database entry for word length ${prompt.length}!`);
            throw new SolvingError();
        }

        if (words.length == 0) {
            this.permutePrompt(prompt);
            return;
        }

        this.index = -1;
        this.values = words.filter(word => areAnagrams(prompt, word));
        this.logger.debug(`Found ${this.values.length} words for ${prompt}.`);

        if (this.values.length === 0) {
            this.permutePrompt(prompt);
        }
    }

    private permutePrompt(prompt: string) {
        this.logger.warn(`Permuting ${prompt} to find the answer.`);
        this.values = getIndexPermutations(prompt.length)
            .map(indices => indices.map(i => prompt[i]).join(''))
            .filter(perm => !this.values.includes(perm)) // We already tried these!
            .sort()
            .reduce(uniqArrayReducer, [] as string[]);

        this.index = -1;
        this.didPermute = true;
    }
}
