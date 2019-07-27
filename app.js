let OrderingQueue = require('./helper/OrderingQueue.helper');
let orderQueue = new OrderingQueue();
let MqttListener = require('./helper/MqttListener');

let config = require('config');
new MqttListener(orderQueue, config.get("mqtt"), {clean: false, clientId: "BACK_END_UPDATE_LISTENER", rejectUnauthorized: false});

let mySqlConfig = require("config").get("mysql.cloud");

let MySqlExecutor = require("./helper/mysqlExecutor");

let mysqlExe = new MySqlExecutor(mySqlConfig, orderQueue);

mysqlExe.run();