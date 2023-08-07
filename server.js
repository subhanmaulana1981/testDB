const mysql = require('mysql2');
const {Client} = require('ssh2');
const sshClient = new Client();

const dbServer = {
    host: '127.0.0.1',
    port: 3306,
    user: 'cdc_subhan',
    password: 'SubhanMDev2023!@#',
    database: 'krida_dev'
}

const tunnelConfig = {
    host: '175.184.233.30',
    port: 2200,
    username: 'cdc_subhan',
    password: 'SubhanMDev2023!@#'
}

const forwardConfig = {
    srcHost: '127.0.0.1',
    srcPort: 3306,
    dstHost: dbServer.host,
    dstPort: dbServer.port
};

const SSHConnection = new Promise((resolve, reject) => {
    sshClient.on('ready', () => {
        sshClient.forwardOut(
            forwardConfig.srcHost,
            forwardConfig.srcPort,
            forwardConfig.dstHost,
            forwardConfig.dstPort,
            (err, stream) => {
                if (err) reject(err);

                console.log('Connected to the SSH server.');
                const updatedDbServer = {
                    ...dbServer,
                    stream
                };

                const connection = mysql.createConnection(updatedDbServer);
                connection.connect((error) => {
                    if (error) {
                        reject(error);
                    }
                    console.log('Connected to the MySQL server.');
                    connection.query("SELECT * FROM branches LIMIT 1;", function (err, result, fields) {
                        if (err) throw err;
                        console.log(result);
                    });
                    resolve(connection);
                });
            });
    }).connect(tunnelConfig);
});