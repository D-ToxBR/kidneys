import { describe, it, expect } from 'bun:test';

import { mapStringLeafs } from './generalMappers.ts';

// Sample mapper function
const sampleMapper = (key: string) => `Mapped: ${key}`;

describe('mapStringLeafs', () => {
    it('should map string leaf nodes in a simple nested object', () => {
        const input = {
            a: 'hello',
            b: {
                c: 'world',
                d: {
                    e: '!'
                }
            }
        };

        const expectedOutput = {
            a: () => 'Mapped: hello',
            b: () => ({
                c: () => 'Mapped: world',
                d: () => ({
                    e: () => 'Mapped: !'
                })
            })
        };

        const mappedObject = mapStringLeafs(sampleMapper)(input)();
        expect(mappedObject.a()).toEqual(expectedOutput.a());
        expect(mappedObject.b().c()).toEqual(expectedOutput.b().c());
        expect(mappedObject.b().d().e()).toEqual(expectedOutput.b().d().e());
    });

    it('should handle an empty object', () => {
        const input = {};
        const expectedOutput = {};

        const mappedObject = mapStringLeafs(sampleMapper)(input)();
        expect(mappedObject).toEqual(expectedOutput);
    });

    it('should handle non-string leaf nodes by leaving them as is', () => {
        const input = {
            a: 123,
            b: {
                c: true,
                d: {
                    e: null,
                    f: undefined
                }
            }
        };

        const expectedOutput = {
            a: () => 123,
            b: () => ({
                c: () => true,
                d: () => ({
                    e: () => null,
                    f: () => undefined
                })
            })
        };

        const mappedObject = mapStringLeafs(sampleMapper)(input)();
        expect(mappedObject.a()).toEqual(expectedOutput.a());
        expect(mappedObject.b().c()).toEqual(expectedOutput.b().c());
        expect(mappedObject.b().d().e()).toEqual(expectedOutput.b().d().e());
        expect(mappedObject.b().d().f()).toEqual(expectedOutput.b().d().f());
    });

    it('should handle nested arrays by leaving them as is', () => {
        const input = {
            a: ['string', 123, null],
            b: {
                c: 'hello'
            }
        };

        const expectedOutput = {
            a: () => ['string', 123, null],
            b: () => ({
                c: () => 'Mapped: hello'
            })
        };

        const mappedObject = mapStringLeafs(sampleMapper)(input)();
        expect(mappedObject.a()).toEqual(expectedOutput.a());
        expect(mappedObject.b().c()).toEqual(expectedOutput.b().c());
    });

    it('should handle deeply nested objects', () => {
        const input = {
            a: {
                b: {
                    c: {
                        d: {
                            e: 'deep'
                        }
                    }
                }
            }
        };

        const expectedOutput = {
            a: () => ({
                b: () => ({
                    c: () => ({
                        d: () => ({
                            e: () => 'Mapped: deep'
                        })
                    })
                })
            })
        };

        const mappedObject = mapStringLeafs(sampleMapper)(input)();
        expect(mappedObject.a().b().c().d().e()).toEqual(expectedOutput.a().b().c().d().e());
    });
});
