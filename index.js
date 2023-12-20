const videoElement = document.getElementById('video');
const cameraList = document.getElementById('cameraList');
const resolutionList = document.getElementById('resolutionList');
const resolutionDisplay = document.getElementById('resolution');

function getCameras() {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            cameraList.innerHTML = '';
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            videoDevices.forEach((device, index) => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${index + 1}`;
                cameraList.appendChild(option);
            });

            if (videoDevices.length > 0) {
                startCameraWithDevice(videoDevices[0].deviceId);
            }
        });
}

function getResolutionConstraints() {
    const resolution = resolutionList.value;
    switch (resolution) {
        case 'uhd':
            return {
                width: { ideal: 4096 },
                aspectRatio: {
                    ideal: 1.7777777778,
                },
            };
        case 'fullhd':
            return { width: { ideal: 1920 }, height: { ideal: 1080 } };
        case 'hd':
            return { width: { ideal: 1280 }, height: { ideal: 720 } };
        case 'sd':
            return { width: { ideal: 640 }, height: { ideal: 480 } };
        default:
            return {
                width: { ideal: 4096 },
                aspectRatio: {
                    ideal: 1.7777777778,
                },
            };
    }
}

function startCameraWithDevice(deviceId) {
    const resolutionConstraints = getResolutionConstraints();
    const constraints = {
        video: {
            ...resolutionConstraints,
            deviceId: { exact: deviceId }
        }
    };

    startCamera(constraints);
}

cameraList.onchange = () => {
    if (cameraList.value) {
        startCameraWithDevice(cameraList.value);
    }
};

resolutionList.onchange = () => {
    if (cameraList.value) {
        startCameraWithDevice(cameraList.value);
    }
};

navigator.mediaDevices.getUserMedia({ video: {...getResolutionConstraints()} })
    .then(stream => {
        videoElement.srcObject = stream;
        window.stream = stream;
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
                aspectRatio: {
                    ideal: 1.7777777778
                },
            }
        });
    }
}

function startCamera(constraints) {
    if (window.stream && window.currentDeviceId === constraints.video.deviceId.exact) {
        const videoTrack = window.stream.getVideoTracks()[0];
        videoTrack.applyConstraints(constraints.video)
            .then(() => {
                updateStreamInfo();
            })
            .catch(error => {
                console.error('Error applying constraints: ', error);
                updateStreamInfo(error);
            });
    } else {
        if (window.stream) {
            window.stream.getTracks().forEach(track => track.stop());
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                window.stream = stream;
                window.currentDeviceId = constraints.video.deviceId.exact;
                videoElement.srcObject = stream;
                updateStreamInfo();
            })
            .catch(error => {
                console.error('Error accessing media devices.', error);
                updateStreamInfo(error);
            });
    }
}

function updateStreamInfo(error = null) {
    if (error) {
        resolutionDisplay.textContent = `Error: ${error.message}`;
        resolutionDisplay.style.display = 'block';
    } else {
        updateVideoResolution()
        videoElement.style.display = 'block';
    }
}

function updateVideoResolution() {
    setTimeout(() => {
        resolutionDisplay.textContent = `Resolution: ${videoElement.videoWidth} x ${videoElement.videoHeight}`;
        resolutionDisplay.style.display = 'block';
    }, 500);
}
