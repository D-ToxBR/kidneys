function readStringEnvVar(getEnvVarName: () => string): () => string {
    return () => {
        const envVarName =  getEnvVarName()
        const value = process.env[envVarName]

        if (!value) throw `Unable to load enviroment variable ${envVarName}`
        return value
    }
}


export default {
    token: readStringEnvVar(() => 'DISCORD_TOKEN'),
    guildId: readStringEnvVar(() => 'DISCORD_GUILD_ID'),

    channels: {
        text: {
            mix: {
                matchmakingTeams: "1222320514585067622", // connect-link
            },
            rankings: {
                cs2: "1238582671106379797", // cs2-ranking
            },
            lineups: {
              cs2: "1424898593600438393",  // cs2-lineups
            }
        },
        voice: {
            mix: {
                matchmakingPlayers: "1412478610002018406", // Mix - Tirando Times
            },
        }
    },
}

