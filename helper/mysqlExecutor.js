const mysql2 = require('mysql2/promise');

class MySqlExecutor {
    constructor(mySqlConfig, queue) {
        this.connection = {};
        this.mySqlConfig = mySqlConfig;
        this.queue = queue;
        //run cleaner
        setInterval(()=>{
            // if (this.connection) {
            //     if ((Date.now() - this.connection.time) > 5 * 60 * 1000) {
            //         this.connection.mySqlConnection.end();
            //         this.connection = null;
            //     }
            // }
            let arrKey = Object.keys(this.connection);
            let n = arrKey.length;
            for (let i = 0; i < n; i++) {
                let database = arrKey[i];
                if (this.connection[database]) {
                    if ((Date.now() - this.connection[database].time) > 5 * 60 * 1000) {
                        this.connection[database].mySqlConnection.end();
                        this.connection[database] = null;
                    }
                }
            }
        }, 5*60*1000);
    }

    getConnection(database) {
        return new Promise(async (resolve,reject)=>{
            if (this.connection[database]) {
                this.connection[database].time = Date.now();
                resolve(this.connection[database].mySqlConnection);
            } else {
                let tryToReconnection = async () => {
                    try {
                        this.connection[database] = {};
                        this.connection[database].time = Date.now();
                        let mySqlConfig = {
                            host: this.mySqlConfig.host,
                            port: this.mySqlConfig.port,
                            user: this.mySqlConfig.user,
                            password: this.mySqlConfig.password,
                            database: database
                        };
                        this.connection[database].mySqlConnection = await mysql2.createConnection(mySqlConfig);
                        resolve(this.connection[database].mySqlConnection);
                    } catch(e) {
                        setTimeout(tryToReconnection, 15*1000);
                    }
                };
                setTimeout(tryToReconnection, 0);
            }
        });
    }

    async deleteConnection(database) {
        console.log('delete connection...');
        this.connection[database].mySqlConnection.end();
        this.connection[database] = null;
    }

    execute(value) {
        let database = value.database;
        let sql = value.sql;
        return new Promise(async (resolve, reject) => {
            try {
                let connection = await this.getConnection(database);
                await connection.execute(sql);
                resolve(null);
            } catch (e) {
                reject(e);
            }
        });
    }

    run() {
        let retry = 0;
        let handleRun = async () => {
            let sqlData = this.queue.pop();
            if (sqlData !== null) {
                try {
                    await this.execute(sqlData);
                    retry = 0;
                    setTimeout(handleRun, 0);
                } catch (e) {
                    if (e.message.toString() === "Can't add new command when connection is in closed state") {
                        this.queue.pushBack(sqlData);
                        await this.deleteConnection(sqlData.database);
                    } else {
                        retry++;
                        if (retry > 3) {
                            retry = 0;
                        } else {
                            this.queue.pushBack(sqlData);
                        }
                    }
                    setTimeout(handleRun, 200);
                }
            } else {
                setTimeout(handleRun, 100);
            }
        };
        setTimeout(handleRun, 0);
    }
}

module.exports = MySqlExecutor;