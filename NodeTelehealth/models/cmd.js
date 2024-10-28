const command = {
    login: 1, //Authentication
    loginresult:2, //report user to client

    machinelogin:3, //Machine login
    
    enableConsult:11, //Let the patient talk to the doctor.
    disableConsult:12, //Patients are not allowed to talk to the doctor.

    anouncCase:21, //Patient request case (Broadcast case)
    acceptCase:22, //Doctor accepted case 
    askCaseState: 23, //Doctor ask case state for confirm
    endCase: 24, //End case consult
    releaseCase: 25, //Tell other doctor the case was booking
    allowSensitiveInfo: 26, //Patient allow sensitive infomation

   


}
const role = {
    Unrole: 0,
    Admin: 1,
    Doctor: 2,
    Patient:3, 

   


}

module.exports = {command, role};