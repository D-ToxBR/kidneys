function readStringEnvVar(getEnvVarName: () => string): () => string {
    return () => {
        const envVarName = getEnvVarName();
        const value = process.env[envVarName];

        if (!value) throw `Unable to load environment variable ${envVarName}`;
        return value;
    };
}

export default {
    groups: {
        dtox: {
          agenda: '120363297038161469@g.us',
          // agenda: '558481691664-1572456295@g.us' // lista 2
        } 
    }
};

