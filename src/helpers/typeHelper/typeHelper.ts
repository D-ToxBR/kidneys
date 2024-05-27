export const getOrThrow = (value: any, errMsg?: string) => {
    if (value === undefined || value === null) {
        const finalErrorMsg = errMsg
            ? errMsg
            : "expected a value but it was not defined";
        throw new Error(finalErrorMsg);
    }
    return value;
}
