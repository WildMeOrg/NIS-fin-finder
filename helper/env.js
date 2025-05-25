function requireEnv(varName) {
    if (!process.env[varName]) {
        throw new Error(`Missing required env variable: ${varName}`);
    }
    return process.env[varName];
}

module.exports = { requireEnv };
