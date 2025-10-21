import type {LineupsMap} from './lineupProcessing'

const sort = {
    strings: {
        ascending: (a: string, b: string) => a.localeCompare(b),
    }, numbers: { descending: (a: number, b: number) => b - a,
    }
};

export const createLineupModule = (lineupPrefix: string) => {

    const isLineup = (s: string): boolean => {

        const lowerS = s.toLowerCase()
        const lowerLineupPrefix = lineupPrefix.toLowerCase()

        const result = lowerS !== lowerLineupPrefix && lowerS.startsWith(lowerLineupPrefix)

        const logMsg = result
            ? `${s} starts with ${lineupPrefix}, so it is a Lineup`
            : `${s} DO NOT start with ${lineupPrefix}, so it is NOT a Lineup`

        return result
    }

    const areLineupsEqual = (map1: LineupsMap, map2: LineupsMap): boolean => {

      if (!map1 || !map2){
        return false;
      }

      const areArraysEqual = (arr1: string[], arr2: string[]): boolean =>
        arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);

      const keys1 = Object.keys(map1);
      const keys2 = Object.keys(map2);

      if (keys1.length !== keys2.length) {
        return false;
      }

      return keys1.every(key =>
        map2.hasOwnProperty(key) && areArraysEqual(map1[key], map2[key])
      );
    }

   const getFormattedLineups = (lineups: LineupsMap, title: string = "# Lineups", noPlayersMsg: string = "") => {
        return (): string[] => {

          const allPlayers: string[] = Object.values(lineups)
          const lineupNames = Object.keys(lineups).sort(sort.strings.ascending);
          const hasNoPlayers = (!lineups 
            || lineupNames.length === 0
            || allPlayers.every(l => l.length === 0))


          if (hasNoPlayers){
            return [noPlayersMsg];
          }
          
          const lines: string[] = [title, '', '']
          
          lineupNames.forEach((lineupName) => {
            const players = lineups[lineupName].sort(sort.strings.ascending);
            if (players.length === 0)
              return

            lines.push(`- ${makeBoldUntilParenthesis(lineupName)}`);
            lines.push(...players);
            lines.push('');
          });

          return lines
        }
    }

    const makeBoldUntilParenthesis = (text: string): string => {
      const parenIndex = text.indexOf('(')
      const hasParenthesis = parenIndex !== -1
      
      if (hasParenthesis) {
        const beforeParen = text.substring(0, parenIndex).trim()
        const afterParen = text.substring(parenIndex)
        return `**${beforeParen}** ${afterParen}`
      } else {
        return `**${text.trim()}**`
      }
    }


    return {
        isLineup,
        getFormattedLineups,
        areLineupsEqual
    };
};

