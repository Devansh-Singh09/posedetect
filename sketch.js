const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 800, height: 500 },
    audio: false
  });
  video.srcObject = stream;
  return new Promise(resolve => {
    video.onloadedmetadata = () => resolve(video);
  });
}

const adjacentKeyPoints = [
  ['leftShoulder', 'rightShoulder'],
  ['leftShoulder', 'leftElbow'],
  ['leftElbow', 'leftWrist'],
  ['rightShoulder', 'rightElbow'],
  ['rightElbow', 'rightWrist'],
  ['leftShoulder', 'leftHip'],
  ['rightShoulder', 'rightHip'],
  ['leftHip', 'rightHip'],
  ['leftHip', 'leftKnee'],
  ['leftKnee', 'leftAnkle'],
  ['rightHip', 'rightKnee'],
  ['rightKnee', 'rightAnkle'],
];

function drawKeypoints(keypoints) {
  keypoints.forEach(kp => {
    if (kp.score > 0.5) {
      ctx.beginPath();
      ctx.arc(kp.position.x, kp.position.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
    }
  });
}

function drawSkeleton(keypoints) {
  adjacentKeyPoints.forEach(([partA, partB]) => {
    const kpA = keypoints.find(kp => kp.part === partA);
    const kpB = keypoints.find(kp => kp.part === partB);
    if (kpA && kpB && kpA.score > 0.5 && kpB.score > 0.5) {
      ctx.beginPath();
      ctx.moveTo(kpA.position.x, kpA.position.y);
      ctx.lineTo(kpB.position.x, kpB.position.y);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}

async function runPoseNet() {
  await setupCamera();
  video.play();

  const net = await posenet.load();

  async function detect() {
    const pose = await net.estimateSinglePose(video, {
      flipHorizontal: false
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, 800, 500);

    drawKeypoints(pose.keypoints);
    drawSkeleton(pose.keypoints);

    requestAnimationFrame(detect);
  }

  detect();
}

runPoseNet();
