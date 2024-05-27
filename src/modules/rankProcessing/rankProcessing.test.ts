import { describe, it, expect } from 'bun:test';
import { createRankingModule, RankTitles, Player } from './rankProcessing';

const rankTitles: RankTitles = {
    1: 'Bronze',
    2: 'Silver',
    3: 'Gold',
    4: 'Platinum',
    5: 'Diamond',
};

describe('Ranking Module', () => {
    const { buildRanking, extractNicknameTags, buildTeamsSuggestions } = createRankingModule(rankTitles);

    it('should extract nickname tags correctly', () => {
        const nickname = '[3] PlayerOne [P1]';
        const expected = { rank: 3, nickname: '[3] PlayerOne [P1]', party: 1 };
        const result = extractNicknameTags(nickname);
        expect(result).toEqual(expected);
    });

    it('should return undefined for rank and party if tags are not present', () => {
        const nickname = 'PlayerTwo';
        const expected = { rank: undefined, nickname: 'PlayerTwo', party: undefined };
        const result = extractNicknameTags(nickname);
        expect(result).toEqual(expected);
    });

    it('should build ranking correctly', () => {
        const nicknames = ['[3] PlayerOne', '[1] PlayerTwo', '[2] PlayerThree'];
        const expected = [
            "",
            '--[ **Gold** ]--',
            '[3] PlayerOne',
            "",
            '--[ **Silver** ]--',
            '[2] PlayerThree',
            "",
            '--[ **Bronze** ]--',
            '[1] PlayerTwo',
        ];
        const result = buildRanking(nicknames);
        expect(result).toEqual(expected);
    });

    it('should ignore players without valid rank tags in buildRanking', () => {
        const nicknames = ['[3] PlayerOne', 'PlayerTwo', '[2] PlayerThree'];
        const expected = [
            '',
            '--[ **Gold** ]--',
            '[3] PlayerOne',
            '',
            '--[ **Silver** ]--',
            '[2] PlayerThree',
        ];
        const result = buildRanking(nicknames);
        expect(result).toEqual(expected);
    });

    it('should build team suggestions correctly', () => {
        const players: Player[] = [
            {
               nickname: "brenosoft",
                rank: 7,
                party: undefined
            },
            {
                nickname: "spd",
                rank: 7,
                party: undefined
            },
            {
                nickname: "mib",
                rank: 7,
                party: undefined
            },
            {
                nickname: "oRN",
                rank: 6,
                party: undefined
            },
            {
                nickname: "sauru",
                rank: 5,
                party: undefined
            },
            {
                nickname: "plinyo",
                rank: 4,
                party: undefined
            },
            {
                nickname: "coin",
                rank: 2,
                party: 1
            },
            {
                nickname: "NextageKL",
                rank: 2,
                party: 1
            },
            {
                nickname: "amigo",
                rank: 1,
                party: 2,
            },
            {
                nickname: "do amigo",
                rank: 1,
                party: 2,
            },

        ];

        const expected = [
                "Team Suggestions:",
                "Option 1:",
                "[21] Team A                   [21] Team B",
                "",
                "[7] spd                       [7] brenosoft",
                "[7] mib                       [6] oRN",
                "[5] sauru                     [4] plinyo",
                "[1] amigo [P2]                [2] coin [P1]",
                "[1] do amigo [P2]             [2] NextageKL [P1]",
                "",
                "Option 2:",
                "[21] Team A                   [21] Team B",
                "",
                "[7] spd                       [7] brenosoft",
                "[6] oRN                       [7] mib",
                "[4] plinyo                    [5] sauru",
                "[2] coin [P1]                 [1] amigo [P2]",
                "[2] NextageKL [P1]            [1] do amigo [P2]",
                "",
        ]

        const result = buildTeamsSuggestions(() => players);
        expect(result).toEqual(expected);
    });


});
