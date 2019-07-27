class OrderingQueue {
    constructor() {
        this.queue = [];
    }

    pop() {
        this.queue.pop();
    }

    pushBack(data) {
        this.queue.push(data);
    }

    push(databaseName, value) {
        this.queue.unshift({
            database: databaseName,
            sql: value
        });
    }
}

module.exports = OrderingQueue;

