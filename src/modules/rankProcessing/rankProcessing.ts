import combinations from 'combinations';
import type {IndexedTeamCombination, Player, RankTitles, TeamCombination} from "./rankProcessing";


const sort = {
    strings: {
        ascending: (a: string, b: string) => a.localeCompare(b),
    },
    numbers: {
        descending: (a: number, b: number) => b - a,
    }
};

export const createRankingModule = (rankTitles: RankTitles) => {
    const buildRanking = (nicknames: string[]): string[] => {
        const rankedMembers = nicknames
            .map(taggedNicknameToPlayer)
            .filter(member => member.rank != null && member.rank in rankTitles);

        const textLines = Object.keys(rankTitles)
            .map(key => parseInt(key))
            .sort(sort.numbers.descending)
            .flatMap(rank => getTextLinesForRank(rankedMembers, rank));

        return textLines;
    };

    const taggedNicknameToPlayer = (nickname: string): Player => {
        const match = nickname.match(/\[(\d+)\??\]/);
        const rank = match ? parseInt(match[1]) : undefined;

        const partyMatch = nickname.match(/\[P(\d+)\]/);
        const party = partyMatch ? parseInt(partyMatch[1]) : undefined;

        return {rank, nickname, party};
    };

    const playerToTaggedNickname = (player: Player) => {
        const partySuffix = player.party !== undefined && player !== null
            ? ` [P${player.party}]`
            : ""
        return `[${player.rank}] ${player.nickname}${partySuffix}`
    }

    const getTextLinesForRank = (allRankedPlayers: Player[], rank: number): string[] => {
        if (!(rank in rankTitles)) {
            throw new Error(`Invalid rank ${rank}`);
        }

        const nicknames = allRankedPlayers
            .filter(member => member.rank === rank)
            .map(member => member.nickname)
            .sort(sort.strings.ascending);

        if (!nicknames.length)
            return []
        return [
            '',
            `--[ **${rankTitles[rank]}** ]--`,
            ...nicknames,
        ];
    };

    const buildTeamsSuggestions = (players: () => Player[]): string[] => {
        const teamCombinations = getBestTeamCombinations(players);
        return formatTeamSuggestions(teamCombinations);
    };

    const getBestTeamCombinations = (getPlayers: () => Player[]): TeamCombination[] => {

        const players = getPlayers();
        const teamSize = players.length / 2

        const combinationsList = combinations(players, players.length / 2);

        const rawTeamCombinations: TeamCombination[] = combinationsList.map(teamA => {
            const teamB = players.filter(member => !teamA.includes(member));
            const teamARank = teamA.reduce((sum, member) => sum + (member.rank || 0), 0);
            const teamBRank = teamB.reduce((sum, member) => sum + (member.rank || 0), 0);
            const difference = Math.abs(teamARank - teamBRank);

            return {teamA, teamB, difference};
        });

        const bestDifference = Math.min(...rawTeamCombinations.map(tc => tc.difference));

        const teamCombinations = rawTeamCombinations
            .filter(tc => tc.difference === bestDifference)
            .filter(tc => tc.teamA.length == teamSize)
            .filter(tc => tc.teamB.length == teamSize)
            .filter(areAllPlayersFromTheSamePartyOnTheSameTeam);


        const indexedTeamCombinations = teamCombinations
            .map(indexTeams)

        return removeDuplicateTeamCombinations(indexedTeamCombinations)
    };


    const indexTeams = (tc: TeamCombination): IndexedTeamCombination => {
        const sortedNicks = (team: Player[]): string =>
            team
                .map(player => player.nickname)
                .sort()
                .join(',')


        return {
            indexes: {
                regular: `${sortedNicks(tc.teamA)} VS ${sortedNicks(tc.teamB)}`,
                flipped: `${sortedNicks(tc.teamB)} VS ${sortedNicks(tc.teamA)}`,
            },
            ...tc
        }
    }


    const removeDuplicateTeamCombinations = (tcs: IndexedTeamCombination[]) => {
        const calc = (tc: IndexedTeamCombination, toCheck: IndexedTeamCombination[], checked: IndexedTeamCombination[]): IndexedTeamCombination[] => {
            if (!toCheck.length)
                return checked

            const nextTc = toCheck[0]
            const nextToCheck = toCheck.slice(1)
            const nextChecked = toCheck.some(isDuplicatedSuggestion(tc))
                ? checked
                : [...checked, tc]

            return calc(nextTc, nextToCheck, nextChecked)
        }

        return tcs.length
            ? calc(tcs[0], tcs.slice(1), [])
            : []
    }


    const isDuplicatedSuggestion = (a: IndexedTeamCombination) => {
        return (b: IndexedTeamCombination): boolean => {
            return [a.indexes.regular, a.indexes.flipped].includes(b.indexes.regular)
        };
    };


    const areAllPlayersFromTheSamePartyOnTheSameTeam = (tc: TeamCombination): boolean => {

        const getParties = (team: Player[]): Set<number> => new Set(team
            .filter(player => player.party)
            .map(player => player.party))

        const [partiesOnA, partiesOnB] = [tc.teamA, tc.teamB]
            .map(getParties)
            .map(set => [...set])


        return !(
            partiesOnA.some(party => partiesOnB.includes(party))
            || partiesOnB.some(party => partiesOnA.includes(party))
        )
    }

    const formatTeamSuggestions = (teams: TeamCombination[]): string[] => {
        const calculateTeamRank = (team: Player[]) => team.reduce((sum, member) => sum + (member.rank || 0), 0);

        return ['Team Suggestions:']
            .concat(
                teams.flatMap((team, index) => {
                    const teamARank = calculateTeamRank(team.teamA);
                    const teamBRank = calculateTeamRank(team.teamB);
                    return [
                        `Option ${index + 1}:`,
                        `[${teamARank}] Team A                   [${teamBRank}] Team B`,
                        '',
                        ...formatTeamLines(team.teamA, team.teamB),
                        ''
                    ];
                })
            );
    };

    const formatTeamLines = (teamA: Player[], teamB: Player[]): string[] => {
        const maxLength = Math.max(teamA.length, teamB.length);
        const toNicknameOrEmptyString = (player?: Player) => player ? playerToTaggedNickname(player) : '';

        return Array.from({length: maxLength}, (_, i) => {
            const [nickA, nickB] = [teamA[i], teamB[i]].map(toNicknameOrEmptyString)
            return `${nickA.padEnd(30)}${nickB}`;
        });
    };

    return {
        buildRanking,
        taggedNicknameToPlayer,
        buildTeamsSuggestions,
    };
};



