import { T1SolverTier } from '/lib/hecking/tiers/tier1';

export default function (_context: Context, _args?: unknown) {
    return [ new T1SolverTier() ];
}
