const videoWrapper = document.getElementById('videos');
const btnMic = document.getElementById('btnMic');
const btnCamera = document.getElementById('btnCamera');
// const selectCamera = document.getElementById('selectCamera');
// const selectMic = document.getElementById('selectMic');
const chatSend = document.getElementById('chatSend');
const chatInput = document.getElementById('chatInput');
const chatArea = document.getElementById('chatArea');

const socket = io();
let peerConnections = {};
let localStream;
let mute = false;
let camera = true;
let currentCam;
let hasJoinedRoom = false;

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

        if (!hasJoinedRoom) {
            // room joining event
            socket.emit('join-room', yourCase);
            hasJoinedRoom = true;
        }

    } catch (err) {
        console.log(err);
    }
};

getMedia();

socket.on('user-connected', socketId => {
    const peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' }
        ]
    });
    peerConnections[socketId] = peerConnection;

    peerConnection.addStream(localStream);


    peerConnection.createOffer().then(offer => {
        peerConnection.setLocalDescription(offer);
        socket.emit('offer', { offer, socketId });
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
            socket.emit('candidate', { candidate: event.candidate, socketId });
        }
    };

})

socket.on('offer', ({ offer, socketId }) => {
    const peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' }
        ]
    });
    peerConnections[socketId] = peerConnection;

    peerConnection.addStream(localStream);
    // peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    if (peerConnection.signalingState === 'stable') {
        peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
            .then(() => {
                return peerConnection.createAnswer();
            })
            .then(answer => {
                return peerConnection.setLocalDescription(answer);
            })
            .then(() => {
                socket.emit('answer', { answer: peerConnection.localDescription, socketId });
            })
            .catch(error => {
                console.error('Error handling offer:', error);
            });
    } else {
        console.warn(`Cannot handle offer, unexpected state: ${peerConnection.signalingState}`);
    }

    peerConnection.createAnswer().then(answer => {
        peerConnection.setLocalDescription(answer);
        socket.emit('answer', { answer, socketId });
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
            video.muted = true;
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
            socket.emit('candidate', { candidate: event.candidate, socketId });
        }
    };
});


socket.on('answer', ({ answer, socketId }) => {
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

socket.on('candidate', ({ candidate, socketId }) => {
    peerConnections[socketId].addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on('user-disconnected', socketId => {
    const video = document.getElementById(socketId);
    if (video) {
        video.remove();
    }
    if (peerConnections[socketId]) {
        peerConnections[socketId].close();
        delete peerConnections[socketId];
    }
})

socket.on('update-user-count', count => {
    const videoMe = document.getElementById(`${socket.id}`);
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

socket.on('media-update', ({ cameraId, micId, socketId }) => {
    if (peerConnections[socketId]) {
        getMedia(cameraId, micId).then(() => {
            updateMediaTracks();
        });
    }
});

socket.on('message', ({ msg, socketId, time }) => {
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
    } else if (socket.id == socketId) {
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


function displayMedia() {
    let video = document.getElementById(`${socket.id}`);
    if (!video) {
        let videoElem = document.createElement('div');
        videoElem.id = `${socket.id}`;
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

// get all cameras
async function getAllCameras() {
    const currentCamera = localStream.getVideoTracks()[0];
    const allDevices = await window.navigator.mediaDevices.enumerateDevices();
    selectCamera.innerHTML = '';
    allDevices.forEach(device => {
        if (device.kind === 'videoinput') {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.textContent = device.label;
            option.selected = device.label == currentCamera.label;
            selectCamera.appendChild(option);
        }
    });
}

// get all mics
async function getAllMics() {
    const currentMic = localStream.getAudioTracks()[0];
    const allDevices = await window.navigator.mediaDevices.enumerateDevices();
    selectMic.innerHTML = '';
    allDevices.forEach(device => {
        if (device.kind === 'audioinput') {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.textContent = device.label;
            option.selected = device.label == currentMic.label;
            selectMic.appendChild(option);
        }
    });
}


// selectCamera.addEventListener('change', async () => {
//     await getMedia(selectCamera.value, selectMic.value);
//     updateMediaTracks();
// });

// selectMic.addEventListener('change', async () => {
//     await getMedia(selectCamera.value, selectMic.value);
//     updateMediaTracks();
// });

function updateMediaTracks() {
    for (let socketId in peerConnections) {
        let videoTrack = localStream.getVideoTracks()[0];
        let audioTrack = localStream.getAudioTracks()[0];
        let senders = peerConnections[socketId].getSenders();

        senders.forEach(sender => {
            if (sender.track.kind == 'video') {
                sender.replaceTrack(videoTrack);
            } else if (sender.track.kind == 'audio') {
                sender.replaceTrack(audioTrack);
            }
        });

        // Inform the other user about the change in media
        socket.emit('media-update', { cameraId: selectCamera.value, micId: selectMic.value, socketId });
    }
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
        socket.emit('message', msg, socket.id, yourCase);
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

