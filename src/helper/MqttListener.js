const mqtt = require('mqtt');
let prefix = process.env.DATABASE_PREFIX_CLOUD || require('config').mysql.cloud.prefix;

class MqttListener {
    constructor(output, url, options) {
        this.url = url;
        this.options = options;
        this.output = output;
        this.channel = "syncUp/#";
        this.client = mqtt.connect(url, options);
        this.assign();
        this.timeStamp = 0;
    }

    reconnect() {
        if ((Date.now() - this.timeStamp) > 15*1000) {
            this.timeStamp = Date.now();
            this.client.end(true);
            console.log('Try to init new connection');
            this.client = mqtt.connect(this.url, this.options);
            this.assign();
        }
    }

    assign() {
        this.client.on('connect', ()=>{
            console.log('Connected to:', this.url);
        });
        this.client.on('disconnect', ()=>{
            console.log('Disconnect to:', this.url);
        });
        this.client.on('close', ()=>{
            console.log('Closed to:', this.url);
        });
        this.client.on('offline', ()=>{
            console.log('Offline to:', this.url);
        });
        this.client.on('error', (e)=>{
            if (e.message.toString() === "Connection refused: Identifier rejected") {
                this.reconnect();
            } else {
                console.log('Mqtt connection error:', e.message);
            }
        });
        this.client.subscribe(this.channel, {qos:2});
        this.client.on('message', (topic, payload)=>{
            let databaseName = topic.slice(7);
            databaseName = prefix + databaseName;
            // console.log(JSON.parse(payload.toString()).data);
            this.output.push(databaseName , JSON.parse(payload.toString()).data);
        });
    }
}

module.exports = MqttListener;