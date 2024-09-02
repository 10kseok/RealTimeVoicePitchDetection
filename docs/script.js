let audioContext;
let analyser;
let bufferLength;
let dataArray;
let source;
let lastPitch = 1;

document.getElementById('startButton').addEventListener('click', async () => {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        bufferLength = analyser.fftSize;
        dataArray = new Float32Array(bufferLength);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        document.getElementById('startButton').disabled = true;
        document.getElementById('stopButton').disabled = false;
        drawWaveform();
        detectPitch();
    } catch (err) {
        console.error('Error accessing audio input:', err);
        alert('Error accessing audio input: ' + err.message);
    }
});

document.getElementById('stopButton').addEventListener('click', () => {
    if (audioContext) {
        source.disconnect();
        audioContext.close();
        document.getElementById('startButton').disabled = false;
        document.getElementById('stopButton').disabled = true;
    }
});


function drawWaveform() {
    const canvas = document.getElementById('oscilloscope');
    const canvasCtx = canvas.getContext('2d');

    function draw() {
        requestAnimationFrame(draw);
        analyser.getFloatTimeDomainData(dataArray);

        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
        canvasCtx.beginPath();

        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = (dataArray[i] + 1.0) / 2.0;
            const y = v * canvas.height;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }

    draw();
}

function YIN(buffer, sampleRate) {
    const threshold = 0.15;
    const bufferSize = buffer.length;
    const yinBuffer = new Float32Array(bufferSize / 2);
    let probability = 0;
    let tau;

    for (let t = 1; t < bufferSize / 2; t++) {
        let sum = 0;
        for (let i = 0; i < bufferSize / 2; i++) {
            const delta = buffer[i] - buffer[i + t];
            sum += delta * delta;
        }
        yinBuffer[t] = sum;
    }

    yinBuffer[0] = 1;
    for (let t = 1, runningSum = 0; t < bufferSize / 2; t++) {
        runningSum += yinBuffer[t];
        yinBuffer[t] *= t / runningSum;
    }

    for (tau = 2; tau < bufferSize / 2; tau++) {
        if (yinBuffer[tau] < threshold) {
            while (tau + 1 < bufferSize / 2 && yinBuffer[tau + 1] < yinBuffer[tau]) {
                tau++;
            }
            probability = 1 - yinBuffer[tau];
            break;
        }
    }

    if (tau === bufferSize / 2 || yinBuffer[tau] >= threshold) {
        return -1;
    }

    let betterTau;
    const x0 = yinBuffer[tau - 1];
    const x1 = yinBuffer[tau];
    const x2 = yinBuffer[tau + 1];
    betterTau = tau + (x2 - x0) / (2 * (2 * x1 - x2 - x0));

    return sampleRate / betterTau;
}

function detectPitch() {
    function detect() {
        analyser.getFloatTimeDomainData(dataArray);
        const pitch = YIN(dataArray, audioContext.sampleRate);
        if (pitch > 0 && Math.abs(pitch - lastPitch) >= 1) {
            const noteInfo = frequencyToNote(pitch);
            document.getElementById('pitch').textContent = Math.round(pitch);
            document.getElementById('noteText').textContent = noteInfo.note;
            document.getElementById('koreanNoteText').textContent = noteInfo.koreanNote;
            document.getElementById('note').style.display = 'block';
            lastPitch = Math.round(pitch);
        } else {
            document.getElementById('pitch').textContent = lastPitch;
        }
        requestAnimationFrame(detect);
    }

    detect();
}

function frequencyToNote(frequency) {
    const noteNames = [
        { note: 'C', koreanNote: '도' },
        { note: 'C#', koreanNote: '도#' },
        { note: 'D', koreanNote: '레' },
        { note: 'D#', koreanNote: '레#' },
        { note: 'E', koreanNote: '미' },
        { note: 'F', koreanNote: '파' },
        { note: 'F#', koreanNote: '파#' },
        { note: 'G', koreanNote: '솔' },
        { note: 'G#', koreanNote: '솔#' },
        { note: 'A', koreanNote: '라' },
        { note: 'A#', koreanNote: '라#' },
        { note: 'B', koreanNote: '시' }
    ];
    const octave = Math.floor(12 * Math.log2(frequency / 440) + 69);
    const noteIndex = (octave + 12) % 12; // Ensure positive index
    return {
        note: noteNames[noteIndex].note,
        koreanNote: noteNames[noteIndex].koreanNote
    };
}
