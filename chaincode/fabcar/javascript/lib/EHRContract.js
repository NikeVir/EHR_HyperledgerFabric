/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';
const crypto = require('crypto')
const { Contract } = require('fabric-contract-api');
const path = require('path');
const fd = require('fs');

const EHR = require('./Ehr');
const Doctor = require('./Doctor');
const Insurance = require('./Insurance');
const Patient = require('./Patient.js');
const Appointment = require('./appointments');
const Hospital = require('./Hospital');
const Bill = require('./Bill')


class EHRContract extends Contract {

   async initLedger(ctx) {
      console.log('============= START : Initialize Ledger ===========');

      //create a patient
      let patient1 = {};
      patient1.firstName = 'first1';
      patient1.lastName = 'last1';
      patient1.patientId = '1234';
      patient1.DOB = '20/02/1998';
      patient1.gender = 'Male';
      patient1.bloodtype = 'AB+';
      patient1.email = 'pariharrahul2002';
      patient1.height = '12345';
      patient1.weight = '60kg';
      patient1.password = '12345';
      patient1.phone = '12345';

      let newPatient = await new Patient(patient1.patientId, patient1.firstName, patient1.lastName, patient1.phone, patient1.email, patient1.DOB, patient1.gender, patient1.password);
      await ctx.stub.putState(patient1.patientId, Buffer.from(JSON.stringify(newPatient)));
      console.log(newPatient);

      let hospital = {};
      hospital.name = 'name';
      hospital.userName = 'userName';
      hospital.password = 'password';
      hospital.address = 'address';
      hospital.registrationId = 'registrationId';
      hospital.phone = '1234';
      let newHospital = await new Hospital(hospital.name, hospital.registrationId, hospital.userName, hospital.password, hospital.address, hospital.phone);
      await ctx.stub.putState(newHospital.registrationId, Buffer.from(JSON.stringify(newHospital)));
      console.log(newHospital);

      let doctor = {};
      doctor.firstName = 'firstName';
      doctor.lastName = 'lastName';
      doctor.address = 'address';
      doctor.aadhaar = 'aadhaar';
      doctor.medicalRegistrationNo = 'medicalRegistrationNo';
      doctor.DOB = 'DOB';
      doctor.gender = 'gender';
      doctor.userName = 'userName';
      doctor.password = 'password';
      doctor.type = 'Doctor';
      doctor.hospitalId = 'registrationId';
      doctor.specialisation = 'gynec';
      doctor.phone = '1234';
      let newDoctor = await new Doctor(doctor.firstName, doctor.lastName, doctor.address, doctor.aadhaar, doctor.medicalRegistrationNo, doctor.DOB, doctor.gender, doctor.userName, doctor.password, doctor.specialisation, doctor.phone);
      await ctx.stub.putState(newDoctor.medicalRegistrationNo, Buffer.from(JSON.stringify(newDoctor)));
      console.log(newDoctor);


      let appointment = {};
      appointment.userName = 'userName';
      appointment.patientId = 'pariharrahul2002';
      appointment.description = 'description';
      appointment.time = 'time';
      appointment.appointmentId = 'appointmentId';
      let newAppointment = await new Appointment(appointment.appointmentId, appointment.userName, appointment.patientId, appointment.description, appointment.time);
      await ctx.stub.putState(newAppointment.appointmentId, Buffer.from(JSON.stringify(newAppointment)));
      console.log(newAppointment);


      let ehr = {};
      ehr.patientId = patient1.userName;
      ehr.doctorId = doctor.medicalRegistrationNo;
      ehr.appointmentId = 'appointmentId';
      ehr.record = 'Everything is fine';
      ehr.time = 'time';
      ehr.ehrId = 'ehrId';
      let newEHR = await new EHR(ehr.ehrId, ehr.patientId, ehr.doctorId,ehr.record, ehr.time);
      await ctx.stub.putState(newEHR.ehrId, Buffer.from(JSON.stringify(newEHR)));
      console.log(newEHR);

      // let patientAsBytes = await ctx.stub.getState(patient1.patientId);
      // let patient = JSON.parse(patientAsBytes);
      // let appointments = patient.appointments;
      // let index = appointments.indexOf(appointment.appointmentId);
      // if (index > -1) {
      //    appointments.splice(index, 1);
      //    patient.appointments = appointments;
      // }
      // let ehrs = patient.ehrs;
      // ehrs.push(newEHR.ehrId);
      // patient.ehrs = ehrs;
      // await ctx.stub.putState(patient.patientId, Buffer.from(JSON.stringify(patient)));


      //create a insurer
      let insurer = {};
      insurer.name = 'nameInsurer';
      insurer.userName = 'userNameInsurer';
      insurer.password = 'passwordInsurer';
      insurer.address = 'addressInsurer';
      insurer.registrationId = 'registrationIdInsurer';
      insurer.phone = '1234';
      let newInsurer = await new Insurance(insurer.name, insurer.registrationId, insurer.userName, insurer.password, insurer.address, insurer.phone);
      await ctx.stub.putState(newInsurer.registrationId, Buffer.from(JSON.stringify(newInsurer)));
      console.log(newInsurer);


      let bill = {};
      bill.amount = 'amount';
      bill.record = 'record';
      bill.patientId = patient1.userName;
      bill.doctorId = doctor.medicalRegistrationNo;
      bill.details = "FALANA DHIMAKA"
      bill.time = 'time';
      bill.billId = 'billId';
      let newBill = await new Bill(bill.billId,  bill.patientId,bill.details, bill.time, bill.amount, bill.record);
      await ctx.stub.putState(newBill.billId, Buffer.from(JSON.stringify(newBill)));
      console.log(newBill);

      return "success"
   }






   async RegisterUser(ctx, args) {
      args = JSON.parse(args);
      let patientExists = await this.assetExists(ctx, args.patientId);
      if (!patientExists) {
         if (args.password === null || args.password === '') {
            throw new Error(`Empty or null values should not be passed for password parameter`);
         }
         let newPatient = await new Patient(args.patientId, args.firstName, args.lastName, args.mobno, args.email, args.DOB, args.gender, args.password);
         const exists = await this.assetExists(ctx, newPatient.patientId);
         if (exists) {
            throw new Error(`The patient ${newPatient.patientId} already exists`);
         }
         const buffer1 = Buffer.from(JSON.stringify(newPatient));
         await ctx.stub.putState(newPatient.patientId, buffer1);
        
         let response = `Patient with username ${args.userName} is updated in the world state`;
         return response;
      }
      else {
         throw new Error(`Patient with username ${args.userName} already exists`);
      }
   }





   async CreateEhr(ctx, args) {
      args = JSON.parse(args);
      let patientExists = await this.assetExists(ctx, args.patientId);
      let doctorExists = await this.assetExists(ctx, args.doctorId);
      let appointmentExists = await this.assetExists(ctx, args.appointmentId);
      if (doctorExists && patientExists && appointmentExists) {

         //create a new EHR and update it in the world state
         let newEHR = await new EHR(args.ehrId, args.patientId, args.doctorId, args.record, args.time);
         await ctx.stub.putState(newEHR.ehrId, Buffer.from(JSON.stringify(newEHR)));

         //update the EHR in the list of the ehrs for the patient and remove the appointment from the patient global state
         let patientAsBytes = await ctx.stub.getState(args.patientId);
         let patient = JSON.parse(patientAsBytes);
         let appointments = patient.appointments;
         let index = appointments.indexOf(args.appointmentId);
         if (index > -1) {
            appointments.splice(index, 1);
            patient.appointments = appointments;
         }
         let ehrs = patient.ehrs;
         ehrs.push(newEHR.ehrId);
         patient.ehrs = ehrs;
         await ctx.stub.putState(patient.patientId, Buffer.from(JSON.stringify(patient)));

         //update the doctor with tha appointments and make the patient marked Attended
         let doctorAsBytes = await ctx.stub.getState(args.doctorId);
         let doctor = JSON.parse(doctorAsBytes);
         appointments = doctor.appointments;
         index = appointments.indexOf(args.appointmentId);
         if (index > -1) {
            appointments.splice(index, 1);
            patient.appointments = appointments;
         }

         let patientsAttended = doctor.patientsAttended;
         index = patientsAttended.indexOf(args.patientId);

         if (index < 0)
            patientsAttended.push(args.patientId);
         doctor.patientsAttended = patientsAttended;
         await ctx.stub.putState(doctor.medicalRegistrationNo, Buffer.from(JSON.stringify(doctor)));


         let response = `an EHR is created with id${newEHR.ehrId} and stored in the world state`;
         return response;

      } else {
         throw new Error(`Either the hospital, patient, doctor or the appointment id is wrong`);
      }

   }





   async assetExists(ctx, patientId) {
      const buffer = await ctx.stub.getState(patientId);
      return (!!buffer && buffer.length > 0);
   }




   async giveAccess(ctx, args) {
      args = await JSON.parse(args);
      let requesterExists = await this.assetExists(ctx, args.requesterId);
      let patientExists = await this.assetExists(ctx, args.patientId);
      if (patientExists && requesterExists) {
         let patientAsBytes = await ctx.stub.getState(args.patientId);
         let patient = JSON.parse(patientAsBytes);

         patient.access.push(args.requesterId)
         patient.totalaccessedIds.push(args.requesterId)
         await ctx.stub.putState(patient.patientId, Buffer.from(JSON.stringify(patient)));
         let response = `Access has been provided to the requester with the id ${args.patientId}`;
         return response;

      } else {
         throw new Error(`patient with id ${args.patientId} or requester with id ${args.requesterId} doesn't exists`);
      }
   }





   async revokeAccess(ctx, requesterId, patientId) {
      args = await JSON.parse(args);
      let requesterExists = await this.assetExists(ctx, requesterId);
      let patientExists = await this.assetExists(ctx, patientId);
      if (patientExists && requesterExists) {
         let patientAsBytes = await ctx.stub.getState(patientId);
         let patient = JSON.parse(patientAsBytes);
         const index = patient.access.indexOf(requesterId);
         if (index > -1) {
            patient.access.splice(index, 1);
         }
         await ctx.stub.putState(patient.patientId, Buffer.from(JSON.stringify(patient)));
         let response = `Access has been provided to the requester with the id ${patientId}`;
         return response;

      } else {
         throw new Error(`patient with id ${args.patientId} or requester with id ${args.requesterId} doesn't exists`);
      }
   }



   async createDoctor(ctx, args) {
      args = await JSON.parse(args);
      let hospitalExists = await this.assetExists(ctx, args.hospitalId);
      let doctorExists = await this.assetExists(ctx, args.medicalRegistrationNo);
      if (hospitalExists && !doctorExists) {

         let newDoctor = await new Doctor(args.firstName, args.lastName, args.address, args.aadhaar, args.medicalRegistrationNo, args.DOB, args.gender, args.userName, args.password, args.specialisation, args.phone);

         //update the doctor in the hospital database
         let hospitalAsBytes = await ctx.stub.getState(args.hospitalId);
         let hospital = JSON.parse(hospitalAsBytes);
         let doctors = hospital.doctors;
         doctors.push(newDoctor.medicalRegistrationNo);
         hospital.doctors = doctors;
         await ctx.stub.putState(hospital.registrationId, Buffer.from(JSON.stringify(hospital)));

         //put the doctor in the global state
         await ctx.stub.putState(newDoctor.medicalRegistrationNo, Buffer.from(JSON.stringify(newDoctor)));

         let response = `Doctor with medicalRegistrationNo ${newDoctor.medicalRegistrationNo} is updated in the world state`;
         return response;

      } else {
         throw new Error(`There is no such hospital with id ${args.hospitalId} or a doctor with id ${args.medicalRegistrationNo} already exists`);
      }

   }





   async createHospital(ctx, args) {
      args = await JSON.parse(args);
      let hospitalExists = await this.assetExists(ctx, args.registrationId);

      if (!hospitalExists) {
         // initialise empty lists of id's of doctors, patients and appointments
         //create a new hospital
         let newHospital = await new Hospital(args.name, args.registrationId, args.userName, args.password, args.address, args.phone);
         //put the hospital in the global state
         await ctx.stub.putState(newHospital.registrationId, Buffer.from(JSON.stringify(newHospital)));

         let response = `Hospital with registrationId ${newHospital.registrationId} is updated in the world state`;
         return response;
      } else {
         throw new Error(`hospital with id ${args.hospitalId} already exists`);
      }
   }





   async generateBill(ctx, args) {
      args = await JSON.parse(args);
      let patientExists = await this.assetExists(ctx, args.patientId);
      if (patientExists) {

         let newBill = await new Bill(args.billId, args.hospitalId, args.patientId, args.details, args.time, args.amount, args.record);
         await ctx.stub.putState(newBill.billId, Buffer.from(JSON.stringify(newBill)));

         //update the patient with the bill
         let patientAsBytes = await ctx.stub.getState(args.patientId);
         let patient = JSON.parse(patientAsBytes);
         let bills = patient.bills;
         bills.push(newBill.billId);
         patient.bills = bills;
         await ctx.stub.putState(patient.patientId, Buffer.from(JSON.stringify(patient)));

         let response = `Bill has been generated with id ${newBill.billId} and updated for both the patient and hospital`;
         return response;

      } else {
         throw new Error(`Either the patient is not correct`);
      }
   }



   async createInsurance(ctx, args) {
      args = await JSON.parse(args);
      let insurerExists = await this.assetExists(ctx, args.registrationId);
      if (!insurerExists) {
         let patients = [];
         //create a new insurer and update that in the world state
         let newInsurer = await new Insurance(args.name, args.registrationId, args.userName, args.password, args.address, args.phone);
         newInsurer.patients = patients;

         await ctx.stub.putState(newInsurer.registrationId, Buffer.from(JSON.stringify(newInsurer)));

         let response = `a new insurer created with id ${newInsurer.registrationId} `;
         return response;
      } else {
         throw new Error(`Insurer with id ${args.registrationId} already exists`);
      }
   }



   async createAppointment(ctx, args) {
      args = await JSON.parse(args);
      let doctorExists = await this.assetExists(ctx, args.DoctorId);
      let patientExists = await this.assetExists(ctx, args.patientId);

      if (doctorExists && patientExists) {
         let newAppointment = await new Appointment(args.appointmentId, args.doctorId, args.patientId, args.description, args.time);
         
         let doctorAsBytes = await ctx.stub.getState(args.DoctorId);
         let doctor = await JSON.parse(doctorAsBytes);
         let appointments = doctor.appointments;
         appointments.push(newAppointment.appointmentId);
         doctor.appointments = appointments;
         await ctx.stub.putState(doctor.medicalRegistrationNo, Buffer.from(JSON.stringify(doctor)));

         
         let patientAsBytes = await ctx.stub.getState(args.patientId);
         let patient = await JSON.parse(patientAsBytes);
         let patientappointments = patient.appointments;
         patientappointments.push(newAppointment.appointmentId);
         patient.appointments = patientappointments;
         await ctx.stub.putState(patient.patientId, Buffer.from(JSON.stringify(patient)));
         await ctx.stub.putState(newAppointment.appointmentId, Buffer.from(JSON.stringify(newAppointment)));
         let response = `Appointment with the appointmentId ${newAppointment.appointmentId} is updated in the global state`;
         return response;

      } else {
         throw new Error(`Either the Doctor id  or the patient Id ${args.userName}is not correct`)
      }
   }



   async requestAccess(ctx, args) {
      args = await JSON.parse(args);
      let requesterExists = await this.assetExists(ctx, args.requesterId);
      let patientExists = await this.assetExists(ctx, args.patientId);
      if (requesterExists && patientExists) {

          //get the patient and update the request for that patient
          let patientAsBytes = await ctx.stub.getState(args.patientId);
          let patient = JSON.parse(patientAsBytes);
          let accessRequest = patient.accessRequest;
          let index = accessRequest.indexOf(args.requesterId);
          if (index < 0) {
            accessRequest.push(args.requesterId);
          }
          patient.accessRequest = accessRequest;

          await ctx.stub.putState(patient.patientId, Buffer.from(JSON.stringify(patient)));

          let response = `the request to access the documents has been submitted with the patient`;
          return response;
      } else {
          throw new Error(`this requester with id ${args.requesterId} or the patient with id ${args.patientId} doesn't exist`);
      }
  }


  async grantAccess(ctx, args) {
      args = await JSON.parse(args);
      let patientExists = await this.assetExists(ctx, args.patientId);
      let requesterExists = await this.assetExists(ctx, args.requesterId);
      if (patientExists && requesterExists) {
          let patientAsBytes = await ctx.stub.getState(args.patientId);
          let patient = JSON.parse(patientAsBytes);
          let accessRequest = patient.accessRequest;
          let index = accessRequest.indexOf(args.requesterId);
          if (index > -1) {
              accessRequest.splice(index, 1);
              patient.accessRequest = accessRequest;
              let accessGrant = patient.accessGrant;
              accessGrant[args.requesterId] = args.documentIds;
              patient.accessGrant = accessGrant;
              await ctx.stub.putState(patient.patientId, Buffer.from(JSON.stringify(patient)));

              let requesterAsBytes = await ctx.stub.getState(args.requesterId);
              let requester = JSON.parse(requesterAsBytes);
              let patients = requester.patients;
              index = patients.indexOf(args.patientId);
              if (index < 0) {
                  patients.push(args.patientId);
              }
              requester.patients = patients;
              await ctx.stub.putState(args.requesterId, Buffer.from(JSON.stringify(requester)));

              let response = `Access has been provided to the requester with the id ${args.requesterId}`;
              return response;
          } else {
              throw new Error(`No such requester with id ${args.requesterId}`);
          }
      } else {
          throw new Error(`patient with id ${args.patientId} or requester with id ${args.requesterId} doesn't exists`);
      }
  }




 
  async grantDirectAccess(ctx, args) {
      args = await JSON.parse(args);
      let patientExists = await this.assetExists(ctx, args.patientId);
      let requesterExists = await this.assetExists(ctx, args.requesterId);
      if (patientExists && requesterExists) {
          let patientAsBytes = await ctx.stub.getState(args.patientId);
          let patient = JSON.parse(patientAsBytes);

          let accessGrant = patient.accessGrant;
          accessGrant[args.requesterId] = args.documentIds;
          patient.accessGrant = accessGrant;
          await ctx.stub.putState(patient.patientId, Buffer.from(JSON.stringify(patient)));

          let requesterAsBytes = await ctx.stub.getState(args.requesterId);
          let requester = JSON.parse(requesterAsBytes);
          let patients = requester.patients;
          let index = patients.indexOf(args.patientId);
          if (index < 0) {
              patients.push(args.patientId);
          }
          requester.patients = patients;
          await ctx.stub.putState(args.requesterId, Buffer.from(JSON.stringify(requester)));

          return `Access has been provided to the requester with the id ${args.requesterId}`;
      } else {
          throw new Error(`patient with id ${args.patientId} or requester with id ${args.requesterId} doesn't exists`);
      }
  }


  async revokeAccess(ctx, args) {
      args = await JSON.parse(args);
      let patientExists = await this.assetExists(ctx, args.patientId);
      let requesterExists = await this.assetExists(ctx, args.requesterId);
      if (patientExists && requesterExists) {
          let patientAsBytes = await ctx.stub.getState(args.patientId);
          let patient = JSON.parse(patientAsBytes);
          let accessGrant = patient.accessGrant;

          if (args.requesterId in accessGrant) {
              delete accessGrant[args.requesterId];
              patient.accessGrant = accessGrant;
              await ctx.stub.putState(patient.patientId, Buffer.from(JSON.stringify(patient)));

              let requesterAsBytes = await ctx.stub.getState(args.requesterId);
              let requester = JSON.parse(requesterAsBytes);
              let patients = requester.patients;
              let index = patients.indexOf(args.patientId);
              if (index > -1) {
                  patients.splice(index, 1);
                  requester.patients = patients;
                  await ctx.stub.putState(args.requesterId, Buffer.from(JSON.stringify(requester)));
              }

              let response = `Access has been revoked for the requester with the id ${args.requesterId}`;
              return response;
          } else {
              throw new Error(`No such Permissioned id with id ${args.requesterId}`);
          }
      } else {
          throw new Error(`patient with id ${args.patientId} or requester with id ${args.requesterId} doesn't exists`);
      }
  }


  async modifyAssetInfo(ctx, args) {
      let assetAsBytes = await ctx.stub.getState(args.assetId);
      let asset = JSON.parse(assetAsBytes);
      if (asset.type === 'Patient') {
          delete asset.password;
          delete asset.appointments;
          delete asset.permissionedIds;
          delete asset.requesters;
          delete asset.ehrs;
          delete asset.bills;
      } else if (asset.type === 'Doctor') {
          delete asset.password;
          delete asset.patients;
          delete asset.appointments;
          delete asset.patientsAttended;
      }   else if (asset.type === 'Insurance') {
          delete asset.password;
          delete asset.patients;
      } else if (asset.type === 'Hospital') {
          delete asset.password;
          delete asset.patients;
      }
      delete asset.aadhaar;
      return asset;
  }



  
async readHospitalAssets(ctx, args) {
      args = await JSON.parse(args);
      let hospitalExists = await this.assetExists(ctx, args.hospitalId);
      if (hospitalExists) {
          let hospitalAsBytes = await ctx.stub.getState(args.hospitalId);
          let hospital = JSON.parse(hospitalAsBytes);

          let assetExits = await this.assetExists(ctx, args.assetId);
          if (assetExits) {
              let index = -1;
              if (args.listType === 'patients') {
                  index = hospital.patients.indexOf(args.assetId);
                  if (index > -1) {
                      return await this.readDocuments(ctx, args.assetId, hospital.registrationId);
                  }
              } else {
                  if (args.listType === 'patientsVisited') {
                      index = hospital.patientsVisited.indexOf(args.assetId);
                  } else if (args.listType === 'doctors') {
                      index = hospital.doctors.indexOf(args.assetId);
                  }  else if (args.listType === 'bills') {
                      index = hospital.bills.indexOf(args.assetId);
                  } else if (args.listType === 'appointments') {
                      index = hospital.appointments.indexOf(args.assetId);
                  }
                  if (index > -1) {
                      return await this.modifyAssetInfo(ctx, args);
                  } else {
                      throw new Error(`asset not found`); 
                  }
              }
          } else {
              throw new Error(`the asset ${args.assetId} is not part of the hospital list`);
          }
      }
  }

  

 
  async readDoctorAssets(ctx, args) {
      args = await JSON.parse(args);
      let doctorExists = await this.assetExists(ctx, args.doctorId);
      if (doctorExists) {
          let doctorAsBytes = await ctx.stub.getState(args.doctorId);
          let doctor = JSON.parse(doctorAsBytes);

          let assetExits = await this.assetExists(ctx, args.assetId);
          if (assetExits) {
              let index = -1;
              if (args.listType === 'patients') {
                  index = doctor.patients.indexOf(args.assetId);
                  if (index > -1) {
                      return await this.readDocuments(ctx, args.assetId, doctor.medicalRegistrationNo);
                  }
              } else {
                  if (args.listType === 'patientsAttended') {
                      index = doctor.patientsAttended.indexOf(args.assetId);
                  } else if (args.listType === 'appointments') {
                      index = doctor.appointments.indexOf(args.assetId);
                  }
                  if (index > -1) {
                      return await this.modifyAssetInfo(ctx, args);
                  } else {
                      throw new Error(`asset not found`);
                  }
              }
          } else {
              throw new Error(`asset with id ${args.assetId} doesn't exist for the doctor`);
          }
      }
  }


 
  async readPatientAssets(ctx, args) {
      args = JSON.parse(args);
      let patientExists = await this.assetExists(ctx, args.patientId);
      if (patientExists) {
          let patientAsBytes = await ctx.stub.getState(args.patientId);
          let patient = JSON.parse(patientAsBytes);
          let assetExists = await this.assetExists(ctx, args.assetId);
          if (assetExists) {
              let index = -1;
              if (args.listType === 'ehrs') {
                  index = patient.ehrs.indexOf(args.assetId);
              } else if (args.listType === 'requesters') {
                  index = patient.requesters.indexOf(args.assetId);
              } else if (args.listType === 'bills') {
                  index = patient.bills.indexOf(args.assetId);
              } else if (args.listType === 'appointments') {
                  index = patient.appointments.indexOf(args.assetId);
              } else if (args.listType === 'accessGrant') {
                  let documentIds = patient.permissionedIds[args.assetId] || [];
                  if (documentIds && documentIds.length > 0) {
                      return await this.modifyAssetInfo(ctx, args);
                  }
              }
              if (index > -1) {
                  return await this.modifyAssetInfo(ctx, args);
              } else {
                  throw new Error(`asset not found`);
              }
          }
      } else {
          throw new Error(`patient with ide ${args.patientId} doesn't exist`);
      }
  }


  async readInsurerAssets(ctx, args) {
      args = await JSON.parse(args);
      let insurerExists = await this.assetExists(ctx, args.insurerId);
      if (insurerExists) {
          let insurerAsBytes = await ctx.stub.getState(args.insurerId);
          let insurer = JSON.parse(insurerAsBytes);
          let assetExists = await this.assetExists(ctx, args.assetId);
          if (assetExists) {
              let index = insurer.patients.indexOf(args.assetId);
              if (index > -1) {
                  return await this.readDocuments(ctx, args.assetId, insurer.registrationId);
              } else {
                  throw new Error(`asset not found`);
              }
          } else {
              throw new Error(`asset ${args.assetId} doesn't exits`);
          }
      }
  }


  async readDocuments(ctx, assetId,requesterId) {
      let patientAsBytes = await ctx.stub.getState(assetId);
      let patient = JSON.parse(patientAsBytes);
      let documentIds = patient.permissionedIds[requesterId];
      let assets = [];
      //push the patient info first and then the documents along with that
      delete patient.password;
      delete patient.appointments;
      delete patient.accessGrant;
      delete patient.accessRequest;
      delete patient.ehrs;
      delete patient.bills;
      assets.push(patient);
      for (let i = 0; i < documentIds.length; i++) {
          let documentAsBytes = await ctx.stub.getState(documentIds[i]);
          let document = JSON.parse(documentAsBytes);
          assets.push(document);
      }
      return assets;
  }


  async getModifiedAsset(ctx, args) {
      args = JSON.parse(args);
      let assetExists = await this.assetExists(ctx, args.id);
      if (assetExists) {
          let assetAsBytes = await ctx.stub.getState(args.id);
          let asset = JSON.parse(assetAsBytes);
          delete asset.password;
          return asset;
      } else {
          throw new Error(`the asset with id ${args.id} doesn't exist`);
      }
  }


async verifyPassword(ctx, args) {
      args = await JSON.parse(args);
      let assetExists = await this.assetExists(ctx, args.id);
      if (assetExists) {
          let assetAsBytes = await ctx.stub.getState(args.id);
          let asset = JSON.parse(assetAsBytes);
          return asset.password === args.password;
      } else {
          throw new Error(`the id ${args.id} doesn't exist`);
      }
}

async updateAsset(ctx, args) {
      args = await JSON.parse(args);
      const exists = await this.assetExists(ctx, args.id);
      if (!exists) {
          throw new Error(`The ehr ${args.id} does not exist`);
      }
      await ctx.stub.putState(args.id, Buffer.from(JSON.stringify(args)));
  }




}

module.exports = EHRContract;
