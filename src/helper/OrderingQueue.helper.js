class OrderingQueue {
    constructor() {
        this.queue = [];
    }

    pop() {
        if (this.queue.length > 0) return this.queue.pop();
        return null;
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

