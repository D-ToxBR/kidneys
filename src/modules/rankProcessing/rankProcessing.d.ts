export interface Player {
    rank?: number
    nickname: string
    party?: number
};

export interface RankTitles {
    [key: number]: string
};

export interface TeamCombination {
    teamA: Player[]
    teamB: Player[]
    difference: number
}

export interface IndexedTeamCombination extends TeamCombination {
    indexes: {
        regular: string
        flipped: string
    }
}
