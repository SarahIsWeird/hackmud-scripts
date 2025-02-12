export default (context: Context, args?: unknown) => {
    const ownedKeys = $ms.sahara.sparkasse({ list_keys: true });

    if (!Array.isArray(ownedKeys)) {
        return ownedKeys;
    }

    const rawCallerKeys = $ms.sys.upgrades({
        full: true,
        filter: {
            name: { $in: ['k3y_v1', 'k3y_v2'] },
        } as unknown as Partial<{ name: string }>, // :(
    });

    if (!Array.isArray(rawCallerKeys)) {
        return { ok: false, msg: 'Couldn\'t get keys of caller!' };
    }

    type BruhUpgrade = Record<string, any>;
    const callerKeys = rawCallerKeys
        .reduce((arr, upgrade) => {
            if (arr.findIndex(up => up.k3y == upgrade.k3y) === -1) {
                arr.push(upgrade);
            }

            return arr;
        }, [] as BruhUpgrade[])
        .sort((a, b) => b.i - a.i);

    let foo = '';
    for (const upgrade of callerKeys) {
        if (ownedKeys.includes(upgrade.k3y)) continue;

        $ms.sys.manage({ unload: upgrade.i });
        $ls.sys.xfer_upgrade_to({ i: upgrade.i, to: 'sahara', memo: 'thanks <3' });
    }

    return foo;
};
