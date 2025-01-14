function(context, args) // t: #s.skimmerite.public
{
    const lib = #fs.scripts.lib();

    const upgrades = #hs.sys.upgrades({
        full: true,
        filter: {
            loaded: false,
            rarity: { '$lte': 1 },
            name: { '$nin': ['k3y_v1', 'k3y_v2'] },
        },
    });
    const upgradesToCull = upgrades
        .reverse(); // Do culling in reverse orders so ids stay valid!

    function stringComparator(a, b) {
        if (a < b) return -1;
        if (b < a) return 1;
        return 0;
    }

    const displayList = upgradesToCull.slice().sort((a, b) => stringComparator(a.name, b.name));
    const upgradeCounts = {};

    for (const upgrade of displayList) {
        if (!upgradeCounts[upgrade.name]) upgradeCounts[upgrade.name] = {};
        const existingInfo = upgradeCounts[upgrade.name][upgrade.rarity];
        if (existingInfo) {
            existingInfo.count++;
            existingInfo.ids.push(upgrade.i);
            continue;
        }

        const marketResults = #fs.market.browse({ name: upgrade.name });
        const allMarketMatches = marketResults.length;
        const exactMarketMatches = marketResults.filter(mUp => mUp.rarity == upgrade.rarity).length;

        upgradeCounts[upgrade.name][upgrade.rarity] = {
            type: upgrade.type,
            count: 1,
            allMarket: allMarketMatches,
            exactMarket: exactMarketMatches,
            ids: [upgrade.i],
        };
    }

    let counts = '`Mme`/`Ithis`/`F all`\n';
    let types = 'upgrade type \n';
    let names = 'upgrade name'.padEnd(25) + '\n';
    let ids = 'upgrade ids\n';
    for (const [name, rarities] of Object.entries(upgradeCounts)) {
        for (const [rarity, info] of Object.entries(rarities)) {
            counts += '`M' + lib.rjust(info.count, 2) + '`/`I' + lib.rjust(info.exactMarket, 4) + '`/`F' + lib.rjust(info.allMarket, 4) + '`\n';
            const typePadding = '`q' + '.'.repeat(13 - info.type.length) + '`';
            types += info.type + typePadding + '\n';
            names += `\`${rarity}${name.padEnd(25)}\`\n`;
            ids += info.ids.map(id => id.toString().padStart(2, '0')).join(', ') + '\n';
        }
    }

    const listView = lib.side_by_side(counts, lib.side_by_side(types, lib.side_by_side(names, ids)));

    #D(listView);

    if (args && args.confirm) {
        for (const upgrade of upgradesToCull) {
            #ls.sys.cull({ i: upgrade.i, confirm: true });
        }
    }

    const msg = ((args && args.confirm) ? 'Culled' : 'Would have culled') + ` ${upgradesToCull.length} noob- and kiddie-tier modules.`;

    #D(msg);
    return { ok: true };
}
