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
                matchmakingTeams: "connect-link",
            },
            rankings: {
                cs2: "cs2-ranking",
            },
        },
        voice: {
            mix: {
                matchmakingPlayers: "Mix - Tirando Times",
            },
        }
    },
}

