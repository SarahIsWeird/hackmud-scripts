import { Logger, Utils } from "/scripts/sarahisweird/utils";
import { LockKeys } from "./common";
import { LogLevel } from '/lib/logging';
import { SolverTier } from '/lib/hecking/solvers';

export type HeckingArgs = {
    target: Scriptor,
    tiers: SolverTier<any>[],
    rental: Scriptor | null,
    logLevel: LogLevel,
    profiler: boolean,
    reset: boolean,
    suppliedKeys: LockKeys,
    caller: string,
    maxLargeTxDistance: number,
}

export const parseArgs = (context: Context, utils: Utils, logger: Logger, args: any): HeckingArgs | null => {
    if (!args || typeof args !== 'object') return null;
    if (!utils.isScriptor(args.target)) return null;
    if (args.rental && !utils.isScriptor(args.rental)) return null;
    if (args.keys && typeof(args.keys) !== 'object') return null;

    const defaultTierScriptors = [{
        name: 'sarahisweird.t1_solvers',
        call: () => $fs.sarahisweird.t1_solvers()
    }];

    const argsObject: Omit<HeckingArgs, 'tiers'> = {
        target: args.target,
        rental: args.rental || null,
        logLevel: args.trace ? LogLevel.TRACE : (args.debug ? LogLevel.DEBUG : LogLevel.INFO),
        profiler: !!args.profiler,
        reset: !!args.reset,
        suppliedKeys: args.keys,
        caller: context.caller,
        maxLargeTxDistance: args.tx_dist || 2,
    };

    const tierScriptors = args.tiers || defaultTierScriptors;
    if (tierScriptors.find((value: any) => !utils.isScriptor(value))) return null;
    const tiers = tierScriptors.map((scriptor: Scriptor) => scriptor.call({}));

    return {
        ...argsObject,
        tiers: tiers,
    };
};

const usageMsg =
`Usage: sarahisweird.hecking { \`Ntarget\`: #s.some.loc\`c, [args]\` }
Available arguments:
  \`Ntarget\`: \`Vscriptor\`   | The \`Lloc\` to unlock
   \`Ntiers\`: \`Vscriptor[]\` | A list of solver tier scriptors.
                         - \`SDefault\`: \`V[\`#s.sarahisweird.t1_solvers\`V]\`
                         - Available scriptors:
                             #s.sarahisweird.t1_solvers (\`2FULLSEC\`)
                             #s.sarahisweird.t2_solvers (\`FMIDSEC\`)
  \`Nrental\`: \`Vscriptor\`   | A \`Lloc\` targeting a rental service. (default: \`Vnone\`)
                         - Currently supported: matr1x.r3dbox
   \`Ndebug\`: \`Vboolean\`    | Enable debug logging (default: \`Vfalse\`)
   \`Ntrace\`: \`Vboolean\`    | Enable trace logging (default: \`Vfalse\`)
                         - Overrides \`Ndebug\`.
                         - Warning: \`Dincredibly\` spammy!
\`Nprofiler\`: \`Vboolean\`    | Enable profiling (default: \`Vfalse\`)
                         - Extended profiling available via \`Ntrace\`.
    \`Nkeys\`: \`Vobject\`     | Additional arguments (default: \`V{}\`)
                         - Passed to the \`Ntarget\` when unlocking.
                         - If lock solutions are present, they are used
                           instead of a solution from an unlock function!
                           Caveat: saved solutions have precedence over provided keys.
   \`Nreset\`: \`Vboolean\`    | Reset database entry for this loc.
 \`Ntx_dist\`: \`Vnumber\`     | \`Nacct_nt\` specific:
                         - The maximum offset of large transactions. (default: \`V3\`)
                         - Only used for '\`AGet me the amount of a large deposit\`'-style prompts.
                         - Mainly used for testing purposes, but can be increased if the solver
                           doesn't find a correct answer.
`;

export const usage = { ok: false, msg: usageMsg };
