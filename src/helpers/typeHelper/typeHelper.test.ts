import { describe, it, expect } from 'bun:test';
import { getOrThrow } from './typeHelper.ts';

const defaultErrMsg = 'expected a value but it was not defined';

describe('getOrThrow', () => {
    const defaultErrMsg = 'expected a value but it was not defined';

    it('should return the value if it is defined', () => {
        const value = 42;
        expect(getOrThrow(value)).toBe(42);
    });

    it('should throw an error with a custom message if the value is undefined', () => {
        const customErrMsg = 'custom error message';
        expect(() => getOrThrow(undefined, customErrMsg)).toThrow(customErrMsg);
    });

    it('should throw an error with a custom message if the value is null', () => {
        const customErrMsg = 'custom error message';
        expect(() => getOrThrow(null, customErrMsg)).toThrow(customErrMsg);
    });

    it('should throw an error with the default message if the value is undefined and no custom message is provided', () => {
        expect(() => getOrThrow(undefined)).toThrow(defaultErrMsg);
    });

    it('should throw an error with the default message if the value is null and no custom message is provided', () => {
        expect(() => getOrThrow(null)).toThrow(defaultErrMsg);
    });

    it('should return the value if it is a non-null object', () => {
        const value = { key: 'value' };
        expect(getOrThrow(value)).toBe(value);
    });

    it('should return the value if it is a boolean', () => {
        expect(getOrThrow(true)).toBe(true);
        expect(getOrThrow(false)).toBe(false);
    });

    it('should return the value if it is a string', () => {
        const value = 'test string';
        expect(getOrThrow(value)).toBe(value);
    });

    it('should return the value if it is a number', () => {
        const value = 12345;
        expect(getOrThrow(value)).toBe(value);
    });
});