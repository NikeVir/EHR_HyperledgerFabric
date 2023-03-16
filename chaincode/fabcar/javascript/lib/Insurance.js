'use strict'

class InsuranceProvider{
    constructor(name, registrationId, userName, password, address, phone){
        if (this.validateRegistrationId(registrationId)) {
            this.name = name;
            this.userName = userName;
            this.password = password;
            this.address = address;
            this.registrationId = registrationId;
            this.phone = phone;
            this.type = 'Insurance';
            this.insureReq = [];
            this.insureApprove = [];
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
module.exports = InsuranceProvider;