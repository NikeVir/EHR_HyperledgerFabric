'use strict'


class EHR{
    constructor(ehrId,patientId,doctorId,record, time){
        this.ehrId = ehrId;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.record = record;
        this.time = time;
        this.type = "EHR"
        if (this.__isContract) {
            delete this.__isContract;
        }
        return this;
        
    }

}
module.exports = EHR;
