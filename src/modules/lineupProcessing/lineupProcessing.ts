import type {LineupsMap} from './lineupProcessing'

const sort = {
    strings: {
        ascending: (a: string, b: string) => a.localeCompare(b),
    },
    numbers: {
        descending: (a: number, b: number) => b - a,
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

    const getFormattedLineups = (lineups: LineupsMap) => {
        return (): string[] => {

          if (!lineups || !Object.keys(lineups)){
            return []
          }
          
          const lineupNames = Object.keys(lineups).sort(sort.strings.ascending);
          
          if (lineupNames.length === 0) {
              return ['No lineups found.'];
          }

          const lines: string[] = ['Lineups:', ''];
          
          lineupNames.forEach((lineupName) => {
              const players = lineups[lineupName].sort(sort.strings.ascending);
              lines.push(`${lineupName}:`);
              
              if (players.length === 0) {
                  lines.push('  (no players)');
              } else {
                  players.forEach((player: string) => {
                      lines.push(`  - ${player}`);
                  });
              }
              
              lines.push('');
          });
          return lines
        }
    }

    return {
        isLineup,
        getFormattedLineups,
    };
};

