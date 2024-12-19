/**
 * Based on https://www.npmjs.com/package/is-number, but modified as a
 * type-guard.
 *
 * @param num
 * @returns
 */
export const isNumber = (num: unknown): num is number => {
    if (typeof num === "number") {
        return num - num === 0;
    } else if (typeof num === "string" && num.trim() !== "") {
        return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
    } else {
        return false;
    }
};
