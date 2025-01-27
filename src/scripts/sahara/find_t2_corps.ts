export default function (context: Context, args?: unknown) {
    const utils = $fs.sarahisweird.utils() as ReturnType<$sarahisweird$utils$>;
    const logger = utils.logger;

    const highsecSectors = [ 'FORM_LAMBDA_3' ];
    const midsecSectors = [ 'FORM_LAMBDA_6', 'KIN_THETA_7' ];

    const knownCorps = [
        'setec_gas', 'suborbital_airlines', 'weyland', 'tandoori',
        'bunnybat_hut', 'cyberdine', 'soylentbean', 'tyrell',
    ];

    const knownScripts = [
        'members_only', 'members', 'memberlogin', 'member_access',
    ];

    const corpScripts: string[] = [];
    const addCorpScripts = (scripts: string[]) => {
        for (const script of scripts) {
            const [ user, scriptName ] = script.split('.');
            if (knownCorps.includes(user)) {
                corpScripts.push(script);

                if (!knownScripts.includes(scriptName)) {
                    logger.warn(`Found new script name: ${scriptName} (${script})`);
                }
            } else if (knownScripts.includes(scriptName)) {
                logger.warn(`Found a possible new corp: ${user} (${script})`);
            }
        }
    };

    for (const sector of highsecSectors) {
        $ms.chats.join({ channel: sector });
        const scripts = $fs.scripts.highsec({ sector: sector }) as string[];
        $ms.chats.leave({ channel: sector });
        addCorpScripts(scripts);
    }

    for (const sector of midsecSectors) {
        $ms.chats.join({ channel: sector });
        const scripts = $fs.scripts.midsec({ sector: sector }) as string[];
        $ms.chats.leave({ channel: sector });
        addCorpScripts(scripts);
    }

    logger.info(`Found these corp scripts:\n${corpScripts.join('\n')}`);

    if (context.calling_script) {
        return corpScripts;
    }

    return { ok: true, msg: logger.getOutput() };
};
