import { TryAllSolver, TryAllState } from '/lib/hecking/common';
import { expect, test } from 'vitest';

class TestSolver extends TryAllSolver {
    constructor(key: string, values: (string | number)[], failFlag: string, state?: TryAllState, lockName?: string) {
        super(key, values, failFlag, state, lockName);
    }
}

test('canSolve produces an accurate answer on solve ability.', () => {
    const mySolver = new TestSolver('my_key', [], 'not the correct thingy', undefined, 'my_lock');

    expect(mySolver.canSolve('Required unlock parameter `Nacct_nt` is missing.'), 'Other required parameters are ignored.')
        .toBe(false);
    expect(mySolver.canSolve('Required unlock parameter `Mmy_key` is missing.'), 'Can solve own required parameter.')
        .toBe(true);

    expect(mySolver.canSolve('Denied access by SAHARA `Macct_nt` lock.'), 'Other locks are ignored.')
        .toBe(false);
    expect(mySolver.canSolve('Denied access by SAHARA `Mmy_key` lock.'), 'Can solve when lock name is equal to key.')
        .toBe(true);
    expect(mySolver.canSolve('Denied access by SAHARA `Mmy_lock` lock.'), 'Can solve when lock name is equal to lock.')
        .toBe(true);

    expect(mySolver.canSolve('"`foo`" is not the correct unlock command.'), 'Other unlock commands are ignored.')
        .toBe(false);
    expect(mySolver.canSolve('"`Vfoo`" is not the correct thingy.'), 'Can solve when fail flag is present and value is a string.')
        .toBe(true);
    expect(mySolver.canSolve('`V1` is not the correct thingy.'), 'Can solve when fail flag is present and value is a number.')
        .toBe(true);
    expect(mySolver.canSolve('null is not the correct thingy.'), 'Can solve when fail flag is present and value is null.')
        .toBe(true);
    expect(mySolver.canSolve('foobar is not the correct thingy.'),
        'Can solve when fail flag is present and value is nonsensical.')
        .toBe(true);
});

test('getInitialSolutions returns the correct initial solution.', () => {
    const answers = [ 0, 1, 2, 'foo', 'bar', 5 ];
    const uninitializedSolver = new TestSolver('my_key', answers, '');

    expect(uninitializedSolver.getInitialSolutions()).toBeDefined();
    expect(uninitializedSolver.getInitialSolutions(), 'Solution is initially undefined.')
        .toEqual({});

    for (const [ i, v ] of answers.entries()) {
        const solver = new TestSolver('my_key', answers, '', { index: i });
        expect(solver.getInitialSolutions(), 'State index is equal to value array index.')
            .toEqual({ my_key: v });
    }
});

test('getSolution tries all possible values.', () => {
    const answers = [ 0, 1, 2, 'foo', 'bar', 5 ];
    const answerSet = new Set(answers);
    const solver = new TestSolver('my_key', answers, '');

    const actual: any[] = [];
    for (let i = 0; i < answers.length; i++) {
        actual.push(solver.getSolution(':)').my_key);
    }

    expect(new Set(actual), 'All solutions are tried.')
        .toEqual(answerSet);

    expect(actual.length, 'Answers aren\'t tried multiple times unnecessarily.')
        .toBe(answerSet.size);
});

test('Constructing solver using getState return picks up where it left off', () => {
    const answers = [ 0, 1, 2, 'foo', 'bar', 5 ];
    let solver = new TestSolver('my_key', answers, '');

    const actual: any[] = [];
    for (let i = 0; i < answers.length; i++) {
        solver = new TestSolver('my_key', answers, '', solver.getState());
        actual.push(solver.getSolution(':)').my_key);
    }

    expect(actual, 'All answers are tried in the same order as without state saving.')
        .toStrictEqual(answers);
});
