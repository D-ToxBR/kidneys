import { describe, it, expect } from 'bun:test';
import { createLineupModule } from './lineupProcessing';


const lineupPrefix = "dtox."

describe('Lineup Module', () => {
    const mod = createLineupModule(lineupPrefix);

    it('isLineup: should tell if a string has the prefix that indicates it is a lineup', () => {
        expect(mod.isLineup("bctox.2")).toBeFalse()
        expect(mod.isLineup("dtox.")).toBeFalse()
        expect(mod.isLineup("dtox.SM")).toBeTrue()
        expect(mod.isLineup("DTOX.jc")).toBeTrue()
        expect(mod.isLineup("dToX.jc")).toBeTrue()
        expect(mod.isLineup("dToX.JC (João Câmara)")).toBeTrue()
    })

    it('getFormattedLineups: should return empty message when no lineups', () => {
        const formatter = mod.getFormattedLineups({});
        const result = formatter();
        expect(result).toEqual(['No lineups found.']);
    })

    it('getFormattedLineups: should format a single lineup with players', () => {
        const lineups = {
            'dtox.A': ['Alice', 'Bob', 'Charlie']
        };
        const formatter = mod.getFormattedLineups(lineups);
        const result = formatter();
        const expected = [
            '# Lineups',
            '',
            '',
            '- **dtox.A**',
            'Alice',
            'Bob',
            'Charlie',
            ''
        ];
        expect(result).toEqual(expected);
    })

    it('getFormattedLineups: should format multiple lineups with players', () => {
        const lineups = {
            'dtox.B': ['David', 'Eve'],
            'dtox.A': ['Alice', 'Bob'],
            'dtox.C': ['Frank']
        };
        const formatter = mod.getFormattedLineups(lineups);
        const result = formatter();
        const expected = [
            '# Lineups',
            '',
            '',
            '- **dtox.A**',
            'Alice',
            'Bob',
            '',
            '- **dtox.B**',
            'David',
            'Eve',
            '',
            '- **dtox.C**',
            'Frank',
            ''
        ];
        expect(result).toEqual(expected);
    })

    it('getFormattedLineups: should handle lineup with no players', () => {
        const lineups = {
            'dtox.A': ['Alice'],
            'dtox.B': [],
            'dtox.C': ['Charlie']
        };
        const formatter = mod.getFormattedLineups(lineups);
        const result = formatter();
        const expected = [
            '# Lineups',
            '',
            '',
            '- **dtox.A**',
            'Alice',
            '',
            '- **dtox.B**',
            '  (no players)',
            '',
            '- **dtox.C**',
            'Charlie',
            ''
        ];
        expect(result).toEqual(expected);
    })

    it('getFormattedLineups: should sort lineups and players alphabetically', () => {
        const lineups = {
            'dtox.Z': ['Zoe', 'Alice'],
            'dtox.A': ['Charlie', 'Bob']
        };
        const formatter = mod.getFormattedLineups(lineups);
        const result = formatter();
        const expected = [
            '# Lineups',
            '',
            '',
            '- **dtox.A**',
            'Bob',
            'Charlie',
            '',
            '- **dtox.Z**',
            'Alice',
            'Zoe',
            ''
        ];
        expect(result).toEqual(expected);
    })

    it('getFormattedLineups: should handle lineup names with parentheses', () => {
        const lineups = {
            'dtox.A (Team Alpha)': ['Alice', 'Bob']
        };
        const formatter = mod.getFormattedLineups(lineups);
        const result = formatter();
        const expected = [
            '# Lineups',
            '',
            '',
            '- **dtox.A** (Team Alpha)',
            'Alice',
            'Bob',
            ''
        ];
        expect(result).toEqual(expected);
    })
})

