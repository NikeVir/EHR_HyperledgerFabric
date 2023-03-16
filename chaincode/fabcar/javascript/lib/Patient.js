'use strict'
const crypto = require('crypto');
class Patient{

    constructor(patientId,firstName,lastName,mobNumber,email,DOB,gender,password){
        if(this.validuserId(patientId)){
            this.patientId = patientId;
            this.firstName = firstName;
            this.lastName = lastName;
            this.mobNumber = mobNumber;
            this.email = email;
            this.DOB = DOB;
            this.gender = gender;
            this.password = crypto.createHash('sha256').update(password).digest('hex');
            this.ehrs =[];
            this.accessRequest = [];
            this.accessGrant = [];
            this.appointments =[];
            this.bills =[];
        }
        else{
            throw new Error("the id is not valid");
        }
    }
    async validuserId(patientId){
        if(patientId){
            return true;
        }
        else{
            return false;
        }
    }
}
module.exports = Patient;