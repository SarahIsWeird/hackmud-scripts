function(context, args)
{
// <words go here>
	const utils = #fs.sarahisweird.utils();
	const logger = utils.logger.getLogger('upload_dict');

	if (!args) return { ok: false, msg: 'Wrong usage!' }; // CBA

	if (args.quine) {
		return #fs.scripts.quine();
	}

	const wordLength = 7;

	let deletedEntries = 0;
	if (args.replace) {
		const { n } = #db.r({ type: 'dictionary', wordLength: wordLength })[0];
		deletedEntries = n;

		#db.i({
			type: 'dictionary',
			wordLength: wordLength,
			words: [],
		});
	}

	logger.info("wtf?")

	const wordsRaw = #fs.sarahisweird.upload_dict({ quine: true })
		.split('\n')[2].substring(3);
	
	const words = [];
	for (let i = 0; i < wordsRaw.length; i += wordLength) {
		words.push(wordsRaw.substring(i, i + wordLength));
	}

	const existingEntry = #db.f({
		type: 'dictionary',
		wordLength: wordLength,
	}).first();

	const newWordList = existingEntry.words.concat(words);
	#db.u1({
		type: 'dictionary', wordLength: wordLength
	}, {
		'$set': { words: newWordList },
	});

	// Sanity check: Read it back.
	const writtenWords = #db.f({ type: 'dictionary', wordLength: wordLength }).first();

	if (args && args.replace) {
		logger.info(`Deleted ${deletedEntries} old entries.`);
	}

	logger.info(`Wrote \`V${words.length}\` words. Entry now contains \`V${writtenWords.words.length}\` words.`);

	return logger.getOutput();
}
