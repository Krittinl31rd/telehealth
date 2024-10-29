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

const waitingContainer = document.getElementById('waiting');
const actionContainer = document.getElementById('actionContainer');
const chooseContainer = document.getElementById('chooseContainer');
const consultContainer = document.getElementById('consultContainer');
const choosePrimaryContainer = document.getElementById('choosePrimaryContainer');
const patientContainer = document.getElementById('patientContainer');
const mainContainer = document.getElementById('mainCotainer');
const acceptInfo = document.getElementById('acceptInfo');
const rejectInfo = document.getElementById('rejectInfo');

const backBtn = document.querySelector('.backBtn');
const chooseDoctor = document.getElementById('chooseDoctor');
const consultDoctor = document.getElementById('consultDoctor');
const choosePrimaryDoctor = document.getElementById('choosePrimaryDoctor');

// Create WebSocket connection.
var socket = null;
// const machineId = getCookie('machineId');
// const mcnUsername = getCookie('mcnUsername');
// const mcnPassword = getCookie('mcnPassword');

const mcnUsername = localStorage.getItem('mcnUsername');
const mcnPassword = localStorage.getItem('mcnPassword');

var yourCase = localStorage.getItem("caseId") || "";
var yourId = localStorage.getItem("yourIden") || "";
function Connect() {
    // ResetView();
    socket = new WebSocket(`wss://${mainIP}:1231/echo`);


    // Connection opened
    socket.addEventListener("open", (event) => {
        if (yourCase != "" && yourId != "") {
            let pl = {
                cmd: command.machinelogin,
                param: {
                    // machineid: machineId,
                    username: mcnUsername,
                    password: mcnPassword
                }
            };
            socket.send(JSON.stringify(pl));
            startRTC()
        } else {
            let pl = {
                cmd: command.machinelogin,
                param: {
                    // machineid: machineId,
                    username: mcnUsername,
                    password: mcnPassword
                }
            };
            socket.send(JSON.stringify(pl));
        }
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {
        console.log("Message from server ", event.data);
        CheckWebsocketCommand(event.data);
    });
    // Listen for messages
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
    yourCase = '';
    yourId = '';
    localStorage.setItem("yourIden", "")
    localStorage.setItem("caseId", "")

    mainContainer.className = `app-container active`;
    waitingContainer.className = `d-flex d-flex-column justify-content-center align-item-center`
    // actionContainer.className = `action-container active`;

    patientContainer.className = `app-container patient`;
    consultContainer.className = `doctor-container`;

    backBtn.className = `backBtn`;
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
    allowSensitiveInfo: 26, //Patient allow sensitive infomation
}

async function CheckWebsocketCommand(package) {
    //console.log(package.toString());
    let data = isJson(package);
    if (data != undefined) {
        if (data.cmd != undefined) {
            if (data.cmd == command.loginresult) {
                if (data.param != undefined) {
                    if (data.param.status == 1) {
                        alert('Login success', data.param.info.name);
                    }
                    else {
                        alert(data.param.message);
                    }
                }
            }
            if (data.cmd == command.endCase) {
                if (yourCase == data.param.caseId) {
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
                    ResetView()
                }
            }
            else if (data.cmd == command.acceptCase) {
                startRTC()
                console.log('Doctor accept your case.' + data.param.caseId);
            }
            else if (data.cmd == command.enableConsult) {
                if (data.param != undefined) {
                    const iden = data.param.iden;
                    yourId = iden;
                }
                configBtn.className = `config-btn none`;
                waitingContainer.className = `none`;
                actionContainer.className = `action-container active`;
            }
            // end call
            else if (data.cmd == command.disableConsult) {
                yourId = '';
                localStorage.setItem("yourIden", "")
                consultDoctor.disabled = true;
                ResetView()
                // consultbtn.style.display = 'none';
                // consultbtn.disabled = true;
            }
        }
    }
    else {

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

chooseDoctor.addEventListener('click', () => {
    actionContainer.className = `action-container`;
    backBtn.className = `backBtn active`;
    chooseContainer.className = `doctor-container active`;
})

consultDoctor.addEventListener('click', () => {
    actionContainer.className = `action-container`;
    backBtn.className = `backBtn active`;
    consultContainer.className = `doctor-container active`;
    if (socket.OPEN) {
        yourCase = uuidv4();
        let pl = {
            cmd: command.anouncCase,
            param: {
                //machineid: machineId,
                caseId: yourCase,
                iden: yourId
            }
        };
        socket.send(JSON.stringify(pl));
        console.log(pl.param.caseId);
    }
})

choosePrimaryDoctor.addEventListener('click', () => {
    actionContainer.className = `action-container`;
    backBtn.className = `backBtn active`;
    choosePrimaryContainer.className = `doctor-container active`;
})

backBtn.addEventListener('click', () => {
    backBtn.className = `backBtn`;
    actionContainer.className = `action-container active`;
    chooseContainer.className = `doctor-container`;
    consultContainer.className = `doctor-container`;
    choosePrimaryContainer.className = `doctor-container`;
})

acceptInfo.addEventListener('click', function (e) {
    let pl = {
        cmd: command.allowSensitiveInfo,
        param: {
            //machineid: machineId,
            caseId: yourCase,
            iden: yourId
        }
    };
    socket.send(JSON.stringify(pl));
    localStorage.setItem("yourIden", yourId)
    document.querySelector('.sensitive-info').className = `sensitive-info hide`;
});

rejectInfo.addEventListener('click', function (e) {
    document.querySelector('.sensitive-info').className = `sensitive-info hide`;
})


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
    socketRTC = null;
    socketRTC = io.connect(`https://${mainIP}:3001`);

    mainContainer.className = `app-container hide`;
    patientContainer.className = `app-container patient active`;

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
            parameters.encodings[0].maxBitrate = 5000000; // in bits per second
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

    getMedia();
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
        localStream = await window.navigator.mediaDevices.getUserMedia(cameraId || micId ? cameraId ? preferredCameraConstraints : preferredMicConstraints : initialConstraints);
        displayMedia();
        // getAllCameras();
        // getAllMics();
        // socket.emit('media-update', { cameraId, micId });
        // room joining event
        socketRTC.emit('join-room', yourCase);
    } catch (err) {
        console.log(err);
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
        if (localStorage.getItem("yourIden") == "") {
            setTimeout(() => {
                document.querySelector('.sensitive-info').className = `sensitive-info`;
            }, 3000);
        }
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


chatSend.addEventListener('click', () => {
    const msg = chatInput.value.trim();
    if (msg) {
        socketRTC.emit('message', msg, socketRTC.id, yourCase);
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
            caseId: yourCase
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
    ResetView()
});
