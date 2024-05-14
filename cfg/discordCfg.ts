function readStringEnvVar(envVarName: string): string {
    const value = process.env[envVarName]
    if (!value) throw `Unable to load enviroment variable ${envVarName}`
    return value
}


export default {
    token: readStringEnvVar('DISCORD_TOKEN'),

    channels: {
        rankings: {
            cs2: readStringEnvVar('DISCORD_CHANNEL_NAME_CS2_RANKING'),
        },
    },
}

