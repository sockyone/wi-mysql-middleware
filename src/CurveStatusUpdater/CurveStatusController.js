let CurveStatus = require('./curve-status.model').model;

class CurveStatusController {
    constructor() {
        this.queue = [];
        this.runUpdateEventIntoDatabase();
    }

    pushDeleteEvent(mess) {
        mess.eventType = 'delete';
        this.queue.unshift(mess);
    }

    pushUpdateEvent(mess) {
        mess.eventType = 'update';
        this.queue.unshift(mess);
    }

    runCheckUpdate() {
        // let self = this;
        // let handleRun = async function() {
            
        // };
        // setTimeout(handleRun,60*1000);
    }

    runUpdateEventIntoDatabase() {
        let self = this;
        let handleRun = async function() {
            if (self.queue.length > 0) {
                let data = self.queue.pop();
                await self.tryToImportToDb(data);
                setTimeout(handleRun, 0);
            } else {
                setTimeout(handleRun,50);
            }
        };
        setTimeout(handleRun,0);
    }

    tryToImportToDb(mess) {
        return new Promise((resolve, reject)=>{
            if (mess.event.toString() === 'delete') {
                //try to delete
                CurveStatus.findOneAndDelete({path: mess.path}, (err)=>{
                    if (err) {
                        reject(err);
                    } else {
                        resolve(null);
                    }
                });
            } else {
                CurveStatus.findOne({path: mess.path}, (err, rs)=>{
                    if (err) {
                        reject(err);
                    } else {
                        if (rs) {
                            rs.updatedAt = mess.updatedAt;
                            rs.save((err)=>{
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(null);
                                }
                            });
                        } else {
                            let newCurvePath = new CurveStatus({
                                path: mess.path,
                                user: mess.user,
                                updatedAt: new Date("1970")
                            });
                            newCurvePath.save(err=>{
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(null);
                                }
                            });
                        }
                    }
                });
            }
        });
    }
}


let controller = new CurveStatusController();

module.exports = controller;