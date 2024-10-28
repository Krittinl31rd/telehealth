const mainIP = "192.168.1.66"
const videoWrapper = document.getElementById('videos');
const btnMic = document.getElementById('btnMic');
const btnCamera = document.getElementById('btnCamera');
const btnEnd = document.getElementById('btnEnd');
// const selectCamera = document.getElementById('selectCamera');
// const selectMic = document.getElementById('selectMic');
const chatSend = document.getElementById('chatSend');
const chatInput = document.getElementById('chatInput');
const chatArea = document.getElementById('chatArea');


// ************* rtc *********************************

const patientContainer = document.getElementById('patientContainer');
const mainContainer = document.getElementById('mainCotainer');
const caselistContainer = document.getElementById('caselistContainer')

var currentCase = localStorage.getItem("caseId") || "";
var iden = localStorage.getItem("yourIden") || "";

let measData = "";
let filterData = "";
let filterCont = document.querySelector('.filter-sidenav');
let resultCont = document.querySelector('.meas-container');

// WebSocket connection.
var socket = null;
function Connect() {

    // ResetView();
    socket = new WebSocket(`wss://${mainIP}:1231/echo`);
    const docUsername = 'ham';
    const docPassword = '123456';

    socket.addEventListener("open", (event) => {
        if (currentCase != "") {
            let pl = {
                cmd: command.login,
                param: {
                    username: docUsername,
                    password: docPassword
                }
            };
            socket.send(JSON.stringify(pl));
            startRTC()
            if (iden != "") {
                fetchData()
            }
        } else {
            let pl = {
                cmd: command.login,
                param: {
                    username: docUsername,
                    password: docPassword
                }
            };
            socket.send(JSON.stringify(pl));
        }

    });

    socket.addEventListener("message", (event) => {
        console.log("Message from server ", event.data);
        CheckWebsocketCommand(event.data);
    });

    socket.addEventListener("close", (event) => {
        console.log("Disconnect from Server ");
        setTimeout(() => {
            socket = null;
            Connect();
        }, 2000);
    });

}

Connect();

function ResetView() {//For first connect to websocket
    currentCase = '';
    iden = ''
    localStorage.setItem("caseId", "");
    localStorage.setItem("yourIden", "");
    mainContainer.className = `app-container active`;
    patientContainer.className = `app-container`;
    chatArea.innerHTML = '';
    resultCont.innerHTML = '';
    filterCont.innerHTML = '';
}

const command = {
    login: 1, //Authentication
    loginresult: 2, //report user to client

    machinelogin: 3, //Machine login

    enableConsult: 11, //Let the patient talk to the doctor.
    disableConsult: 12, //Patients are not allowed to talk to the doctor.

    anouncCase: 21, //Patient request case (Broadcast case)
    acceptCase: 22, //Doctor accepted case 
    askCaseState: 23, //Doctor ask case state for confirm
    endCase: 24, //End case consult
    releaseCase: 25, //Tell other doctor the case was booking
    allowSensitiveInfo: 26, //Patient allow sensitive infomation
}
async function CheckWebsocketCommand(package) {
    //console.log(package.toString());
    let data = isJson(package);
    if (data != undefined) {
        if (data.cmd != undefined) {
            if (data.cmd == command.endCase) {
                if (currentCase == data.param.caseId) {
                    keyConnections.forEach(key => {
                        const video = document.getElementById(key);
                        if (video) {
                            video.remove();
                        }
                    });
                    const video = document.getElementById(socketRTC.id);
                    if (video) {
                        video.remove();
                        socketRTC.disconnect();
                    }
                    keyConnections = []
                    ResetView();
                }
            }
            else if (data.cmd == command.releaseCase) {
                document.getElementById(`list-item${data.param.caseId}`).remove();
            }
            else if (data.cmd == command.loginresult) {
                if (data.param != undefined) {
                    let doctorName = document.getElementById('doctorName');
                    doctorName.innerText = `Welcome back Doctor ${data.param.name}`;
                }
            }
            else if (data.cmd == command.allowSensitiveInfo) {
                iden = data.param.iden;
                localStorage.setItem("yourIden", data.param.iden);
                chatArea.innerHTML += `<div class="message-wrapper">
                            <div class="message-content">
                                <p class="name">Bot</p>
                                <div class="message">Patient ${iden} is allow sensitive info.</div>
                            </div>
                        </div>`
                chatArea.scrollTop = chatArea.scrollHeight;
                fetchData()
            }
            else if (data.cmd == command.anouncCase) {
                addItem(data.param.topic, data.param.caseId)
                playSound()
            }
            else if (data.cmd == command.askCaseState) {
                if (data.param != undefined) {
                    //status 0=waiting, 1=booking, 2=cancel, 
                    if (data.param.status == 0) {
                        currentCase = data.param.caseId;
                        localStorage.setItem("caseId", data.param.caseId);
                        startRTC();
                    } else {
                        document.getElementById('list-item-' + data.param.caseId).remove();
                        alert(`${data.param.message} (${data.param.status})`);
                    }


                }
            }
        }
    }
    else {

    }
}

function playSound() {
    const audio = new Audio('./mp3/fx-synth-80.mp3');
    audio.play();
}


async function fetchData() {
    try {
        const response = await fetch(`https://${mainIP}:3031/data/${iden}`);
        let data = await response.json();
        measData = data.result;

        resultCont.innerHTML = "";
        filterCont.innerHTML = "";

        if (measData.length >= 1) {
            document.getElementById('refreshData').style.display = 'block'
            measData.map((meas) => {
                createMeas(meas);
            });

            filterData = [
                ...new Set(
                    measData
                        .map((meas) => meas.categories)
                )
            ];
            filterData.map((filter) => createFilter(filter));
        } else {
            const meas = document.createElement('h3');
            meas.innerHTML = `No result measurement for patient.`
            resultCont.append(meas);
        }

    } catch (err) {
        console.error(err);
    }
}


const createMeas = (measData, buttonState) => {
    const { data, categories } = measData;
    const meas = document.createElement('div');
    meas.className = 'meas-card'

    if (categories === 'Height and weight') {
        meas.innerHTML = `
    <div class="meas-content">
        <div class="meas-titles">${categories}</div>
            <div class="meas-body">
            ${data.map((item) => {
            const result = calculateBMI(parseInt(item.weight), parseInt(item.height));
            return `
            <table class="meas-table">
                <tr>
                    <th>Measurement</th>
                    <th>Result</th>
                </tr>
                 <tr>
                    <td>Height</td>
                    <td>${item.height} cm</td>
                </tr>
                <tr>
                    <td>Weight</td>
                    <td>${item.weight} cm</td>
                </tr>
                <tr>
                    <td colspan="2">Your BMI is ${result.bmi} and your weight category is ${result.category}</td>
                </tr>                
            </table>`
        }).join('')}
            </div>
    </div>
    `
        resultCont.append(meas);
    }

    if (categories === 'Blood pressure and heart rate') {
        meas.innerHTML = `
    <div class="meas-content">
        <div class="meas-titles">${categories}</div>
            <div class="meas-body">
            ${data.map((item) => {
            return `
            <table class="meas-table">
                <tr>
                    <th>Measurement</th>
                    <th>Result</th>
                </tr>
                 <tr>
                    <td>Systolic blood pressure</td>
                    <td>${item.sbp} mmHg</td>
                </tr>
                <tr>
                    <td>Diastolic blood pressure</td>
                    <td>${item.dbp} mmHg</td>
                </tr>
                 <tr>
                    <td>Pulse (heart rate)</td>
                    <td>${item.hr}/minute</td>
                </tr>
                <tr>
                    <td>Arterial pulse wave velocity index</td>
                    <td>${item.avi} </td>
                </tr>
                 <tr>
                    <td>Arterial pressure volume index</td>
                    <td>${item.api}</td>
                </tr>
                <tr>
                    <td>Right arm systolic blood pressure</td>
                    <td>${item.sbpR} mmHg</td>
                </tr>
                 <tr>
                    <td>Right arm diastolic blood pressure</td>
                    <td>${item.dbpR} mmHg</td>
                </tr>
                <tr>
                    <td>Right arm pulse</td>
                    <td>${item.hrR}/minute</td>
                </tr>         
            </table>`
        }).join('')}
            </div>
    </div>
    `
        resultCont.append(meas);
    }

    if (categories === 'Body composition') {
        meas.innerHTML = `
    <div class="meas-content">
        <div class="meas-titles">${categories}</div>
             <div class="meas-body ${buttonState == 'inactive' ? '' : 'overflow'}">
            ${data.map((item) => {
            return `
            <table class="meas-table">
                <tr>
                    <th>Measurement</th>
                    <th>Result</th>
                </tr>
                 <tr>
                    <td>Body fat mass</td>
                    <td>${item.fm} kg</td>
                </tr>
                <tr>
                    <td>Body fat</td>
                    <td>${item.vfal}</td>
                </tr>
                 <tr>
                    <td>Basal metabolism</td>
                    <td>${item.bmr} Kcal</td>
                </tr>
                <tr>
                    <td>Subcutaneous fat mass</td>
                    <td>${item.sfm}</td>
                </tr>
                 <tr>
                    <td>Subcutaneous fat rate</td>
                    <td>${item.sfr} %</td>
                </tr>
                <tr>
                    <td>Body water (kg)</td>
                    <td>${item.tbw} kg</td>
                </tr>
                 <tr>
                    <td>Body water (%)</td>
                    <td>${item.tbwc} %</td>
                </tr>
                <tr>
                    <td>Body bone</td>
                    <td>${item.sm} kg</td>
                </tr>         
                <tr>
                    <td>Body muscle (kg)</td>
                    <td>${item.mm} kg</td>
                </tr>         
                <tr>
                    <td>Body muscle (%)</td>
                    <td>${item.mml} %</td>
                </tr>         
                <tr>
                    <td>Protein rate</td>
                    <td>${item.proteinRate} %</td>
                </tr>         
                <tr>
                    <td>Protein quality</td>
                    <td>${item.protein} kg</td>
                </tr>         
                <tr>
                    <td>Fat removal</td>
                    <td>${item.lbm} kg</td>
                </tr>         
                <tr>
                    <td>Extracellular fluid</td>
                    <td>${item.ecf} kg</td>
                </tr>         
                <tr>
                    <td>Intracellular fluid</td>
                    <td>${item.icf} kg</td>
                </tr>         
                <tr>
                    <td>Mineral content</td>
                    <td>${item.minerals} kg</td>
                </tr>         
                <tr>
                    <td>Other ingredients</td>
                    <td>${item.other} kg</td>
                </tr>         
                <tr>
                    <td>Fat regulation</td>
                    <td>${item.fmAdjus} kg</td>
                </tr>         
                <tr>
                    <td>Physical/biological age </td>
                    <td>${item.bodyAge} old</td>
                </tr>         
                <tr>
                    <td>Physical condition score</td>
                    <td>${item.bodyScore} points</td>
                </tr>         
            </table>`
        }).join('')}
            </div>
    </div>
    `
        resultCont.append(meas);
    }

    if (categories === 'Thermometry') {
        meas.innerHTML = `
        <div class="meas-content">
            <div class="meas-titles">${categories}</div>
            <div class="meas-body">
                ${data.map((item) => {
            const ttype = item.ttype == 0 ? 'Body temperature' : 'water';
            return `
            <table class="meas-table">
                <tr>
                    <th>Measurement</th>
                    <th>Result</th>
                </tr>
                 <tr>
                    <td>${ttype}</td>
                    <td>${item.tempv}${item.dw}</td>
                </tr>           
            </table>`
        }).join('')}
            </div>
        </div>
        `;
        resultCont.append(meas);
    }

    if (categories === 'Blood oxygen') {
        meas.innerHTML = `
    <div class="meas-content">
        <div class="meas-titles">${categories}</div>
            <div class="meas-body">
            ${data.map((item) => {
            return `
            <table class="meas-table">
                <tr>
                    <th>Measurement</th>
                    <th>Result</th>
                </tr>
                 <tr>
                    <td>Oxygen saturation</td>
                    <td>${item.os} %</td>
                </tr>
                <tr>
                    <td>Pulse rate</td>
                    <td>${item.bpm} bpm</td>
                </tr>             
            </table>`
        }).join('')}
            </div>
    </div>
    `
        resultCont.append(meas);
    }

    if (categories === 'Blood sugar') {
        meas.innerHTML = `
        <div class="meas-content">
            <div class="meas-titles">${categories}</div>
            <div class="meas-body">
                ${data.map((item) => {
            let valueType;
            if (item.value_type == 0) {
                valueType = 'Fasting';
            } else if (item.value_type == 1) {
                valueType = 'Hour after meal';
            } else if (item.value_type == 2) {
                valueType = 'Random blood sugar';
            }
            return `
            <table class="meas-table">
                <tr>
                    <th>Measurement</th>
                    <th>Result</th>
                </tr>
                 <tr>
                    <td>Blood sugar</td>
                    <td>${item.value} mmol/L</td>
                </tr>
                <tr>
                    <td>Value type</td>
                    <td>${valueType}</td>
                </tr>             
                <tr>
                    <td>Uric acid </td>
                    <td>${item.ua} mmol/L</td>
                </tr>             
                <tr>
                    <td>Total cholesterol</td>
                    <td>${item.chol} mmol/L</td>
                </tr>             
                <tr>
                    <td>Hemoglobin</td>
                    <td>${item.hb} g/dL</td>
                </tr>             
            </table>`
        }).join('')}
            </div>
        </div>
        `;
        resultCont.append(meas);
    }

    if (categories === 'Waist to hip ratio') {
        meas.innerHTML = `
        <div class="meas-content">
            <div class="meas-titles">${categories}</div>
            <div class="meas-body">
                ${data.map((item) => {
            item.ratio = item.waistline / item.hipline;
            return `
            <table class="meas-table">
                <tr>
                    <th>Measurement</th>
                    <th>Result</th>
                </tr>
                 <tr>
                    <td>Waistline</td>
                    <td>${item.waistline} cm</td>
                </tr>
                <tr>
                    <td>Hipline</td>
                    <td>${item.hipline} cm</td>
                </tr>             
                <tr>
                    <td>Ratio</td>
                    <td>${item.ratio.toFixed(2)}</td>
                </tr>                   
            </table>`
        }).join('')}
            </div>
        </div>
        `;
        resultCont.append(meas);
    }

    if (categories === 'Urinalysis') {
        meas.innerHTML = `
        <div class="meas-content">
            <div class="meas-titles">${categories}</div>
             <div class="meas-body ${buttonState == 'inactive' ? '' : 'overflow'}">
                ${data.map((item) => {
            return `
            <table class="meas-table">
                <tr>
                    <th>Measurement</th>
                    <th>Result</th>
                </tr>
                 <tr>
                    <td>White blood cells</td>
                    <td>${item.leu}/td>
                </tr>
                <tr>
                    <td>Occult blood</td>
                    <td>${item.bld}</td>
                </tr>             
                <tr>
                    <td>pH value</td>
                    <td>${item.ph} pH</td>
                </tr>                   
                <tr>
                    <td>Protein</td>
                    <td>${item.pro}</td>
                </tr>                   
                <tr>
                    <td>Urobilinogen</td>
                    <td>${item.ubg}</td>
                </tr>                   
                <tr>
                    <td>Nitrite</td>
                    <td>${item.nit}</td>
                </tr>                   
                <tr>
                    <td>Vitamin C</td>
                    <td>${item.vc == `` ? `unknow` : item.vc}</td>
                </tr>                   
                <tr>
                    <td>Glucose</td>
                    <td>${item.glu}</td>
                </tr>                   
                <tr>
                    <td>Bilirubin</td>
                    <td>${item.bil}</td>
                </tr>                   
                <tr>
                    <td>Ketone bodies</td>
                    <td>${item.ket}</td>
                </tr>                   
                <tr>
                    <td>Specific Gravity</td>
                    <td>${item.sg}</td>
                </tr>                   
                <tr>
                    <td>Microalbumin</td>
                    <td>${item.ma}</td>
                </tr>                   
                <tr>
                    <td>Creatinine</td>
                    <td>${item.cre}</td>
                </tr>                   
                <tr>
                    <td>Calcium ion</td>
                    <td>${item.ca}</td>
                </tr>                   
            </table>`
        }).join('')}
            </div>
        </div>
        `;
        resultCont.append(meas);
    }

    if (categories === 'Traditional Chinese Medicine Constitution Identification') {
        meas.innerHTML = `
        <div class="meas-content">
            <div class="meas-titles">${categories}</div>
            <div class="meas-body">
                ${data.map((item) => {
            return `
                    <table class="meas-table">
                        <tr>
                            <th>Measurement</th>
                            <th>Result</th>
                        </tr>
                        <tr>
                            <td>Text description of the physical type</td>
                            <td>${item.type}</td>
                        </tr>                 
                    </table>`
        }).join('')}
            </div>
        </div>
        `;
        resultCont.append(meas);
    }

    if (categories === 'ECG analysis') {
        meas.innerHTML = `
        <div class="meas-content">
            <div class="meas-titles">${categories}</div>
            <div class="meas-body ${buttonState == 'inactive' ? '' : 'overflow'}">
            ${data.map((item) => {
            return `
            <table class="meas-table">
                <tr>
                    <th>Measurement</th>
                    <th>Result</th>
                </tr>
                 <tr>
                    <td>Heart rate</td>
                    <td>${item.hr} bpm</td>
                </tr>
                <tr>
                    <td>Wave width (Wave width)</td>
                    <td>${item.p} s</td>
                </tr>
                 <tr>
                    <td>PR Interval (period)</td>
                    <td>${item.pr} ms</td>
                </tr>
                <tr>
                    <td>QRS Duration (time)</td>
                    <td>${item.qrs} ms</td>
                </tr>
                 <tr>
                    <td>QT Interval (period)</td>
                    <td>${item.qt} ms</td>
                </tr>
                <tr>
                    <td>QTc Interval (period)</td>
                    <td>${item.qtc} ms</td>
                </tr>
                 <tr>
                    <td>P Axis (wave electric axis)</td>
                    <td>${item.pa}</td>
                </tr>
                <tr>
                    <td>QRS Axis (wave electric axis)</td>
                    <td>${item.qrsa}</td>
                </tr>         
                <tr>
                    <td>T Axis (wave electric axis)</td>
                    <td>${item.ta}</td>
                </tr>         
                <tr>
                    <td>RV5 (Voltage)</td>
                    <td>${item.rv5} mV</td>
                </tr>         
                <tr>
                    <td>SV1 (Voltage)</td>
                    <td>${item.sv1} mV</td>
                </tr>         
                <tr>
                    <td>RV5+SV1 (The sum of the absolute values of the amplitudes)</td>
                    <td>${item.rv5sv1}  mV</td>
                </tr>         
            </table>`
        }).join('')}
            </div>
        </div>
        `;
        resultCont.append(meas);
    }

    if (categories === 'Four items of blood lipids') {
        meas.innerHTML = `
        <div class="meas-content">
            <div class="meas-titles">${categories}</div>
            <div class="meas-body">
                ${data.map((item) => {
            return `
                    <table class="meas-table">
                <tr>
                    <th>Measurement</th>
                    <th>Result</th>
                </tr>
                <tr>
                    <td>Total cholesterol</td>
                    <td>${item.chol} mmol/L</td>
                </tr>         
                <tr>
                    <td>HDL</td>
                    <td>${item.hdl} mmol/L</td>
                </tr>         
                <tr>
                    <td>Low-density lipoprotein</td>
                    <td>${item.ldl} mmol/L</td>
                </tr>         
                <tr>
                    <td>Triglycerides</td>
                    <td>${item.trig} mmol/L</td>
                </tr>         
            </table>`
        }).join('')}
            </div>
        </div>
        `;
        resultCont.append(meas);
    }

    if (categories === 'Vision measurement') {
        meas.innerHTML = `
    <div class="meas-content">
        <div class="meas-titles">${categories}</div>
            <div class="meas-body">
            ${data.map((item) => {
            return `
                    <table class="meas-table">
                <tr>
                    <th>Measurement</th>
                    <th>Result</th>
                </tr>
                <tr>
                    <td>Left eye vision</td>
                    <td>${item.eLeft}</td>
                </tr>         
                <tr>
                    <td>Right eye vision</td>
                    <td>${item.eRight}</td>
                </tr>         
                <tr>
                    <td>Astigmatism in left eye</td>
                    <td>${item.lLeft}</td>
                </tr>
                <tr>
                    <td>Astigmatism in the right eye</td>
                    <td>${item.lRight}</td>
                </tr>         
                <tr>
                    <td>Color blindness probability</td>
                    <td>${item.color} %</td>
                </tr>         
            </table>`
        }).join('')}
            </div>
    </div>
    `
        resultCont.append(meas);
    }

    if (categories === 'Psychological Testing SDS') {
        meas.innerHTML = `
        <div class="meas-content">
            <div class="meas-titles">${categories}</div>
            <div class="meas-body">
                ${data.map((item) => {
            return `
                    <table class="meas-table">
                <tr>
                    <th>Measurement</th>
                    <th>Result</th>
                </tr>
                <tr>
                    <td>Standard total score</td>
                    <td>${item.score}</td>
                </tr>          
            </table>`
        }).join('')}
            </div>
        </div>
        `;
        resultCont.append(meas);
    }

    if (categories === 'Glycated hemoglobin test') {
        meas.innerHTML = `
        <div class="meas-content">
            <div class="meas-titles">${categories}</div>
            <div class="meas-body">
                ${data.map((item) => {
            return `
                    <table class="meas-table">
                <tr>
                    <th>Measurement</th>
                    <th>Result</th>
                </tr>
                <tr>
                    <td>Glycated hemoglobin value</td>
                    <td>${item.value}</td>
                </tr>          
            </table>`
        }).join('')}
            </div>
        </div>
        `;
        resultCont.append(meas);
    }

    if (categories === 'Spirometry test') {
        meas.innerHTML = `
        <div class="meas-content">
            <div class="meas-titles">${categories}</div>
            <div class="meas-body">
                ${data.map((item) => {
            return `
                    <table class="meas-table">
                <tr>
                    <th>Measurement</th>
                    <th>Result</th>
                </tr>
                <tr>
                    <td>PEF</td>
                    <td>${item.pef} L/min</td>
                </tr>          
                <tr>
                    <td>PEF%</td>
                    <td>${item.pef_} %</td>
                </tr>          
                <tr>
                    <td>FEV1</td>
                    <td>${item.fev1} L</td>
                </tr>          
                <tr>
                    <td>FEV1%</td>
                    <td>${item.fev1_} %</td>
                </tr>          
                <tr>
                    <td>FVC</td>
                    <td>${item.fvc} L</td>
                </tr>          
                <tr>
                    <td>FEV1/FVC</td>
                    <td>${item.fvc_} %</td>
                </tr>          
            </table>`
        }).join('')}
            </div>
        </div>
        `;
        resultCont.append(meas);
    }

    if (categories === 'Alcohol content test') {
        meas.innerHTML = `
    <div class="meas-content">
        <div class="meas-titles">${categories}</div>
            <div class="meas-body">
            ${data.map((item) => {
            return `
                    <table class="meas-table">
                <tr>
                    <th>Measurement</th>
                    <th>Result</th>
                </tr>
                <tr>
                    <td>Alcohol content</td>
                    <td>${item.value}mg/100ml</td>
                </tr>               
            </table>`
        }).join('')}
            </div>
    </div>
    `
        resultCont.append(meas);
    }

    if (categories === 'Bone density') {
        meas.innerHTML = `
    <div class="meas-content">
        <div class="meas-titles">${categories}</div>
            <div class="meas-body">
            ${data.map((item) => {
            return `
                    <table class="meas-table">
                <tr>
                    <th>Measurement</th>
                    <th>Result</th>
                </tr>
                <tr>
                    <td>Body age</td>
                    <td>${item.bodyAge}</td>
                </tr>               
                <tr>
                    <td>Body month</td>
                    <td>${item.bodyMonth}</td>
                </tr>               
                <tr>
                    <td>zScore</td>
                    <td>${item.zScore}</td>
                </tr>               
                <tr>
                    <td>zRatio</td>
                    <td>${item.zRatio}</td>
                </tr>               
            </table>`
        }).join('')}
            </div>
    </div>
    `
        resultCont.append(meas);
    }

    if (categories === 'Bone quality is average') {
        meas.innerHTML = `
    <div class="meas-content">
        <div class="meas-titles">${categories}</div>
            <div class="meas-body">
            ${data.map((item) => {
            return `
                    <table class="meas-table">
                <tr>
                    <th>Measurement</th>
                    <th>Result</th>
                </tr>
                <tr>
                    <td>T-score</td>
                    <td>${item.tScore}</td>
                </tr>               
                <tr>
                    <td>Bone Strength Index</td>
                    <td>${item.bqi}</td>
                </tr>               
                <tr>
                    <td>Expected age of onset of osteoporosis</td>
                    <td>${item.eoa}</td>
                </tr>               
                <tr>
                    <td>Predicted height</td>
                    <td>${item.p_Height}</td>
                </tr>               
            </table>`
        }).join('')}
            </div>
    </div>
    `
        resultCont.append(meas);
    }

}

const createFilter = (filter) => {
    const filterButton = document.createElement("a");
    filterButton.className = "filter-button";
    filterButton.innerText = filter;
    filterButton.setAttribute('data-state', 'inactive');
    filterButton.addEventListener("click", (e) =>
        handleButtonClick(e, filter)
    );
    filterCont.append(filterButton);
};

const resetFilterButtons = (currentButton) => {
    const filterButtons = document.querySelectorAll('.filter-button');
    [...filterButtons].map(button => {
        if (button != currentButton) {
            button.classList.remove('is-active');
            button.setAttribute('data-state', 'inactive')
        }
    })
}

const handleButtonClick = (e, param) => {
    const button = e.target;
    const buttonState = button.getAttribute('data-state');
    resetFilterButtons(button);

    if (buttonState == 'inactive') {
        button.classList.add('is-active');
        button.setAttribute('data-state', 'active');
        handleFilterPosts(param, buttonState)
    } else {
        button.classList.remove('is-active');
        button.setAttribute('data-state', 'inactive')
        resetPosts()
    }
}

const handleFilterPosts = (param, buttonState) => {
    let filteredMeas = [...measData].filter(meas => meas.categories.includes(param))

    resultCont.innerHTML = "";
    filteredMeas.map(meas => createMeas(meas, buttonState))
};

const resetPosts = () => {
    resultCont.innerHTML = "";
    measData.map((meas) => createMeas(meas));
}

function calculateBMI(weight, heightCm) {
    const height = heightCm / 100;
    const bmi = weight / (height * height);
    let category;
    if (bmi < 18.5) {
        category = "Underweight";
    } else if (bmi >= 18.5 && bmi < 25) {
        category = "Normal weight";
    } else if (bmi >= 25 && bmi < 30) {
        category = "Overweight";
    } else {
        category = "Obesity";
    }
    return { bmi: bmi.toFixed(2), category };
}

window.onclick = function (event) {
    if (event.target == document.querySelector('.modal')) {
        document.querySelector('.modal').style.display = "none";
    }
}

function isJson(data) {
    try {
        return JSON.parse(data);
    }
    catch (e) {
        return undefined;
    }
}
function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

function addItem(name, id) {
    caselistContainer.innerHTML += `<div class="caselist-wrapper" id="list-item${id}">
          <div class="caselist-content">
            <div class="caselist-Id">
              <span>Id: </span> ${id}
            </div>
            <div class="caselist-topic"><span>Topic: </span>${name}</div>
            <button class="caselist-btn">Accept</button>
          </div>
        </div>`

    const caselistBtn = document.querySelector('.caselist-btn');
    caselistBtn.addEventListener('click', () => {
        acceptCase(id);
    })

}

function acceptCase(_caseId) {
    //Ask for state
    let pl = {
        cmd: command.askCaseState,
        param: {
            caseId: _caseId
        }
    };
    socket.send(JSON.stringify(pl));
    // window.open(`http://127.0.0.1:3001/room/${_caseId}`, '_blank');
}



// *********************** rtc ****************************************
var socketRTC = null;
let peerConnections = {};
let keyConnections = [];
let localStream;
let mute = false;
let camera = true;
let currentCam;
let hasJoinedRoom = false;

async function startRTC() {
    socketRTC = io.connect(`https://${mainIP}:3001`);
    mainContainer.className = `app-container hide`;
    patientContainer.className = `app-container active`;

    getMedia();

    socketRTC.on('user-connected', socketId => {
        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' }
            ]
        });
        peerConnections[socketId] = peerConnection;
        keyConnections.push(socketId);

        peerConnection.addStream(localStream);

        // Get the video sender from the peer connection
        const videoSender = peerConnection.getSenders().find(sender => sender.track.kind === 'video');

        // Set the desired bitrate for the video
        if (videoSender) {
            const parameters = videoSender.getParameters();
            if (!parameters.encodings) {
                parameters.encodings = [{}];
            }
            // Set the max bitrate to 1 Mbps (1000 kbps)
            parameters.encodings[0].maxBitrate = 50000000000000; // in bits per second
            videoSender.setParameters(parameters)
                .then(() => {
                    console.log('Bitrate set successfully');
                })
                .catch(error => {
                    console.error('Failed to set bitrate:', error);
                });
        }

        peerConnection.createOffer().then(offer => {
            peerConnection.setLocalDescription(offer);
            socketRTC.emit('offer', { offer, socketId });
        });

        peerConnection.ontrack = event => {
            if (!document.getElementById(socketId)) {
                const video = document.createElement('video');
                let videoElem = document.createElement('div');
                videoElem.id = `${socketId}`;
                videoElem.className = `video-participant`;
                let nameTag = document.createElement('a');
                nameTag.innerHTML = `User`;
                nameTag.className = `name-tag`;
                video.autoplay = true;
                video.srcObject = event.streams[0];
                video.setAttribute('playsinline', 'playsinline');
                videoElem.appendChild(nameTag);
                videoElem.appendChild(video);
                videoWrapper.appendChild(videoElem);
            }
        };

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socketRTC.emit('candidate', { candidate: event.candidate, socketId });
            }
        };

    })

    socketRTC.on('offer', ({ offer, socketId }) => {
        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' }
            ]
        });
        peerConnections[socketId] = peerConnection;
        keyConnections.push(socketId);

        peerConnection.addStream(localStream);
        // peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        // Get the video sender from the peer connection
        const videoSender = peerConnection.getSenders().find(sender => sender.track.kind === 'video');

        // Set the desired bitrate for the video
        if (videoSender) {
            const parameters = videoSender.getParameters();
            if (!parameters.encodings) {
                parameters.encodings = [{}];
            }
            // Set the max bitrate to 1 Mbps (1000 kbps)
            parameters.encodings[0].maxBitrate = 5000000; // in bits per second
            videoSender.setParameters(parameters)
                .then(() => {
                    console.log('Bitrate set successfully');
                })
                .catch(error => {
                    console.error('Failed to set bitrate:', error);
                });
        }

        if (peerConnection.signalingState === 'stable') {
            peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
                .then(() => {
                    return peerConnection.createAnswer();
                })
                .then((answer) => {
                    return peerConnection.setLocalDescription(answer);
                })
                .then(() => {
                    socketRTC.emit('answer', { answer: peerConnection.localDescription, socketId });
                })
                .catch(error => {
                    console.error('Error handling offer:', error);
                });
        } else {
            console.warn(`Cannot handle offer, unexpected state: ${peerConnection.signalingState}`);
        }

        // peerConnection.createAnswer().then(answer => {
        //     peerConnection.setLocalDescription(answer);
        //     socketRTC.emit('answer', { answer, socketId });
        // });

        peerConnection.ontrack = event => {
            if (!document.getElementById(socketId)) {
                const video = document.createElement('video');
                let videoElem = document.createElement('div');
                videoElem.id = `${socketId}`;
                videoElem.className = `video-participant`;
                let nameTag = document.createElement('a');
                nameTag.innerHTML = `User`;
                nameTag.className = `name-tag`;
                video.muted = false;
                video.autoplay = true;
                video.setAttribute('playsinline', 'playsinline');
                video.srcObject = event.streams[0];
                videoElem.appendChild(nameTag);
                videoElem.appendChild(video);
                videoWrapper.appendChild(videoElem);
            }
        };

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socketRTC.emit('candidate', { candidate: event.candidate, socketId });
            }
        };
    });


    socketRTC.on('answer', ({ answer, socketId }) => {
        // peerConnections[socketId].setRemoteDescription(new RTCSessionDescription(answer));
        const peerConnection = peerConnections[socketId];
        if (peerConnection.signalingState == 'have-local-offer') {
            peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
                .catch(error => {
                    console.error('Failed to set remote description:', error);
                });
        } else {
            console.warn(`Skipping setting remote description, unexpected state: ${peerConnection.signalingState}`);
        }
    });

    socketRTC.on('candidate', ({ candidate, socketId }) => {
        peerConnections[socketId].addIceCandidate(new RTCIceCandidate(candidate));
    });

    socketRTC.on('user-disconnected', socketId => {
        const video = document.getElementById(socketId);
        if (video) {
            video.remove();
        }
        if (peerConnections[socketId]) {
            peerConnections[socketId].close();
            delete peerConnections[socketId];
        }
    })

    socketRTC.on('update-user-count', count => {
        const videoMe = document.getElementById(`${socketRTC.id}`);
        if (count == 1) {
            videoMe.className = `video-participant`;
            videoWrapper.className = `video-call-wrapper`;
        } else if (count == 2) {
            videoMe.className = `video-participant video-small`;
            videoWrapper.className = `video-call-wrapper video-two`;
        } else if (count == 3) {
            videoMe.className = `video-participant video-small`;
            videoWrapper.className = `video-call-wrapper video-three`;
        } else if (count == 4) {
            videoMe.className = `video-participant`;
            videoWrapper.className = `video-call-wrapper video-four`;
        }
    });

    socketRTC.on('message', ({ msg, socketId, time }) => {
        if (msg == 'joined') {
            chatArea.innerHTML += `<div class="message-wrapper">
                            <div class="message-content">
                                <p class="name">Bot | ${time}</p>
                                <div class="message">${socketId} joined the room.</div>
                            </div>
                        </div>`
            chatArea.scrollTop = chatArea.scrollHeight;
        } else if (msg == 'left') {
            chatArea.innerHTML += `<div class="message-wrapper">
                            <div class="message-content">
                                <p class="name">Bot | ${time}</p>
                                <div class="message">${socketId} left the room.</div>
                            </div>
                        </div>`
            chatArea.scrollTop = chatArea.scrollHeight;
        } else if (socketRTC.id == socketId) {
            chatArea.innerHTML += `<div class="message-wrapper reverse">
                            <div class="message-content">
                                <p class="name">${socketId} | ${time}</p>
                                <div class="message">${msg}</div>
                            </div>
                        </div>`
            chatArea.scrollTop = chatArea.scrollHeight;
        } else {
            chatArea.innerHTML += `<div class="message-wrapper">
                            <div class="message-content">
                                <p class="name">${socketId} | ${time}</p>
                                <div class="message">${msg}</div>
                            </div>
                        </div>`
            chatArea.scrollTop = chatArea.scrollHeight;
        }

    });


}

// getting the medias
async function getMedia(cameraId, micId) {
    currentCam = cameraId == null ? currentCam : cameraId;

    const initialConstraints = {
        video: true,
        audio: true
    };

    const preferredCameraConstraints = {
        video: {
            deviceId: cameraId
        },
        audio: true
    };

    const videoOption = currentCam ? {
        deviceId: currentCam
    } : true;

    const preferredMicConstraints = {
        video: videoOption,
        audio: {
            deviceId: micId
        },
    };

    try {
        // Check if any media devices are available
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasAudioInput = devices.some(device => device.kind === 'audioinput');
        const hasVideoInput = devices.some(device => device.kind === 'videoinput');
        // Set constraints based on available devices
        const constraints = cameraId || micId
            ? (cameraId ? preferredCameraConstraints : preferredMicConstraints)
            : initialConstraints;
        if (hasAudioInput || hasVideoInput) {
            // Attempt to get media if at least one device is available
            localStream = await navigator.mediaDevices.getUserMedia(constraints);
            displayMedia();
        } else {
            console.log('No camera or microphone connected. Joining without media.');
        }

        // Emit room join event regardless of media connection
        socketRTC.emit('join-room', yourCase);


        // localStream = await window.navigator.mediaDevices.getUserMedia(cameraId || micId ? cameraId ? preferredCameraConstraints : preferredMicConstraints : initialConstraints);
        // displayMedia();
        // getAllCameras();
        // getAllMics();
        // socket.emit('media-update', { cameraId, micId });
        // room joining event
        // socketRTC.emit('join-room', currentCase);

    } catch (err) {
        console.log(`Error accessing media devices: ${err}`);
        alert(`Media error: ${err.message}. Joining room without media.`);

        // Emit room join event even if there is an error accessing media
        socketRTC.emit('join-room', yourCase);
    }
};



function displayMedia() {
    let video = document.getElementById(`${socketRTC.id}`);
    if (!video) {
        let videoElem = document.createElement('div');
        videoElem.id = `${socketRTC.id}`;
        videoElem.className = `video-participant`;
        let nameTag = document.createElement('a');
        nameTag.innerHTML = `(Me)`;
        nameTag.className = `name-tag`;
        video = document.createElement('video');
        video.muted = true;
        video.autoplay = true;
        video.setAttribute('playsinline', 'playsinline');
        videoElem.appendChild(nameTag);
        videoElem.appendChild(video);
        videoWrapper.appendChild(videoElem);
    }
    video.srcObject = localStream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
}

btnCamera.addEventListener('click', () => {
    if (camera) {
        camera = false;
        localStream.getVideoTracks()[0].enabled = false;
        btnCamera.innerHTML = `<i class='bx bxs-video-off'></i>`
        btnCamera.className = `video-action-button `;
    } else {
        camera = true;
        localStream.getVideoTracks()[0].enabled = true;
        btnCamera.innerHTML = `<i class='bx bxs-video'></i>`
        btnCamera.className = `video-action-button main`;
    }
})

btnMic.addEventListener('click', () => {
    if (mute) {
        mute = false;
        localStream.getAudioTracks()[0].enabled = true;
        console.log(localStream.getAudioTracks());
        btnMic.innerHTML = `<i class='bx bxs-microphone'></i>`;
        btnMic.className = `video-action-button main`;
    } else {
        mute = true;
        localStream.getAudioTracks()[0].enabled = false;
        btnMic.innerHTML = `<i class='bx bxs-microphone-off'></i>`;
        btnMic.className = `video-action-button`;
    }
})

btnMedical.addEventListener('click', () => {
    document.querySelector('.modal').style.display = 'block';
})


chatSend.addEventListener('click', () => {
    const msg = chatInput.value.trim();
    if (msg) {
        socketRTC.emit('message', msg, socketRTC.id, currentCase);
        chatInput.value = '';
        chatInput.focus();
    }
});

chatInput.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        chatSend.click();
    }
});

btnEnd.addEventListener('click', function (e) {
    let pl = {
        cmd: command.endCase,
        param: {
            caseId: currentCase
        }
    };
    socket.send(JSON.stringify(pl));
    keyConnections.forEach(key => {
        const video = document.getElementById(key);
        if (video) {
            video.remove();
        }
    });
    const video = document.getElementById(socketRTC.id);
    if (video) {
        video.remove();
        socketRTC.disconnect();
    }
    keyConnections = []
    ResetView();
});


