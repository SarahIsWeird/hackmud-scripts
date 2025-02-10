import { T2SolverTier } from '/lib/hecking/tiers/tier2';
import { T1SolverTier } from '/lib/hecking/tiers/tier1';

export default function (_context: Context, _args?: unknown) {
    const t1Solvers = $fs.sarahisweird.t1_solvers() as T1SolverTier[];
    return [ ...t1Solvers, new T2SolverTier() ];
}
