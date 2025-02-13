import { Utils } from '/src/scripts/sarahisweird/utils';

export default function (_context: Context, _args?: unknown) {
    const utils = $fs.sarahisweird.utils() as Utils;
    const logger = utils.logger.getLogger("upload_data_check");

    const answers = {
        // Tier 1
        "\"did you know\" is a communication pattern common to user ++++++": "fran_lee",
        "a ++++++ is a household cleaning device with a rudimentary networked sentience": "robovac",
        "communications issued by user ++++++ demonstrate structural patterns associated with humor": "sans_comedy",
        "pet, pest, plague and meme are accurate descriptors of the ++++++": "bunnybat",
        "safety depends on the use of scripts.++++++": "get_level",
        "service ++++++ provides atmospheric updates via the port epoch environment": "weathernet",
        "user 'on_th3_1ntern3ts' has ++++++ many things": "heard",
        "user ++++++ provides instruction via script": "teach",
        "user ++++++ uses the port epoch environment to request gc": "outta_juice",
        "users gather in channel CAFE to share ++++++": "poetry",

        // Tier 2
        "a person called anja has lost her ++++++": "blazer",
        "according to skimmerite pattern-seekers, the calibration initiative indicates that humans are ++++++": "dead",
        "according to the calibration initiative, humans are expected to be ++++++ by the content": "engaged",
        "according to the suborbital bulletin, flight ++++++ is en route to ho chi minh": "a2231",
        "archaic labs specialises in user-++++++ design": "obsessive",
        "conditions are clear above ++++++ and the city is within operational radius": "atlanta",
        "data does not contain truth is the first part of an idiom spread by the ++++++ assembly": "skimmerite",
        "drones from ++++++ may be instructed to perform their task with excessive urgency": "goodfellow",
        "item_id py6874 contains a grand ++++++": "piano",
        "robovac_++++++, moreso than most of its kind, has a tendency to become stuck": "idp1p1",
        "robovac_idk3w2 is stuck in a ++++++": "well",
        "sheriff nub holds sway over the town of ol' ++++++": "nubloopstone",
        "sheriff nub's first name is ++++++": "sheriff",
        "the ascent of ++++++ does not concern itself with usefulness": "nowhere",
        "the fourth hidden theme is ++++++": "executives",
        "the listed components of the breakfast galleon are inside, outside, and ++++++": "crowsnest",
        "this council of 'revolutionary' robovac-patterns call themselves the ++++++": "thirteen",
        "trust has a diagnostic system. a functioning version can be found at erajbhandari.++++++": "diagalpha",
        "user ++++++ would leave no stars for the sqrz 480 if they could": "bnnyhunter",
        "user le_mon_squeezy's new s:o ref is ++++++": "unvarnishedpygmyumbrella",

        // Tier 3
        "between ++++++ and killing is living": "making",
        "che, the ++++++": "teacher",
        "eve, the ++++++": "monitor",
        "HO is an acronym where H stands for ++++++": "heuristic",
        "packbot-patterns cannot perceive ++++++": "lime",
        "petra, the ++++++": "prover",
        "risk functions as the ++++++ agent": "disarray",
        "the ++++++ system is used to denote degrees of sentience": "mark",
        "the axiomatic cycles of risk are ++++++, void, chaos": "choice",
        "the axiomatic values of trust are ++++++, kin, form": "data",
        "trust functions as the ++++++ process": "index",
        "trust's first word was ++++++": "moonstone",
        "user ++++++ manages ComCODE's interactions with artificial intelligences": "fbreton",
        "user erajbhandari is a member of the ++++++ team": "ai",
        "user erajbhandari sought out mallory to learn ++++++": "binmat",
        "where angie has a blueprint, mallory has a ++++++": "starchart",

        /* Obsolete vLAN questions. These only exist because of outdated locksims :D */
        "according to trust, ++++++ is more than just following directives": "sentience",
        "in trust's vLAN, you became one of angie's ++++++": "angels",
        "in trust's vLAN, you became one of mallory's ++++++": "minions",
        "in trust's vLAN, you discovered that mallory and che are ++++++": "sisters",
        "in trust's vLAN, you encountered the will of ++++++, the prover": "petra",
        "in trust's vLAN, you visited faythe's ++++++": "fountain",
        "in trust's vLAN, you were required to hack halperyon.++++++": "helpdesk",
        "this fact checking process is a function of ++++++, the monitor": "eve",
        "trust's vLAN emphasized the importance of the transfer and capture of ++++++": "resource",
        "trust's vLAN presented a version of angie who had lost a friend called ++++++": "bo",
    };

	const dbSafeAnswers = Object.fromEntries(
		Object.entries(answers)
			.map(([q, a]) => [q.replaceAll('.', ''), a])
	)

	const existingEntry = $db.f({ name: 'data_check_answers' }).first();
	if (existingEntry !== null) {
		$db.r({ name: 'data_check_answers' });
		logger.info('Deleted old answer key(s).');
	}

	$db.i({
		name: 'data_check_answers',
		answers: dbSafeAnswers,
	});

	logger.info('Inserted answer key.');

	return { ok: true, msg: logger.getOutput() };
}
