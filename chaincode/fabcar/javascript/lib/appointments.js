'use strict';

class Appointment {

    constructor(appointmentId,doctorId,patientId, description, time) {
        this.doctorId = doctorId;
        this.patientId = patientId;
        this.appointmentId = appointmentId;
        this.description = description;
        this.time = time;
        this.type = 'Appointment';
        if (this.__isContract) {
            delete this.__isContract;
        }
        return this;
    }
}

module.exports = Appointment;
