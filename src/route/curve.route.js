let router = require('express').Router();
let CurveStatus = require('./../CurveStatusUpdater/curve-status.model').model;
let jsonResponse = require('./json-response');


router.post('/get-status', (req, res)=>{
    CurveStatus.find({user: req.body.username}, (err, results)=>{
        if (err) {
            res.json(jsonResponse(false, err.message, {}));
        } else {
            if (results) {
                res.json(jsonResponse(true, "successfully", results));
            } else {
                res.json(jsonResponse(true, "no curve status found", []));
            }
        }
    });
});

module.exports = router;