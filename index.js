let video = document.querySelector("video");
let recordBtnCont = document.querySelector(".record-btn-container");
let recordBtn = document.querySelector(".record-btn");
let timer = document.querySelector(".timer");
let captureBtnContainer = document.querySelector(".capture-btn-container");
let captureBtn = document.querySelector(".capture-btn");
let transparentColor = "transparent";

let recordFlag = false;

let recorder = null;
let chunks = []; // media data is stored in chunks

let constraints = {
    audio: true,
    video: true,
};

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            video.srcObject = stream;

            recorder = new MediaRecorder(stream);

            recorder.addEventListener("start", () => {
                chunks = [];
            });

            recorder.addEventListener("dataavailable", (e) => {
                chunks.push(e.data);
            });

            recorder.addEventListener("stop", () => {
                let blob = new Blob(chunks, { type: 'video/mp4' });
                let videoURL = URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = videoURL;
                a.download = 'stream.mp4';
                a.click();
            });

            recordBtnCont.addEventListener("click", () => {
                if (!recorder) return;

                recordFlag = !recordFlag;
                if (recordFlag) { // start recording
                    recorder.start();
                    recordBtn.classList.add("scale-record");
                    startTimer();
                } else { // stop recording
                    recorder.stop();
                    recordBtn.classList.remove("scale-record");
                    stopTimer();
                }
            });
        })
        .catch((err) => {
            console.error("Error accessing media devices:", err);
        });

    let timerID;
    let counter = 0;

    function startTimer() {
        timer.style.display = "block";
        function displayTimer() {
            let totalSeconds = counter;
            let hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
            let minutes = Math.floor(totalSeconds / 60);
            let seconds = totalSeconds % 60;

            hours = (hours < 10) ? `0${hours}` : hours;
            minutes = (minutes < 10) ? `0${minutes}` : minutes;
            seconds = (seconds < 10) ? `0${seconds}` : seconds;

            timer.innerText = `${hours}:${minutes}:${seconds}`;
            counter++;
        }
        timerID = setInterval(displayTimer, 1000);
    }

    function stopTimer() {
        clearInterval(timerID);
        counter = 0; // Reset counter after stopping
        timer.innerText = "00:00:00";
        timer.style.display = "none";
    }

    if (captureBtnContainer) {
        captureBtnContainer.addEventListener("click", () => {
            captureBtnContainer.classList.add("scale-capture");

            let canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            let tool = canvas.getContext("2d");
            tool.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Apply filter if necessary
            tool.fillStyle = transparentColor;
            tool.fillRect(0, 0, canvas.width, canvas.height); // Ensure correct usage

            let imageURL = canvas.toDataURL("image/jpeg", 1.0);

            let a = document.createElement("a");
            a.href = imageURL;
            a.download = "Image.jpeg";
            a.click();

            setTimeout(() => {
                captureBtnContainer.classList.remove("scale-capture");
            }, 500);
        });
    }

    // Filtering logic
    let filter = document.querySelector(".filter-layer");
    if (filter) {
        let allFilter = document.querySelectorAll(".filter");
        allFilter.forEach((filterEl) => {
            filterEl.addEventListener("click", () => {
                transparentColor = getComputedStyle(filterEl).getPropertyValue("background-color");
                filter.style.backgroundColor = transparentColor;
            });
        });
    }

} else {
    console.error("MediaDevices or getUserMedia not supported in this browser.");
}
