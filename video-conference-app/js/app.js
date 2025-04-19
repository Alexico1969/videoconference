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

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDOCAbC123dEf456GhI77-fb_CA",
    authDomain: "vid1969-33eba.firebaseapp.com",
    databaseURL: "https://vid1969-33eba.firebaseio.com",
    projectId: "vid1969-33eba",
    storageBucket: "vid1969-33eba.appspot.com",
    messagingSenderId: "985506151913",
    appId: "1:985506151913:web:dd24b494ca4d6514b8c723"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

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
                database.ref('candidates').push(JSON.stringify(event.candidate));
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

// Listen for ICE candidates
database.ref('candidates').on('child_added', snapshot => {
    const candidate = new RTCIceCandidate(JSON.parse(snapshot.val()));
    peerConnections.forEach(pc => pc.addIceCandidate(candidate));
});

function hangup() {
    peerConnections.forEach(pc => pc.close());
    peerConnections = [];
    localStream.getTracks().forEach(track => track.stop());
    localVideo.srcObject = null;
    remoteVideos.forEach(video => video.srcObject = null);
}

document.addEventListener("DOMContentLoaded", async () => {
    const localVideo = document.getElementById('localVideo');
    const remoteVideos = [
        document.getElementById('remoteVideo1'),
        document.getElementById('remoteVideo2')
    ];

    const peer = new Peer(); // Create a new PeerJS instance
    let localStream;

    // Get local media stream
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;

    // Handle incoming calls
    peer.on('call', call => {
        call.answer(localStream); // Answer the call with your local stream
        call.on('stream', remoteStream => {
            // Display the remote stream in an available video element
            const remoteVideo = remoteVideos.find(video => !video.srcObject);
            if (remoteVideo) {
                remoteVideo.srcObject = remoteStream;
            }
        });
    });

    // Start a call
    document.getElementById('startButton').addEventListener('click', () => {
        const remotePeerId = prompt('Enter the ID of the peer to call:');
        const call = peer.call(remotePeerId, localStream);
        call.on('stream', remoteStream => {
            const remoteVideo = remoteVideos.find(video => !video.srcObject);
            if (remoteVideo) {
                remoteVideo.srcObject = remoteStream;
            }
        });
    });

    // Display your PeerJS ID
    peer.on('open', id => {
        alert(`Your PeerJS ID is: ${id}`);
    });

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

        const biggerBtn = wrapper.querySelector(".bigger-btn");
        const smallerBtn = wrapper.querySelector(".smaller-btn");
        const defaultBtn = wrapper.querySelector(".default-btn");

        // Ensure buttons exist before adding event listeners
        if (biggerBtn && smallerBtn && defaultBtn) {
            biggerBtn.addEventListener("click", () => {
                wrapper.style.transform = "scale(2)"; // 200% size
            });

            smallerBtn.addEventListener("click", () => {
                wrapper.style.transform = "scale(0.5)"; // 50% size
            });

            defaultBtn.addEventListener("click", () => {
                wrapper.style.transform = "scale(1)"; // Reset to original size
            });
        }
    });

    const wrapperLocal = document.getElementById("wrapper-local");
    const wrapperRemote1 = document.getElementById("wrapper-remote1");
    const wrapperRemote2 = document.getElementById("wrapper-remote2");

    // Add event listeners for buttons inside each wrapper
    const biggerBtnLocal = wrapperLocal.querySelector(".bigger-btn");
    const smallerBtnLocal = wrapperLocal.querySelector(".smaller-btn");
    const defaultBtnLocal = wrapperLocal.querySelector(".default-btn");

    biggerBtnLocal.addEventListener("click", () => {
        wrapperLocal.style.transform = "scale(2)";
    });

    smallerBtnLocal.addEventListener("click", () => {
        wrapperLocal.style.transform = "scale(0.5)";
    });

    defaultBtnLocal.addEventListener("click", () => {
        wrapperLocal.style.transform = "scale(1)";
    });

    // Repeat for wrapperRemote1 and wrapperRemote2
});