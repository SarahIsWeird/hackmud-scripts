# Sarah's {hackmud} collection

This is my collection of scripts for the game [{hackmud}](https://hackmud.com).
Feel free to use anything in this repo, but be warned, I didn't put a lot of
thought into anything here, so the code quality is abysmal!

Everything in [sarahisweird](/src/scripts/sarahisweird/) is stuff I
currently use.

[experiments](/src/scripts/sarahisweird/experiments/) just contains some test
scripts that aren't things I intend to use. Sometimes I just wanna try out some
stuff, like having fun with WASM.

[utils.js](/src/scripts/sarahisweird/utils.js) contains a random assortment of
things I think (or thought) might be reusable.

[sahara](/src/scripts/sahara/) contains scripts uploaded to my other user.

[node_scripts](/node_scripts/) contains preprocessing scripts intended to be run
with Node.js. No packages or anything, just `node <filename.js>`.

## Logging

A very simple, very hacky logging solution. Uses `#G`, so it can be used from
all scripts simultaneously.

```js
const u = #fs.sarahisweird.utils();
const logger = u.logger;

logger.info("This is an info log.");
logger.warn("This is a warning log.");
logger.error("This is an error log.");

const childLogger1 = logger.getLogger("Child 1");
const childLogger2 = logger.getLogger("Child 2");
const nestedChildLogger = childLogger1.getLogger("Nested child");

childLogger1.info("This is an info log from a child logger.");
childLogger2.warn("This is a warning log from a child logger.");
nestedChildLogger.error("This is an error from a nested child logger.");

childLogger1.getOutput({ logLevel: "warn" });
// => No output returned.

childLogger2.getOutput({ omitLevels: true });
// => [Child 2] This is a warning log from a child logger.

nestedChildLogger.getOutput({ omitNames: true });
// => [ERROR] This is an error from a nested child logger.

return { ok: true, msg: logger.getOutput() };
// => Prints everything :D
```

## License

My hackmud scripts use the
[Hackmud Scripting Environment](https://github.com/samualtnorman/hackmud-environment),
which uses the MIT license. In other words: do what you want, as long as you
provide the copyright notice, and don't yell at them if your stuff breaks. For
the full license text, check [LICENSE_HSE](/LICENSE_HSE).

This repo is licensed under MIT-0. In other words: do what you want, but don't
yell at me if your stuff breaks :) For the full license text, check
[LICENSE](/LICENSE). If you find this helpful in any way, do let me know
anyways!
