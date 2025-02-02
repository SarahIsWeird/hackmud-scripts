import { TryAllState, TryAllSolver } from '/lib/hecking/common';
import { Logger, Utils } from '/scripts/sarahisweird/utils';
import { HeckingArgs } from '/lib/hecking/args';

const keys: string[] = [];

export class L0cketSolver extends TryAllSolver {
    constructor(_args: HeckingArgs, _utils: Utils, _logger: Logger, state?: TryAllState) {
        super('l0cket', keys, 'security k3y', state);
    }
}
