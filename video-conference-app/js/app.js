const localVideo = document.getElementById('localVideo');
const remoteVideos = [
    document.getElementById('remoteVideo1'),
    document.getElementById('remoteVideo2')
];
const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');

let localStream;
let peerConnections = [];
const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

startButton.onclick = start;
callButton.onclick = call;
hangupButton.onclick = hangup;

async function start() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
}

function call() {
    for (let i = 0; i < 3; i++) {
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnections.push(peerConnection);

        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                // Send the candidate to the remote peer
            }
        };

        peerConnection.ontrack = event => {
            remoteVideos[i].srcObject = event.streams[0];
        };

        peerConnection.createOffer().then(offer => {
            return peerConnection.setLocalDescription(offer);
        }).then(() => {
            // Send the offer to the remote peer
        });
    }
}

function hangup() {
    peerConnections.forEach(pc => pc.close());
    peerConnections = [];
    localStream.getTracks().forEach(track => track.stop());
    localVideo.srcObject = null;
    remoteVideos.forEach(video => video.srcObject = null);
}

document.addEventListener("DOMContentLoaded", () => {
    const videoWrappers = document.querySelectorAll(".video-wrapper");

    videoWrappers.forEach(wrapper => {
        wrapper.addEventListener("click", () => {
            // Remove fullscreen class from all wrappers
            document.querySelectorAll(".video-wrapper.fullscreen").forEach(fullscreenWrapper => {
                fullscreenWrapper.classList.remove("fullscreen");
            });

            // Toggle fullscreen for the clicked wrapper
            wrapper.classList.toggle("fullscreen");
        });
    });
});