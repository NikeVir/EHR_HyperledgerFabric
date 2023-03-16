'use strict';

class Hospital {

    /**
     *
     * @param name
     * @param registrationId
     * @param userName
     * @param password
     * @param address
     * @param phone
     * @returns {Hospital}
     */
    constructor(name, registrationId, userName, password, address, phone) {

        if (this.validateRegistrationId(registrationId)) {
            this.name = name;
            this.userName = userName;
            this.password = password;
            this.address = address;
            this.registrationId = registrationId;
            this.phone = phone;
            this.type = 'Hospital';
            this.appointments = [];
            this.patients = [];
            this.doctors = [];
            if (this.__isContract) {
                delete this.__isContract;
            }
            return this;
        } else {
            throw new Error(`this registrationid ${registrationId} is not valid`);
        }
    }

    validateRegistrationId(registrationId) {
        return !!registrationId;
    }
}

module.exports = Hospital;
