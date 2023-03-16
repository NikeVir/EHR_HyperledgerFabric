'use strict';

class Bill {

    constructor(billId, patientId, details,time, amount, record) {
        this.amount = amount;
        this.record = record;
        this.patientId = patientId;
        this.details = details;
        this.time = time;
        this.type = 'Bill';
        this.billId = billId;
        return this;
    }
}

module.exports = Bill;