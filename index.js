let video = document.querySelector("video");
let recordBtnCont = document.querySelector(".record-btn-container");
let recordBtn = document.querySelector(".record-btn");
let timer = document.querySelector(".timer");
let captureBtnContainer = document.querySelector(".capture-btn-container");
let captureBtn = document.querySelector(".capture-btn");
let audioBtnContainer = document.querySelector(".audio-btn-container");
let audioBtn = document.querySelector(".audio-btn");
let transparentColor = "transparent";

let recordFlag = false;
let isPaused = false;
let isMuted = false;

let recorder = null;
let chunks = []; // media data is stored in chunks
let stream = null;

let constraints = {
    audio: true,
    video: true,
};

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints)
        .then((userStream) => {
            stream = userStream;
            video.srcObject = stream;

            recorder = new MediaRecorder(stream);

            recorder.addEventListener("start", (e) => {
                chunks = [];
                isPaused = false;
            });

            recorder.addEventListener("dataavailable", (e) => {
                chunks.push(e.data);
            });

            recorder.addEventListener("stop", (e) => {
                let blob = new Blob(chunks, { type: 'video/mp4' });
                let videoURL = URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = videoURL;
                a.download = 'stream.mp4';
                a.click();
            });

            recordBtnCont.addEventListener("click", () => {
                if (!recorder) return;

                if (recordFlag) { // stop recording
                    if (isPaused) {
                        recorder.resume();
                        isPaused = false;
                    } else {
                        recorder.stop();
                    }
                    recordBtn.classList.remove("scale-record");
                    stopTimer();
                } else { // start recording
                    if (recorder.state === "inactive") {
                        recorder.start();
                    } else if (recorder.state === "paused") {
                        recorder.resume();
                    }
                    recordBtn.classList.add("scale-record");
                    startTimer();
                }
                recordFlag = !recordFlag;
            });

            captureBtnContainer.addEventListener("click", () => {
                captureBtnContainer.classList.add("scale-capture");

                let canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                let tool = canvas.getContext("2d");
                tool.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Filtering
                tool.fillStyle = transparentColor;
                tool.fillRect(0, 0, canvas.width, canvas.height);

                let imageURL = canvas.toDataURL("image/jpeg", 1.0);

                let a = document.createElement("a");
                a.href = imageURL;
                a.download = "Image.jpeg";
                a.click();

                // Display thumbnail
                let thumbnail = document.getElementById("thumbnail");
                thumbnail.src = imageURL;
                thumbnail.style.display = "block";

                setTimeout(() => {
                    captureBtnContainer.classList.remove("scale-capture"); // Consistent animation removal
                }, 500);
            });

            audioBtnContainer.addEventListener("click", () => {
                isMuted = !isMuted;
                constraints.audio = !isMuted;

                // Update the button appearance
                audioBtn.classList.toggle("muted", isMuted);

                // Restart the media stream with updated constraints
                navigator.mediaDevices.getUserMedia(constraints)
                    .then((newStream) => {
                        // Replace the old stream with the new one
                        let tracks = stream.getTracks();
                        tracks.forEach(track => track.stop());
                        video.srcObject = newStream;
                        stream = newStream;
                        recorder.stream = newStream;
                    })
                    .catch(err => console.error("Error toggling audio:", err));
            });

            // Filtering logic
            let filter = document.querySelector(".filter-layer");

            let allFilter = document.querySelectorAll(".filter");
            allFilter.forEach((filterEl) => {
                filterEl.addEventListener("click", () => {
                    transparentColor = getComputedStyle(filterEl).getPropertyValue("background-color");
                    filter.style.backgroundColor = transparentColor;
                });
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
            let hours = Number.parseInt(totalSeconds / 3600);
            totalSeconds = totalSeconds % 3600;
            let minutes = Number.parseInt(totalSeconds / 60);
            totalSeconds = totalSeconds % 60;
            let seconds = totalSeconds;

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

} else {
    console.error("MediaDevices or getUserMedia not supported in this browser.");
}
