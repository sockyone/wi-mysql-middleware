(async function () {
    let mongoUrl = "mongodb://";

    let config = require("config");

    mongoUrl = process.env.mongoUrl || mongoUrl + config.get("mongo.host") + ":" + config.get("mongo.port") + "/" + config.get("mongo.db");

    const mongoose = require('mongoose');
    //connect mongo
    try {
        await mongoose.connect(mongoUrl, { useNewUrlParser: true });
    } catch (err) {
        console.log('Mongo database out of reach');
        return;
    }

    let OrderingQueue = require('./src/helper/OrderingQueue.helper');
    let orderQueue = new OrderingQueue();
    let MqttListener = require('./src/helper/MqttListener');
    let curveStatusController = require('./src/CurveStatusUpdater/CurveStatusController');
    let CurveMqttListener = require('./src/helper/CurveMqttListener');

    let config = require('config');
    new MqttListener(orderQueue, config.get("mqtt"), { clean: false, clientId: "BACK_END_UPDATE_LISTENER", rejectUnauthorized: false });
    new CurveMqttListener(curveStatusController, config.get("mqtt"), { clean: false, clientId: "BACK_END_UPDATE_LISTENER_FOR_CURVE", rejectUnauthorized: false });


    let mySqlConfig = require("config").get("mysql.cloud");

    let MySqlExecutor = require("./src/helper/mysqlExecutor");

    let mysqlExe = new MySqlExecutor(mySqlConfig, orderQueue);

    mysqlExe.run();

    const express = require('express');
    const app = express();
    const bodyParser = require('body-parser');
    const cors = require('cors');

    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.use('/curve', require('./src/route/curve.route'));

    let port = process.env.PORT || config.get("port") || 3029;

    app.listen(port, ()=>{
        console.log('App start listen on port', port);
    });
    
})();


