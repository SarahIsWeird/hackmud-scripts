const { readFileSync, writeFileSync, mkdirSync, existsSync } = require('fs');
const { join } = require('path');

const dictionaryPath = join(__dirname, '..', 'english-words', 'words_alpha.txt');
const dictionaryFile = readFileSync(dictionaryPath).toString();

const words = dictionaryFile.split("\r\n");

const minWordSize = 4;
const maxWordSize = 8;

const dictionary = {};
for (const word of words) {
    const length = word.length;
    if (length < minWordSize) continue;
    if (length > maxWordSize) continue;
    if (!dictionary[length]) dictionary[length] = [];

    dictionary[length].push(word);
}

if (!existsSync(join(__dirname, '..', 'dict'))) {
    mkdirSync(join(__dirname, '..', 'dict'));
}

for (const [wordLength, v] of Object.entries(dictionary)) {
    console.log(`${wordLength.toString().padStart(2)}: ${v.length} words`);

    const wordCount = v.length;

    if (!existsSync(join(__dirname, '..', 'dict', wordLength))) {
        mkdirSync(join(__dirname, '..', 'dict', wordLength));
    }

    const sizeLimit = 32768;
    const wordsFittingInSizeLimit = Math.floor(sizeLimit / wordLength);
    const filesNeeded = Math.ceil(wordCount / wordsFittingInSizeLimit);

    for (let i = 0; i < filesNeeded; i++) {
        const slice = v.slice(i * wordsFittingInSizeLimit, (i + 1) * wordsFittingInSizeLimit);

        const path = join(__dirname, '..', 'dict', wordLength, `${i}.txt`);
        writeFileSync(path, slice.join(""));
        console.log(`\tWrote ${path}.`);
    }
}
