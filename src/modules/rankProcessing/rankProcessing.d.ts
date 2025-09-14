import type {ToxicityLevel} from "../../../cfg/toxicityLevels.ts";


export interface Player {
    rank?: number
    nickname: string
    party?: number
    toxicity: AssignedToxicity
};

export interface RankTitles {
    [key: number]: string
};

export type ToxicityCfg = {
  possibleToxicityLevels: ToxicityLevel[],
  defaultAssignedToxicity: AssignedToxicity 
}

export interface AssignedToxicity {
  is: ToxicityLevel;
  playsWith: ToxicityLevel;
}

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
