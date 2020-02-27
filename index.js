const debug = require('debug')('keyvault');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

const defaults = {

}

function config(options) {
    // setup options
    let options = Object.assign({}, defaults, options);

    return new Promise(async (resovle, reject) => {
        const {keyVaultName} = options;
        if (!keyVaultName || keyVaultName.length === 0) {
            debug('No Key Vault name found, aborting.');
            return reject('No key vault configured. Set options.keyVaultName.');
        }

        const credentials = new DefaultAzureCredential();
        const url = `https://${keyVaultName}.vault.azure.net`;
        const client = new SecretClient(url, credentials);

        for await (let page of client.listPropertiesOfSecrets().byPage()) {
            for await (let secretProperties of page) {
                const {name} = secretProperties;
                debug('Adding secret "%s"', name);
                const secret = await client.getSecret(name);
                const {value}=secret;
                process.env[name] = value;
            }
        }
        debug("Key Vault secrets added.");
    });
}

module.exports.config = config;
