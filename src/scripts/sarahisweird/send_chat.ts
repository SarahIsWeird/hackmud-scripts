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
        .replaceAll(/`[0-9a-zA-Z][^`]+`/g, (s) => `\`${s}\`${COLOR}`)
        .replaceAll(/\w+\.\w+/g, scriptName => `\`${scriptName}\`${COLOR}`)
        .replaceAll(/.*/g, (substring) => {
            return substring.split(':')
                .map(s => s == '' ? '' : `\`${COLOR}${s}\``)
                .join(':');
        })
        .replaceAll(/`([0-9a-zA-Z])([^:]):`/g, (_s, a, b) => `\`${a}${b}\`:`)
        .replaceAll(/`([0-9a-zA-Z]):([^:])`/g, (_s, a, b) => `:\`${a}${b}\``)
        .replaceAll(/`([0-9a-zA-Z])(:{0,2})`/g, (_s, _a, b) => b);

    if (channel) {
        $fs.chats.send({ channel: channel, msg: message });
    } else {
        $fs.chats.tell({ to: recipient as string, msg: message });
    }
};
