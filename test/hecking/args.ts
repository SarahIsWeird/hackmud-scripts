import { expect, test } from 'vitest';
import { parseArgs as realParseArgs } from '/lib/hecking/args';
import utilsScript, { Utils } from '/scripts/sarahisweird/utils';
import t1SolverScript, { T1SolverTier } from '/scripts/sarahisweird/t1_solvers';
import t2SolverScript, { T2SolverTier } from '/scripts/sarahisweird/t2_solvers';
import { LogLevel } from '/lib/logging';

const context: Context = {
    caller: 'ada_lovelace',
    this_script: 'example.script',
    calling_script: null,
    rows: 420,
    cols: 69,
};

const exampleScriptor = { name: 'example.loc', call: () => 1 };
const semiValidScriptor = { name: 'technically_invalid_script_name', call: () => 1 };

const utils: Utils = utilsScript(context);

// @ts-ignore
global.$fs = {
    sarahisweird: {
        t1_solvers: () => t1SolverScript(context),
        t2_solvers: () => t2SolverScript(context),
    },
};

const t1SolverScriptor = { name: 't1_scripts', call: () => t1SolverScript(context) };
const t2SolverScriptor = { name: 't2_scripts', call: () => t2SolverScript(context) };

// Makes tests a bit more terse. :)
const parseArgs = (args: any) =>
    realParseArgs(context, utils, args);

const parseArgsNoTarget = ({ ...args }) =>
    parseArgs({ target: exampleScriptor, ...args });

test('parseArgs handles malformed arguments', () => {
    expect(parseArgs(undefined), 'Missing arguments are rejected.')
        .toBeNull();

    expect(parseArgs(null), 'Null arguments are rejected.')
        .toBeNull();

    expect(parseArgs({}), 'Empty arguments are rejected.')
        .toBeNull();
});

test('parseArgs handles target argument properly', () => {
    expect(parseArgs({ target: undefined }), 'Args missing target are rejected.')
        .toBeNull();

    expect(parseArgs({ target: null }), 'Args with null target are rejected.')
        .toBeNull();

    expect(parseArgs({ target: 1234 }), 'Args with invalid target type (number) are rejected.')
        .toBeNull();

    expect(parseArgs({ target: '#s.example.loc' }), 'Args with invalid target type (string) are rejected.')
        .toBeNull();

    expect(parseArgs({ target: {} }), 'Args with invalid target type (non-scriptor object) are rejected.')
        .toBeNull();

    expect(parseArgs({ target: { name: 123, call: 456 } }), 'Args with invalid scriptor value types are rejected.')
        .toBeNull();

    expect(parseArgs({ target: exampleScriptor }), 'Args with valid target scriptor are accepted.')
        .toHaveProperty('target', exampleScriptor);

    expect(parseArgs({ target: semiValidScriptor }), 'Args with valid target scriptor type but invalid script name are accepted.')
        .toHaveProperty('target', semiValidScriptor);
});

test('parseArgs parses rental properly', () => {
    expect(parseArgsNoTarget({}), 'Missing rental arg is converted to null.')
        .toHaveProperty('rental', null);

    expect(parseArgsNoTarget({ rental: null }), 'Null rental arg is kept as null.')
        .toHaveProperty('rental', null);

    expect(parseArgsNoTarget({ rental: 1 }), 'Invalid rental arg type (number) is rejected.')
        .toBeNull();

    expect(parseArgsNoTarget({ rental: '#s.matr1x.r3dbox' }), 'Invalid rental arg type (string) is rejected.')
        .toBeNull();

    expect(parseArgsNoTarget({ rental: {} }), 'Invalid rental arg type (non-scriptor object) is rejected.')
        .toBeNull();

    expect(parseArgsNoTarget({ rental: { name: 123, call: 456 } }), 'Scriptor with invalid property types is rejected.')
        .toBeNull();

    expect(parseArgsNoTarget({ rental: exampleScriptor }), 'Valid rental scriptor is accepted.')
        .toHaveProperty('rental', exampleScriptor);

    expect(parseArgsNoTarget({ rental: semiValidScriptor }), 'Semi-valid rental scriptor is accepted.')
        .toHaveProperty('rental', semiValidScriptor);
});

test('parseArgs handles tiers', () => {
    expect(parseArgsNoTarget({}), 'Missing tiers argument results in only tier 1 solver tier instance.')
        .toHaveProperty('tiers', [ expect.any(T1SolverTier) ]);

    expect(parseArgsNoTarget({ tiers: 1 }), 'Invalid tier argument type is rejected.')
        .toBeNull();

    expect(parseArgsNoTarget({ tiers: [] }), 'Empty tiers array results is rejected.')
        .toBeNull();

    expect(parseArgsNoTarget({ tiers: [ 1 ] }), 'Invalid tier scriptor is rejected.')
        .toBeNull();

    expect(parseArgsNoTarget({ tiers: [ t1SolverScriptor ] }), 'T1 solver scriptor returns only T1 solver tier instance.')
        .toHaveProperty('tiers', [ expect.any(T1SolverTier) ]);

    expect(parseArgsNoTarget({ tiers: [ t2SolverScriptor ] }), 'T2 solver scriptor returns only T2 solver tier instance.')
        .toHaveProperty('tiers', [ expect.any(T2SolverTier) ]);

    expect(parseArgsNoTarget({ tiers: [ t1SolverScriptor, t2SolverScriptor ] }), 'Multiple scriptors return multiple tier instances.')
        .toHaveProperty('tiers', [ expect.any(T1SolverTier), expect.any(T2SolverTier) ]);

    expect(parseArgsNoTarget({ tiers: [ t1SolverScriptor, 2 ] }), 'Invalid tier scriptor among valid scriptors is rejected.')
        .toBeNull();
});

test('parseArgs handles logLevel', () => {
    expect(parseArgsNoTarget({}), 'Missing log level is parsed as INFO')
        .toHaveProperty('logLevel', LogLevel.INFO);

    expect(parseArgsNoTarget({ debug: true }), 'Debug flag results in DEBUG log level')
        .toHaveProperty('logLevel', LogLevel.DEBUG);

    expect(parseArgsNoTarget({ trace: true }), 'Trace flag results in TRACE log level')
        .toHaveProperty('logLevel', LogLevel.TRACE);

    expect(parseArgsNoTarget({ debug: true, trace: true }), 'Trace flag results in TRACE log level, even if debug is set')
        .toHaveProperty('logLevel', LogLevel.TRACE);

    expect(parseArgsNoTarget({ trace: true, debug: true }), 'Trace flag has precedence over debug flag')
        .toHaveProperty('logLevel', LogLevel.TRACE);

    expect(parseArgsNoTarget({ debug: false }), 'Setting debug to false results in INFO log level')
        .toHaveProperty('logLevel', LogLevel.INFO);

    expect(parseArgsNoTarget({ trace: false }), 'Setting trace to false results in INFO log level')
        .toHaveProperty('logLevel', LogLevel.INFO);

    expect(parseArgsNoTarget({ debug: 1 }), 'Truthy debug value results in DEBUG log level')
        .toHaveProperty('logLevel', LogLevel.DEBUG);

    expect(parseArgsNoTarget({ debug: 0 }), 'Falsy debug value results in INFO log level')
        .toHaveProperty('logLevel', LogLevel.INFO);

    expect(parseArgsNoTarget({ trace: 1 }), 'Truthy trace value results in TRACE log level')
        .toHaveProperty('logLevel', LogLevel.TRACE);

    expect(parseArgsNoTarget({ trace: 0 }), 'Falsy trace value results in INFO log level')
        .toHaveProperty('logLevel', LogLevel.INFO);
});

test('parseArgs handles profiler', () => {
    expect(parseArgsNoTarget({}), 'Missing profiler flag defaults to false')
        .toHaveProperty('profiler', false);

    expect(parseArgsNoTarget({ profiler: false }), 'Setting profiler to false results in no profiler')
        .toHaveProperty('profiler', false);

    expect(parseArgsNoTarget({ profiler: true }), 'Setting profiler to true results in profiler')
        .toHaveProperty('profiler', true);

    expect(parseArgsNoTarget({ profiler: 0 }), 'Setting profiler to a falsy value results in no profiler')
        .toHaveProperty('profiler', false);

    expect(parseArgsNoTarget({ profiler: 1 }), 'Setting profiler to a truthy value results in profiler')
        .toHaveProperty('profiler', true);
});

const objectWith = (property: string, value: any) => ({ [property]: value });

const testSimpleBooleanFlag = (propertyName: string) =>
    test(`parseArgs handles ${propertyName} flag`, () => {
        expect(parseArgsNoTarget({}), `Missing ${propertyName} flag defaults to false`)
            .toHaveProperty(propertyName, false);

        expect(parseArgsNoTarget(objectWith(propertyName, false)), `Setting ${propertyName} to false results in false`)
            .toHaveProperty(propertyName, false);

        expect(parseArgsNoTarget(objectWith(propertyName, true)), `Setting ${propertyName} to true results in true`)
            .toHaveProperty(propertyName, true);

        expect(parseArgsNoTarget(objectWith(propertyName, 0)), `Setting ${propertyName} to a falsy value results in false`)
            .toHaveProperty(propertyName, false);

        expect(parseArgsNoTarget(objectWith(propertyName, 1)), `Setting ${propertyName} to a truthy value results in true`)
            .toHaveProperty(propertyName, true);
    });

testSimpleBooleanFlag('profiler');
testSimpleBooleanFlag('reset');

test('parseArgs handles additional keys', () => {
    expect(parseArgsNoTarget({}), 'Missing keys parameter defaults to empty object')
        .toHaveProperty('suppliedKeys', {});

    expect(parseArgsNoTarget({ keys: null }), 'Null keys parameter defaults to empty object')
        .toHaveProperty('suppliedKeys', {});

    expect(parseArgsNoTarget({ keys: 1 }), 'Keys parameter with wrong type (number) is rejected')
        .toBeNull();

    expect(parseArgsNoTarget({ keys: 'abc' }), 'Keys parameter with wrong type (string) is rejected')
        .toBeNull();

    expect(parseArgsNoTarget({ keys: [1, 2, 3] }), 'Keys parameter with wrong type (array) is rejected')
        .toBeNull();

    expect(parseArgsNoTarget({ keys: {} }), 'Empty keys objects is accepted')
        .toHaveProperty('suppliedKeys', {});

    expect(parseArgsNoTarget({ keys: { acct_nt: 1234 } }), 'Keys objects is passed through')
        .toHaveProperty('suppliedKeys', { acct_nt: 1234 });

    const myFunction = () => 1;
    expect(parseArgsNoTarget({ keys: { acct_nt: myFunction } }), 'Keys objects is passed through, even with nonsensical types')
        .toHaveProperty('suppliedKeys', { acct_nt: myFunction });
});

test('parseArgs passes caller', () => {
    // The context will always contain the caller, unless there is a bug within Hackmud itself, so I think this
    // test is sufficient.
    expect(realParseArgs(context, utils, { target: exampleScriptor }), 'Caller from context is passed through')
        .toHaveProperty('caller', 'ada_lovelace');
});

test('parseArgs handles maxLargeTxDistance', () => {
    expect(parseArgsNoTarget({}), 'Default max distance should be 2')
        .toHaveProperty('maxLargeTxDistance', 2);

    expect(parseArgsNoTarget({ tx_dist: 5 }), 'Higher max distance is accepted.')
        .toHaveProperty('maxLargeTxDistance', 5);

    expect(parseArgsNoTarget({ tx_dist: 0 }), 'Max distance of 0 is accepted.')
        .toHaveProperty('maxLargeTxDistance', 0);

    expect(parseArgsNoTarget({ tx_dist: -1 }), 'Negative distance is rejected.')
        .toBeNull();

    expect(parseArgsNoTarget({ tx_dist: null }), 'Null results in the default')
        .toHaveProperty('maxLargeTxDistance', 2);

    expect(parseArgsNoTarget({ tx_dist: '2' }), 'Invalid argument type (string) is rejected.')
        .toBeNull();

    expect(parseArgsNoTarget({ tx_dist: { is: 2 } }), 'Invalid argument type (object) is rejected.')
        .toBeNull();
});
