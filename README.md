# Sarah's {hackmud} collection

This is my collection of scripts for the game [{hackmud}](https://hackmud.com).
Feel free to use anything in this repo, but be warned, I didn't put a lot of
thought into anything here, so the code quality is abysmal!

Everything in the root folder is stuff I actually use(d).

[experiments](/experiments/) just contains some test scripts that aren't things I intend to
use. Sometimes I just wanna try out some stuff, like having fun with WASM.

[utils.js](/utils.js) contains a random assortment of things I think (or thought) might be
reusable. It also contains all `DATA_CHECK` answers I know of, so spoilers be
ahead!

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

This repo is licensed under MIT-0. In other words: do what you want, but don't
yell at me if your stuff breaks :) For the full license text, check
[LICENSE](/LICENSE).

If you find this helpful in any way, do let me know anyways!
