export default function (context: Context, args?: any) {
    if (!args || typeof(args) !== 'object' || (!args.to && !args.c) || !args.msg) {
        return {
            ok: false,
            msg: `Usage: ${context.this_script} { \`Nto\`\`0/\`\`Nc\`: \`V"user/channel"\`, msg: "message" }`
        };
    }

    const COLOR = 'W';

    const channel: string | undefined = args.c;
    const recipient: string | undefined = args.to;
    const rawMessage: string = args.msg;

    const message = rawMessage
        // Handle custom colored text
        .replaceAll(/`[0-9a-zA-Z][^`]+`/g, (s) => `\`${s}\`${COLOR}`)
        // Handle script names
        .replaceAll(/[a-zA-Z_]\w+\.[a-zA-Z_]\w+/g, scriptName => `\`${scriptName}\`${COLOR}`)
        // Don't color :
        .replaceAll(/.*/g, (substring) => {
            return substring.split(':')
                .map(s => s == '' ? '' : `\`${COLOR}${s}\``)
                .join(':');
        })
        // Remove coloring from `Ca:`
        .replaceAll(/`([0-9a-zA-Z])([^:]):`/g, (_s, a, b) => `\`${a}${b}\`:`)
        // Remove coloring from `C:a`
        .replaceAll(/`([0-9a-zA-Z]):([^:])`/g, (_s, a, b) => `:\`${a}${b}\``)
        // Remove coloring from `C`, `C:` and `C::`
        .replaceAll(/`([0-9a-zA-Z])(:{0,2})`/g, (_s, _a, b) => b)
        // Add back coloring if there are two chars before :
        .replaceAll(/([^`]{2})`:`([0-9a-zA-Z])/g, (_s, a, b) => `${a}:\`\`${b}`)
        // Add back coloring if there are two chars after :
        .replaceAll(/`:`([0-9a-zA-Z])([^`]{2})/g, (_s, a, b) => `\`\`${a}:${b}`);

    if (channel) {
        $fs.chats.send({ channel: channel, msg: message });
    } else {
        $fs.chats.tell({ to: recipient as string, msg: message });
    }
};
