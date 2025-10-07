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
            lobbies: {
                ok: {
                  l01: "1403619257169875006",
                  l02: "1403619874714030182",
                },
                friendly: {
                  l03: "1403620201571946507",
                },
                warning: {
                  l04: "1403620395818553354",
                },
                toxic: {
                  l05: "1403620545031045141",
                }
            },
            mix: {
                matchmakingPlayers: "1412478610002018406", // Mix - Tirando Times
            },
        }
    },
}

