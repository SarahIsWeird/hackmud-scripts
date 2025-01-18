function(context, args)
{
	const msg = "Take a sip of `3water` and `5look away` from the screen for a bit! `D<3`";
	return #fs.chats.send({ channel: "0000", msg: msg });
}
