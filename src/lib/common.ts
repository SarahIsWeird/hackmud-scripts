type RecordMapFn<K extends string, T, U> = (value: T, key: K, obj: Record<K, T>) => U;
export const mapValues =
    <K extends string, T, U>(obj: Record<K, T>, mapFn: RecordMapFn<K, T, U>): Record<K, U> => {
        const newObject: Record<K, U> = {} as Record<K, U>;
        for (const [ k, v ] of Object.entries(obj) as [K, T][]) {
            newObject[k] = mapFn(v, k, obj);
        }

        return newObject;
    };

type RecordFilterFn<K extends string, T> = (value: T, key: K, obj: Record<K, T>) => boolean;
export const filterValues =
    <K extends string, T>(obj: Record<K, T>, filterFn: RecordFilterFn<K, T>): Partial<Record<K, T>> => {
        const newObject: Partial<Record<K, T>> = {};
        for (const [ k, v ] of Object.entries(obj) as [K, T][]) {
            if (filterFn(v, k, obj)) newObject[k] = v;
        }

        return newObject;
    };

/**
 * Computes the 32 bit FNV-1 hash of an ASCII string. Not cryptographically secure.
 * @param str The string to hash
 * @returns number The FNV-1 hash of the string
 */
export const stringHash = (str: string): number => {
    const fnvPrime = 0x01000193n;
    const fourByteMask = 0xffffffffn;

    let hash = 0x811c9dc5n;
    for (const char of str.split('')) {
        hash = (hash * fnvPrime) & fourByteMask;
        hash ^= BigInt(char.charCodeAt(0));
    }

    // :(
    return parseInt(hash.toString());
};
