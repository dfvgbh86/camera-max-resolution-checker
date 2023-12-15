const videoElement = document.getElementById('video');
const cameraList = document.getElementById('cameraList');
const resolutionDisplay = document.getElementById('resolution');

function getCameras() {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            cameraList.innerHTML = ''; // Clear the list before adding new options
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            videoDevices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${cameraList.length + 1}`;
                cameraList.appendChild(option);
            });
            setupCamera();
        });
}

// Request access to the user's webcam
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        videoElement.srcObject = stream;
        window.stream = stream; // make stream available to browser console
        getCameras();
    })
    .catch(error => {
        console.error('Error accessing media devices.', error);
    });

cameraList.onchange = () => {
    setupCamera()
};

function setupCamera () {
    if (cameraList.value) {
        startCamera({
            video: {
                deviceId: { exact: cameraList.value },
                width: { ideal: 4096 },
                height: { ideal: 2160 },
                aspectRatio: {
                    ideal: 1.7777777778
                },
            }
        });
    }
}

function startCamera(constraints) {
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.stop();
        });
    }

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            window.stream = stream;
            videoElement.srcObject = stream;
            videoElement.style.display = 'block';
            videoElement.onloadedmetadata = () => {
                resolutionDisplay.textContent = `Resolution: ${videoElement.videoWidth} x ${videoElement.videoHeight}`;
                resolutionDisplay.style.display = 'block';
            };
        })
        .catch(error => {
            console.error('Error accessing media devices.', error);
            resolutionDisplay.textContent = `Error: ${error.message}`;
            resolutionDisplay.style.display = 'block';
        });
}
