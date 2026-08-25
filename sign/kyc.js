/* Idswyft-style KYC helper: document upload + live selfie + liveness. */
(function (root) {
  const KYC = {
    api() {
      const { protocol, hostname, port } = location;
      if (port === "8766") return "";
      return protocol + "//" + hostname + ":8766";
    },
    stream: null,
    landmarker: null,

    async start() {
      const r = await fetch(this.api() + "/api/kyc/start", { method: "POST" });
      const data = await r.json();
      if (!data.ok) throw new Error(data.error || "start failed");
      return data.session_id;
    },

    async uploadDocument(session, file, side) {
      const body = new FormData();
      body.append("session_id", session);
      body.append("side", side || "front");
      body.append("file", file, file.name || side + ".jpg");
      const r = await fetch(this.api() + "/api/kyc/document", { method: "POST", body });
      const data = await r.json();
      if (!data.ok) throw new Error(data.error || "document failed");
      return data;
    },

    async uploadSelfie(session, blob, liveness) {
      const body = new FormData();
      body.append("session_id", session);
      body.append("file", blob, "selfie.jpg");
      body.append("liveness", JSON.stringify(liveness || {}));
      const r = await fetch(this.api() + "/api/kyc/selfie", { method: "POST", body });
      const data = await r.json();
      if (!data.ok) throw new Error(data.error || "selfie failed");
      return data;
    },

    async startCamera(video) {
      this.stopCamera();
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("no-camera");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      this.stream = stream;
      video.srcObject = stream;
      await video.play();
      return stream;
    },

    stopCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach((t) => t.stop());
        this.stream = null;
      }
    },

    async loadLandmarker() {
      if (this.landmarker) return this.landmarker;
      const { FaceLandmarker, FilesetResolver } = await import(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm"
      );
      const files = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      this.landmarker = await FaceLandmarker.createFromOptions(files, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
      });
      return this.landmarker;
    },

    blinkFrom(result) {
      const shapes = result && result.faceBlendshapes && result.faceBlendshapes[0];
      if (!shapes) return 0;
      const cat = {};
      (shapes.categories || []).forEach((c) => { cat[c.categoryName] = c.score; });
      return Math.min(cat.eyeBlinkLeft || 0, cat.eyeBlinkRight || 0);
    },

    poseFrom(result) {
      const blink = this.blinkFrom(result);
      let yaw = 0;
      const mats = result && result.facialTransformationMatrixes;
      if (mats && mats[0] && mats[0].data) {
        const m = mats[0].data;
        yaw = Math.atan2(-Number(m[2] || 0), Number(m[0] || 1));
      } else if (result && result.faceLandmarks && result.faceLandmarks[0]) {
        const lm = result.faceLandmarks[0];
        const nose = lm[1], L = lm[234], R = lm[454];
        if (nose && L && R) {
          const mid = (L.x + R.x) / 2;
          const w = Math.abs(R.x - L.x) || 1;
          yaw = ((nose.x - mid) / w) * 1.4;
        }
      }
      const hasFace = !!(result && ((result.faceLandmarks && result.faceLandmarks[0]) || (result.faceBlendshapes && result.faceBlendshapes[0])));
      return { yaw, blink, hasFace };
    },

    /* Active 3D liveness: center → turn left → turn right → blink.
       A printed photo or someone else's ID on a screen cannot do this. */
    async run3D({ video, onStatus, shouldStop }) {
      const lm = await this.loadLandmarker();
      const need = 0.22;
      const seen = { center: false, left: false, right: false, blinks: 0 };
      let closed = false;
      let hold = 0;
      const started = performance.now();
      return await new Promise((resolve, reject) => {
        const tick = () => {
          if (shouldStop && shouldStop()) return reject(new Error("stopped"));
          if (performance.now() - started > 45000) return reject(new Error("3D check timed out — try again"));
          const res = lm.detectForVideo(video, performance.now());
          const p = this.poseFrom(res);
          if (!p.hasFace) {
            onStatus && onStatus("Keep your face in the oval", seen, p);
            requestAnimationFrame(tick);
            return;
          }
          if (!seen.center) {
            if (Math.abs(p.yaw) < 0.14) hold += 1; else hold = 0;
            onStatus && onStatus("Look straight at the camera", seen, p);
            if (hold > 8) { seen.center = true; hold = 0; }
          } else if (!seen.left) {
            onStatus && onStatus("Turn your head LEFT", seen, p);
            if (p.yaw < -need) { seen.left = true; }
          } else if (!seen.right) {
            onStatus && onStatus("Turn your head RIGHT", seen, p);
            if (p.yaw > need) { seen.right = true; }
          } else {
            onStatus && onStatus("Look at the camera and blink", seen, p);
            if (p.blink > 0.45 && !closed) closed = true;
            if (p.blink < 0.2 && closed) { closed = false; seen.blinks += 1; }
            if (seen.blinks >= 1 && Math.abs(p.yaw) < 0.18) {
              return resolve({
                yaw_left: true,
                yaw_right: true,
                blinks: seen.blinks,
                live_camera: true,
                challenge: "3d-yaw-blink",
                secure: window.isSecureContext,
              });
            }
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },

    grabJpeg(video, quality) {
      const cv = document.createElement("canvas");
      cv.width = video.videoWidth || 640;
      cv.height = video.videoHeight || 480;
      cv.getContext("2d").drawImage(video, 0, 0);
      return new Promise((resolve) => cv.toBlob((b) => resolve(b), "image/jpeg", quality || 0.92));
    },
  };

  root.JSMKyc = KYC;
})(window);
