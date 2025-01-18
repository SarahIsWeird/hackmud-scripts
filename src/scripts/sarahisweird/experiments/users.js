function(context, args)
{
    const users = #ms.chats.users({ channel: args.input });
    if (users.ok == false) {
        return { ok: false, msg: "Couldn't get users! Have you joined that channel?" };
    }

    const count = users.length;
    const active = users.filter(u => u.includes("*")).length;
    return { ok: true, msg: `Users: ${count}, ${active} active` };
}
