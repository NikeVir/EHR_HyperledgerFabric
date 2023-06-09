'use strict';
var express = require('express');
var bodyParser = require('body-parser');


var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(bodyParser.json());
const path = require('path');
const fs = require('fs');

app.set("view engine","pug");
app.get('/',(req,res)=>{
    res.send("hello")
})

app.get('/api/', function (req, res) {
    res.render('index');
});

app.get('/api/createcar', function (req, res) {
    res.render('createcar');
});
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');

app.get('/api/createUser', async function (req, res)  {
    try {
        console.log(req.body)
        const path = require('path');
        const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const identity = await wallet.exists(req.body.userName);
        if (identity) {
            res.send('Candidate has been already registered ... ');
            return;
        }
        const adminExists = await wallet.exists('admin');
        if (!adminExists) {
            res.send(' Admin is not currently enrolled. Please wait for sometime ...');
            console.log('Please run enrollAdmin.js file first ... ');
            return;
        }
        
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
        
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();
        
        const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: req.body.userName, role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: req.body.userName, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(req.body.userName, userIdentity);
        console.log("hello")

        const newgateway = new Gateway();
        await newgateway.connect(ccpPath, { wallet, identity: req.body.userName, discovery: { enabled: true, asLocalhost: true } });

        const network = await newgateway.getNetwork('mychannel');
        const contract = network.getContract('fabcar');
        var object = {
            userName:req.body.userName,
                firstName:req.body.firstName,
                lastName:req.body.lastName,
                status:req.body.status,
                patientId:req.body.patientId,
                mobno:req.body.mobno,
                email:req.body.email,
                DOB:req.body.DOB,
                gender:req.body.gender,
                password:req.body.password
            }

        const result   = await contract.submitTransaction('RegisterUser',JSON.stringify(object));
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.send(result)
} catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});



app.get('/api/createEhr', async function (req, res) {
    try {
        const path = require('path');
        const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        const identity = await wallet.exists(req.body.userName);
        if (!identity) {
            console.log('An identity for the user "appUser1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        console.log("hello")
        const newgateway = new Gateway();
        await newgateway.connect(ccpPath, { wallet, identity: req.body.userName, discovery: { enabled: true, asLocalhost: true } });
        const network = await newgateway.getNetwork('mychannel');
        const contract = network.getContract('fabcar');
        var object = {
                ehrId:req.body.firstName,
                patientId:req.body.patientId,
                doctorId:req.body.doctorId,
                record:req.body.record,
                appointmentId:req.body.appointmentId,
                gender:req.body.gender,
                time:req.body.time
            }
        const result   = await contract.submitTransaction('RegisterUser',JSON.stringify(object));
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.send(result);
} catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});



app.put('/api/giveAccess/', urlencodedParser, async function (req, res) { 
    try {
const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        const identity = await wallet.exists(req.body.userName);
        if (!identity) {
            console.log('An identity for the user "appUser1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: req.body.username, discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('fabcar');
        var object = {
                patientId:req.body.patientId,
                doctorId:req.body.doctorId,
        }
        const result   = await contract.submitTransaction('giveAccess',JSON.stringify(object));
        console.log('Transaction has been submitted');
        res.send(result);
        await gateway.disconnect();
} catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
})


app.get('/api/createDoctor', async function (req, res) {
    try {
        console.log(req.body)
        const path = require('path');
        const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        const identity = await wallet.exists(req.body.userName);
        if (identity) {
            console.log('An identity for the user "appUser1" already exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();
        const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: req.body.userName, role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: req.body.userName, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(req.body.userName, userIdentity);
        console.log("hello")
        const newgateway = new Gateway();
        await newgateway.connect(ccpPath, { wallet, identity: req.body.userName, discovery: { enabled: true, asLocalhost: true } });
        const network = await newgateway.getNetwork('mychannel');
        const contract = network.getContract('fabcar');

        
        var object = {
                hospitalId:req.body.hospitalId,
                firstName:req.body.firstName,
                lastName:req.body.lastName,
                aadhaar:req.body.aadhaar,
                medicalRegistrationNo:req.body.medicalRegistrationNo,
                phone:req.body.phone,
                email:req.body.email,
                specialisation:req.body.specialisation,
                DOB:req.body.DOB,
                gender:req.body.gender,
                password:req.body.password
    
            }
        const result   = await contract.submitTransaction('createDoctor',JSON.stringify(object));
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.status(200).json({response: result.toString()});
} catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});




app.get('/api/createHospital', async function (req, res) {
    try {
        console.log(req.body)
        const path = require('path');
        const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        const identity = await wallet.exists(req.body.userName);
        if (identity) {
            console.log('An identity for the user "appUser1" already exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();
        const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: req.body.userName, role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: req.body.userName, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(req.body.userName, userIdentity);
        console.log("hello")
        const newgateway = new Gateway();
        await newgateway.connect(ccpPath, { wallet, identity: req.body.userName, discovery: { enabled: true, asLocalhost: true } });
        const network = await newgateway.getNetwork('mychannel');
        const contract = network.getContract('fabcar');
        var object = {
                name:req.body.name,
                userName:req.body.userName,
                registrationId:req.body.registrationId,
                address:req.body.address,
                medicalRegistrationNo:req.body.medicalRegistrationNo,
                phone:req.body.phone,
                aadhaar:req.body.aadhaar,
                email:req.body.email,
                password:req.body.password
            }
        const result   = await contract.submitTransaction('createHospital',JSON.stringify(object));
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.status(200).json({response: result.toString()});
} catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});



app.get('/api/createInsurance', async function (req, res) {
        try {
            const path = require('path');
            const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
            
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = new FileSystemWallet(walletPath);
            const identity = await wallet.exists(req.body.userName);
            if (!identity) {
                console.log('An identity for the user "appUser1" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
            const gateway = new Gateway();
            await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
            const ca = gateway.getClient().getCertificateAuthority();
            const adminIdentity = gateway.getCurrentIdentity();
            const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: req.body.userName, role: 'client' }, adminIdentity);
            const enrollment = await ca.enroll({ enrollmentID: req.body.userName, enrollmentSecret: secret });
            const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
            await wallet.import(req.body.userName, userIdentity);
            console.log("hello")
            const newgateway = new Gateway();
            await newgateway.connect(ccpPath, { wallet, identity: req.body.userName, discovery: { enabled: true, asLocalhost: true } });
            const network = await newgateway.getNetwork('mychannel');
            const contract = network.getContract('fabcar');
            var object = {
                    name:req.body.name,
                    userName:req.body.userName,
                    registrationId:req.body.registrationId,
                    address:req.body.address,
                    medicalRegistrationNo:req.body.medicalRegistrationNo,
                    phone:req.body.phone,
                    email:req.body.email,
                    password:req.body.password
                }
            const result   = await contract.submitTransaction('createHospital',JSON.stringify(object));
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            res.status(200).json({response: result.toString()});
    } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({error: error});
            process.exit(1);
        }
    });



    app.get('/api/createAppointment', async function (req, res) {
        try {
            console.log(req.body)
            const path = require('path');
            const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
            
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = new FileSystemWallet(walletPath);
            const identity = await wallet.exists(req.body.userName);
            if (!identity) {
                console.log('An identity for the user "appUser1" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
            const newgateway = new Gateway();
            await newgateway.connect(ccpPath, { wallet, identity: req.body.userName, discovery: { enabled: true, asLocalhost: true } });
            const network = await newgateway.getNetwork('mychannel');
            const contract = network.getContract('fabcar');
            var object = {
                appointmentId:req.body.appointmentId,
                hospitalId:req.body.hospitalId,
                DoctorId:req.body.DoctorId,
                patientId:req.body.patientId,
                description:req.body.description,
                time:req.body.time,
                
            }
            console.log("HEllo")
            const result   = await contract.submitTransaction('createAppointment',JSON.stringify(object));
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            res.status(200).json({response: result.toString()});
    } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({error: error});
            process.exit(1);
        }
    });




    app.get('/api/generateBill', async function (req, res) {
        try {
            const path = require('path');
            const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
            
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = new FileSystemWallet(walletPath);
            const identity = await wallet.exists(req.body.userName);
            if (!identity) {
                console.log('An identity for the user "appUser1" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
            const gateway = new Gateway();
            await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
            const ca = gateway.getClient().getCertificateAuthority();
            const adminIdentity = gateway.getCurrentIdentity();
            const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: req.body.userName, role: 'client' }, adminIdentity);
            const enrollment = await ca.enroll({ enrollmentID: req.body.userName, enrollmentSecret: secret });
            const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
            await wallet.import(req.body.userName, userIdentity);
            console.log("hello")
            const newgateway = new Gateway();
            await newgateway.connect(ccpPath, { wallet, identity: req.body.userName, discovery: { enabled: true, asLocalhost: true } });
            const network = await newgateway.getNetwork('mychannel');
            const contract = network.getContract('fabcar');
            var object = {
                billId:req.body.billId,
                hospitalId:req.body.hospitalId,
                patientId:req.body.patientId,
                details:req.body.details,
                time:req.body.time,
                amount:req.body.amount,
                record:req.body.record,
                }
            const result   = await contract.submitTransaction('generateBill',JSON.stringify(object));
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            res.status(200).json({response: result.toString()});
    } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({error: error});
            process.exit(1);
        }
    });







    app.get('/api/updateAsset', async function (req, res) {
        try {
            const path = require('path');
            const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
            
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = new FileSystemWallet(walletPath);
            const identity = await wallet.exists(req.body.userName);
            if (!identity) {
                console.log('An identity for the user "appUser1" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
            
            const newgateway = new Gateway();
            await newgateway.connect(ccpPath, { wallet, identity: req.body.userName, discovery: { enabled: true, asLocalhost: true } });
            const network = await newgateway.getNetwork('mychannel');
            const contract = network.getContract('fabcar');
            var object = {
                id:req.body.id,
                }
            const result   = await contract.submitTransaction('generateBill',JSON.stringify(object));
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            res.status(200).json({response: result.toString()});
    } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({error: error});
            process.exit(1);
        }
    });




    app.get('/api/requestAccess', async function (req, res) {
        try {
            const path = require('path');
            const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
            
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = new FileSystemWallet(walletPath);
            const identity = await wallet.exists(req.body.userName);
            if (!identity) {
                console.log('An identity for the user "appUser1" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
            
            const newgateway = new Gateway();
            await newgateway.connect(ccpPath, { wallet, identity: req.body.userName, discovery: { enabled: true, asLocalhost: true } });
            const network = await newgateway.getNetwork('mychannel');
            const contract = network.getContract('fabcar');
            var object = {
                requesterId:req.body.requesterId,
                patientId:req.body.patientId,
                }
            const result   = await contract.submitTransaction('requestAccess',JSON.stringify(object));
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            res.status(200).json({response: result.toString()});
    } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({error: error});
            process.exit(1);
        }
    });




    app.get('/api/grantAccess', async function (req, res) {
        try {
            const path = require('path');
            const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
            
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = new FileSystemWallet(walletPath);
            const identity = await wallet.exists(req.body.userName);
            if (!identity) {
                console.log('An identity for the user "appUser1" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
           
            const newgateway = new Gateway();
            await newgateway.connect(ccpPath, { wallet, identity: req.body.userName, discovery: { enabled: true, asLocalhost: true } });
            const network = await newgateway.getNetwork('mychannel');
            const contract = network.getContract('fabcar');
            var object = {
                requesterId:req.body.requesterId,
                patientId:req.body.patientId,
                }
            const result   = await contract.submitTransaction('grantAccess',JSON.stringify(object));
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            res.status(200).json({response: result.toString()});
    } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({error: error});
            process.exit(1);
        }
    });



    app.get('/api/grantDirectAccess', async function (req, res) {
        try {
            const path = require('path');
            const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
            
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = new FileSystemWallet(walletPath);
            const identity = await wallet.exists(req.body.userName);
            if (!identity) {
                console.log('An identity for the user "appUser1" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
           
            const newgateway = new Gateway();
            await newgateway.connect(ccpPath, { wallet, identity: req.body.userName, discovery: { enabled: true, asLocalhost: true } });
            const network = await newgateway.getNetwork('mychannel');
            const contract = network.getContract('fabcar');
            var object = {
                requesterId:req.body.requesterId,
                patientId:req.body.patientId,
                }
            const result   = await contract.submitTransaction('grantDirectAccess',JSON.stringify(object));
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            res.status(200).json({response: result.toString()});
    } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({error: error});
            process.exit(1);
        }
    });



    app.get('/api/revokeAccess', async function (req, res) {
        try {
            const path = require('path');
            const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
            
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = new FileSystemWallet(walletPath);
            const identity = await wallet.exists(req.body.userName);
            if (!identity) {
                console.log('An identity for the user "appUser1" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
           
            const newgateway = new Gateway();
            await newgateway.connect(ccpPath, { wallet, identity: req.body.userName, discovery: { enabled: true, asLocalhost: true } });
            const network = await newgateway.getNetwork('mychannel');
            const contract = network.getContract('fabcar');
            var object = {
                requesterId:req.body.requesterId,
                patientId:req.body.patientId,
                }
            const result   = await contract.submitTransaction('revokeAccess',JSON.stringify(object));
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            res.status(200).json({response: result.toString()});
    } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({error: error});
            process.exit(1);
        }
    });



    app.get('/api/modifyAssetInfo', async function (req, res) {
        try {
            const path = require('path');
            const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
            
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = new FileSystemWallet(walletPath);
            const identity = await wallet.exists(req.body.userName);
            if (!identity) {
                console.log('An identity for the user "appUser1" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
        
            const newgateway = new Gateway();
            await newgateway.connect(ccpPath, { wallet, identity: req.body.userName, discovery: { enabled: true, asLocalhost: true } });
            const network = await newgateway.getNetwork('mychannel');
            const contract = network.getContract('fabcar');
            var object = {
                assetId:req.body.assetId,
                }
            const result   = await contract.submitTransaction('modifyAssetInfo',JSON.stringify(object));
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            res.status(200).json({response: result.toString()});
    } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({error: error});
            process.exit(1);
        }
    });


    app.get('/api/readHospitalAssets', async function (req, res) {
        try {
            const path = require('path');
            const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
            
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = new FileSystemWallet(walletPath);
            const identity = await wallet.exists(req.body.userName);
            if (!identity) {
                console.log('An identity for the user "appUser1" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
            
            const newgateway = new Gateway();
            await newgateway.connect(ccpPath, { wallet, identity: req.body.userName, discovery: { enabled: true, asLocalhost: true } });
            const network = await newgateway.getNetwork('mychannel');
            const contract = network.getContract('fabcar');
            var object = {
                hospitalId:req.body.hospitalId,
                assetId:req.body.assetId,
                }
            const result   = await contract.submitTransaction('readHospitalAssets',JSON.stringify(object));
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            res.status(200).json({response: result.toString()});
    } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({error: error});
            process.exit(1);
        }
    });



    app.get('/api/readDoctorAssets', async function (req, res) {
        try {
            const path = require('path');
            const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
            
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = new FileSystemWallet(walletPath);
            const identity = await wallet.exists(req.body.userName);
            if (!identity) {
                console.log('An identity for the user "appUser1" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
            
            const newgateway = new Gateway();
            await newgateway.connect(ccpPath, { wallet, identity: req.body.userName, discovery: { enabled: true, asLocalhost: true } });
            const network = await newgateway.getNetwork('mychannel');
            const contract = network.getContract('fabcar');
            var object = {
                doctorId:req.body.doctorId,
                assetId:req.body.assetId,
                }
            const result   = await contract.submitTransaction('readDoctorAssets',JSON.stringify(object));
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            res.status(200).json({response: result.toString()});
    } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({error: error});
            process.exit(1);
        }
    });    
    
    
    app.get('/api/readPatientAssets', async function (req, res) {
        try {
            const path = require('path');
            const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
            
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = new FileSystemWallet(walletPath);
            const identity = await wallet.exists(req.body.userName);
            if (!identity) {
                console.log('An identity for the user "appUser1" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
            
            const newgateway = new Gateway();
            await newgateway.connect(ccpPath, { wallet, identity: req.body.userName, discovery: { enabled: true, asLocalhost: true } });
            const network = await newgateway.getNetwork('mychannel');
            const contract = network.getContract('fabcar');
            var object = {
                assetId:req.body.assetId,
                patientId:req.body.patientId,
                }
            const result   = await contract.submitTransaction('readPatientAssets',JSON.stringify(object));
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            res.status(200).json({response: result.toString()});
    } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({error: error});
            process.exit(1);
        }
    });


        
    app.get('/api/readInsurerAssets', async function (req, res) {
        try {
            const path = require('path');
            const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
            
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = new FileSystemWallet(walletPath);
            const identity = await wallet.exists(req.body.userName);
            if (!identity) {
                console.log('An identity for the user "appUser1" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
           
            const newgateway = new Gateway();
            await newgateway.connect(ccpPath, { wallet, identity: req.body.userName, discovery: { enabled: true, asLocalhost: true } });
            const network = await newgateway.getNetwork('mychannel');
            const contract = network.getContract('fabcar');
            var object = {
                insurerId:req.body.insurerId,
                assetId:req.body.assetId,
                }
            const result   = await contract.submitTransaction('readInsurerAssets',JSON.stringify(object));
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            res.status(200).json({response: result.toString()});
    } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({error: error});
            process.exit(1);
        }
    });
        

app.listen(8080,()=>{
    console.log("Running on Port 8000")
});