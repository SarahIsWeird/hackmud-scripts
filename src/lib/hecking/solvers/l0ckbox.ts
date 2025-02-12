import { Solution, Solver, SolvingError } from '/lib/hecking/common';
import { Logger, Utils } from '/scripts/sarahisweird/utils';
import { HeckingArgs } from '/lib/hecking/args';
import { authorizedUsers } from '/lib/common';

type L0ckboxState = { key?: string, rentedKey: boolean };

export class L0ckboxSolver implements Solver<L0ckboxState> {
    private readonly logger: Logger;
    private readonly rentalService: Scriptor | null;
    private readonly caller: string;

    private key?: string;
    private ownKeyIndex?: number;
    private didRentKey: boolean;

    constructor(args: HeckingArgs, _utils: Utils, rootLogger: Logger, state?: L0ckboxState) {
        this.logger = rootLogger.getLogger('`Fl0ckbox`');
        this.rentalService = args.rental;
        this.caller = args.caller;

        this.key = state?.key;
        this.didRentKey = state?.rentedKey || false;
    }

    canSolve(prompt: string): boolean {
        if (prompt.includes('l0ckbox')) return true;
        return prompt.includes('appropriate k3y');
    }

    getInitialSolutions(): Solution {
        return {};
    }

    getSolution(prompt: string): Solution {
        const parts = prompt.split(' ');
        this.key = parts[parts.length - 1];

        if (this.loadOwnedKey()) return {};
        if (this.getFromSparkasse()) return {};

        if (this.rentalService) {
            if (this.rentKey()) return {};
            throw new SolvingError();
        }

        this.logger.error(`You don't have the required k3y \`0${this.key}\`!`);
        this.logger.error(`If you want to rent it automatically, pass \`Nrental\`: #s.matr1x.r3dbox.`)
        throw new SolvingError();
    }

    getState(): L0ckboxState {
        if (this.ownKeyIndex !== undefined) {
            $ms.sys.manage({ unload: this.ownKeyIndex });
            this.logger.info(`Unloaded k3y \`0${this.key}\` at upgrade index \`V${this.ownKeyIndex}\``);
        }

        return { key: this.key, rentedKey: this.didRentKey };
    }

    private loadOwnedKey(): boolean {
        const ownedKeys = $hs.sys.upgrades({
            full: true,
            filter: {
                // @ts-ignore
                name: { $in: ['k3y_v1', 'k3y_v2'] },
                k3y: this.key,
            },
        }) as unknown as Upgrade[];

        if (ownedKeys.length === 0) return false;

        const upgrade = ownedKeys[0];
        const result = $ms.sys.manage({ load: upgrade.i });
        if (!result.ok) {
            this.logger.error('Failed to load upgrade!')
            this.logger.error(result.msg || 'No reason provided.');
            return false;
        }

        this.logger.info(`Loaded k3y \`0${this.key}\` at upgrade index \`V${upgrade.i}\`.`);
        this.ownKeyIndex = upgrade.i;
        return true;
    }

    private getFromSparkasse(): boolean {
        if (!authorizedUsers.includes(this.caller)) return false;
        if (!this.key) return false;

        const allKeys = $ms.sahara.sparkasse({ list_keys: true });
        if (!Array.isArray(allKeys)) return false;
        if (!allKeys.includes(this.key)) return false;

        const response = $ms.sahara.sparkasse({ k3y: this.key });
        if (!response || typeof(response) !== 'object') return false;
        if (!(response as ScriptResponse).ok) return false;

        const keyIndex = ($hs.sys.upgrades() as any[]).length - 1;
        $ms.sys.manage({ load: keyIndex });
        return true;
    }

    private rentKey(): boolean {
        if (!this.rentalService) return false;

        this.logger.info(`Requesting \`0${this.key}\` from ${this.rentalService.name}...`);
        const response = this.rentalService.call({ request: this.key }) as ScriptResponse<{ msg: string }>;
        if (!response.ok) {
            if (response.msg?.includes('not in stock')) {
                this.logger.error(`${this.rentalService.name} doesn't have the required key!`);
            } else {
                this.logger.error(`An unknown error occurred when calling the rental service:\n${response.msg}`);
            }

            return false;
        }

        const keyIndex = ($hs.sys.upgrades() as any[]).length - 1;
        $ms.sys.manage({ load: keyIndex });

        this.logger.info(`Loaded rental k3y \`0${this.key}\` at upgrade index \`V${keyIndex}\`.`);
        this.logger.info(`Don't forget to return it with ${this.rentalService.name} { return: true }!`)
        return true;
    }
}
