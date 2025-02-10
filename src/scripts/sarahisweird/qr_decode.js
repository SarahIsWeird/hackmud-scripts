function(context, args) // { target: #s.cyberdine.memberlogin, user: "" }
{
    const lib = #fs.scripts.lib();
    const utils = #fs.sarahisweird.utils();

    const usage = { ok: false, msg: `Usage: ${context.this_script} { target: #s.0 }` };
    if (!args || !lib.is_obj(args)) {
        const corpScripts = #ms.sahara.find_t2_corps();
        return { ok: true, msg: `Scrape current corps with:\nsarahisweird.qr_decode { targets: [${corpScripts.map(s=>`#s.${s}`).join(',')}] }` };
    }

    const targets = args.targets ? args.targets : [args.target];
    if (!targets) return usage;

    if (args.reset) {
        #db.r({ type: 'qr_decode_data' });

        if (!targets[0]) return { ok: true, msg: 'State reset.' };
    }

    const prevData = #db.f({ type: 'qr_decode_data' }).first() || {};

    let highsecLocs = prevData.highsecLocs || [];
    let midsecLocs = prevData.midsecLocs || [];
    const keys = {};
    function setNav(navTarget) {
        for (const navKey of utils.navKeys) {
            keys[navKey] = navTarget;
        }
    }

    function getLocs(target) {
        const data = #fs.dtr.qr({ t: target, a: keys });

        setNav("cust_service");
        for (const order of data) {
            keys.order_id = order.id;

            const serviceResponse = target.call(keys);
            const locs = [...serviceResponse.matchAll(/\s(\w+\.\w+)\s/g)]
                .map(match => match[1])
                .filter(loc => loc != "NaN.NaN");

            for (const loc of locs) {
                if (!loc.trim().replaceAll('\n', '')) continue;

                const secLevel = #fs.scripts.get_level({ name: loc });
                if (secLevel == 3) {
                    highsecLocs.push(loc);
                } else if (secLevel == 2) {
                    midsecLocs.push(loc);
                }
            }
        }
    }

    let targetI = prevData.targetI || 0;
    let userI = prevData.i || 0;
    let shouldStop = false;
    for (const [i, target] of targets.entries()) {
        if (targetI > i) continue;
        targetI = i;

        if (shouldStop) break;
        userI = 0;

        setNav("order_qrs");

        let username = null;
        let isShifting = false;
        for (const [i, user] of utils.knownUsers.slice(userI).entries()) {
            if (Date.now() + 1000 > _END) {
                userI = i;
                break;
            }

            keys.username = user;
            const res = target.call(keys);
            if (lib.is_obj(res) && res.msg && res.msg.includes('Shift')) {
                isShifting = true;
                break;
            }
            if (res.includes("member") || res.includes("account")) {
                continue;
            }

            username = user;

            getLocs(target);
            getLocs(target);
            getLocs(target);
        }

        if (isShifting) continue;

        if (username == null) {
            return { ok: false, msg: "Couldn't find correct username!" };
        }
    }

    highsecLocs = lib.uniq(highsecLocs.sort());
    midsecLocs = lib.uniq(midsecLocs.sort());

    #db.us({ type: 'qr_decode_data' }, {
        $set: {
            highsecLocs: highsecLocs,
            midsecLocs: midsecLocs,
            targetI: targetI,
            userI: userI,
        },
    });

    const msg = `Found ${highsecLocs.length} HIGHSEC locs:\n${highsecLocs.join("\n")}
Found ${midsecLocs.length} MIDSEC locs:\n${midsecLocs.join("\n")}`;

    return { ok: true, msg };
}
