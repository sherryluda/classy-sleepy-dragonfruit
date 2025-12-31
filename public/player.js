// player.js

const audio = new Audio();
let currentTrackIndex = 0;
let playlist = [];
let playMode = "NORMAL"; // NORMAL, REPEAT, RANDOM

async function loadSongs() {
  const response = await fetch("songs.json");
  playlist = await response.json();
  renderSongList();
  loadTrack(currentTrackIndex);
  try {
    await audio.play();
  } catch (err) {
    console.warn("自動播放失敗：", err);
  }
  
  audio.addEventListener("ended", () => {
    if (playMode === "REPEAT") {
      playTrack(currentTrackIndex);
    } else if (playMode === "RANDOM") {
      const nextIndex = Math.floor(Math.random() * playlist.length);
      playTrack(nextIndex);
    } else {
      currentTrackIndex++;
      if (currentTrackIndex < playlist.length) {
        playTrack(currentTrackIndex);
      }
    }
  });

  audio.addEventListener("timeupdate", () => {
    const currentTimeEl = document.querySelector(".text-wrapper-10");
    if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener("loadedmetadata", () => {
    const durationEl = document.querySelector(".text-wrapper-11");
    if (durationEl) durationEl.textContent = "/" + formatTime(audio.duration);
  });
}



function formatTime(time) {
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function initThreeModel() {
  const container = document.getElementById("3d-model-container");
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 1, 3);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true;

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(light);

  let model = null;
  let spinning = true;

  const loader = new GLTFLoader();
  loader.load(
    "https://cdn.glitch.me/25153c5c-de40-408b-bed2-d7c8e947fe1c/9dbad8f4c1ce472698595bd873067b48.glb?v=1745033484250",
    (gltf) => {
      model = gltf.scene;
      scene.add(model);
    },
    undefined,
    (error) => {
      console.error("模型載入失敗", error);
    }
  );

  function animate() {
    requestAnimationFrame(animate);
    if (spinning && model) {
      model.rotation.y += 0.01; // 模型旋轉
    }
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // 將控制權傳給外部
  window.toggleModelSpin = (status) => {
    spinning = status;
  };
}

function loadTrack(index) {
  const track = playlist[index];
  if (!track) return;

  audio.src = track.url;
  audio.load();
  updateUI(track);
}

function updateUI(track) {
  const albumTitleEl = document.querySelector(".text-wrapper-2");
  const artistNameEl = document.querySelector(".text-wrapper-3");
  const currentNumEl = document.querySelectorAll(".text-wrapper-5")[0];
  const totalNumEl = document.querySelectorAll(".text-wrapper-5")[1];
  const trackLabelEl = document.querySelectorAll(".text-wrapper-8")[1];

  if (albumTitleEl) albumTitleEl.textContent = track.album || "Unknown Album";
  if (artistNameEl) artistNameEl.textContent = track.artist || "Unknown Artist";
  if (currentNumEl) currentNumEl.textContent = String(currentTrackIndex + 1).padStart(2, '0');
  if (totalNumEl) totalNumEl.textContent = String(playlist.length).padStart(2, '0');
  if (trackLabelEl) trackLabelEl.textContent = `TR${currentTrackIndex + 1}`;
}

function playTrack(index) {
  currentTrackIndex = index;
  loadTrack(currentTrackIndex);
  audio.play();
  renderSongList();
}

function setupControls() {
  const playBtn = document.querySelector(".play_button");
  const pauseBtn = document.querySelector(".pause_button");
  const stopBtn = document.querySelector(".stop_button");
  const prevBtn = document.querySelector(".back-forward-media");
  const nextBtn = document.querySelector(".fast-forward-media");

  if (playBtn) playBtn.addEventListener("click", () => audio.play());
  if (pauseBtn) pauseBtn.addEventListener("click", () => audio.pause());
  if (stopBtn)
    stopBtn.addEventListener("click", () => {
      audio.pause();
      audio.currentTime = 0;
    });

  prevBtn?.addEventListener("click", () => {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    playTrack(currentTrackIndex);
  });

  nextBtn?.addEventListener("click", () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    playTrack(currentTrackIndex);
  });
  
  pauseBtn.addEventListener("mousedown", () => {
  pauseBtn.src = "https://cdn.glitch.global/25153c5c-de40-408b-bed2-d7c8e947fe1c/play_pressed.png?v=1745026869725";
});
pauseBtn.addEventListener("mouseup", () => {
  pauseBtn.src = "https://cdn.glitch.global/25153c5c-de40-408b-bed2-d7c8e947fe1c/Property%201%3DDefault-1.png?v=1744944875761";
});
  
  const playDefaultSrc = "https://cdn.glitch.global/25153c5c-de40-408b-bed2-d7c8e947fe1c/Property%201%3DDefault.png?v=1744944901589";
  const playActiveSrc = "https://cdn.glitch.global/25153c5c-de40-408b-bed2-d7c8e947fe1c/play_pressed.png?v=1745026869725";
  const stopDefaultSrc = "https://cdn.glitch.global/25153c5c-de40-408b-bed2-d7c8e947fe1c/Property%201%3DDefault-2.png?v=1744944890796";
  const stopActiveSrc = "https://cdn.glitch.global/25153c5c-de40-408b-bed2-d7c8e947fe1c/stop_pressed.png?v=1745026846837";

  playBtn.addEventListener("click", () => {
    playBtn.src = playActiveSrc; 
    stopBtn.src = stopDefaultSrc;
  });

  stopBtn.addEventListener("click", () => {
    stopBtn.src = stopActiveSrc;
    playBtn.src = playDefaultSrc;
  });
  
  pauseBtn.addEventListener("click", () => {
    playBtn.src = playDefaultSrc;
  });
  
  if (playBtn) playBtn.addEventListener("click", () => {
  audio.play();
  if (window.toggleModelSpin) toggleModelSpin(true);
});

if (pauseBtn) pauseBtn.addEventListener("click", () => {
  audio.pause();
  if (window.toggleModelSpin) toggleModelSpin(false);
});

if (stopBtn) stopBtn.addEventListener("click", () => {
  audio.pause();
  audio.currentTime = 0;
  if (window.toggleModelSpin) toggleModelSpin(false);
});

}


function setupModeButtons() {
  const buttons = document.querySelectorAll(".mode-change-button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      playMode = btn.innerText.trim();
      highlightActiveMode(playMode);
    });
  });
  highlightActiveMode(playMode);
}

function highlightActiveMode(mode) {
  document.querySelectorAll(".mode-change-button").forEach((btn) => {
    btn.style.backgroundColor = btn.innerText.trim() === mode ? "rgba(255,255,255,0.2)" : "transparent";
  });
}

function renderSongList() {
  const songListEl = document.getElementById("song-list");
  console.log("找到 songListEl?", songListEl);
  if (!songListEl) return;
  songListEl.innerHTML = "";

  playlist.forEach((track, index) => {
    const isCurrent = index === currentTrackIndex;
    const songItem = document.createElement("div");

    if (isCurrent) {
      songItem.className = "song-list-option";
      songItem.innerHTML = `
        <div class="point-wrapper">
          <img class="point" src="https://cdn.glitch.global/25153c5c-de40-408b-bed2-d7c8e947fe1c/point.png?v=1744944950545" />
        </div>
        <div class="text-wrapper-6">${String(index + 1).padStart(3, "0")}</div>
        <div class="text-wrapper-7">${track.title}</div>
      `;
    } else {
      songItem.className = "song-list-option-2";
      songItem.innerHTML = `
        <div class="frame-22"></div>
        <div class="text-wrapper-6">${String(index + 1).padStart(3, "0")}</div>
        <div class="text-wrapper-7">${track.title}</div>
      `;
    }

    songItem.addEventListener("click", () => {
      playTrack(index);
    });

    songListEl.appendChild(songItem);
  });
  console.log("songListEl.innerHTML = ", songListEl.innerHTML);

}



document.querySelectorAll('.frame-3').forEach(cd => {
    cd.addEventListener('click', () => {
        const link = cd.getAttribute('data-link');
        if (link) {
            window.location.href = link;
        }
    });
});


const overlapGroup = document.querySelector('.music-playing-menu .overlap-group');

// 滑鼠移入 ➔ 放大背景
overlapGroup.addEventListener('mouseenter', () => {
  gsap.to(overlapGroup, {
    '--bg-transform': 'scale(1.2) translate(0, 0)',
    duration: 0.5,
    ease: 'power2.out'
  });
});

// 滑鼠移出 ➔ 還原
overlapGroup.addEventListener('mouseleave', () => {
  gsap.to(overlapGroup, {
    '--bg-transform': 'scale(1) translate(0, 0)',
    duration: 0.5,
    ease: 'power2.out'
  });
});

// 滑鼠移動 ➔ 視差偏移
overlapGroup.addEventListener('mousemove', (e) => {
  const { offsetX, offsetY, target } = e;
  const moveX = (offsetX / target.clientWidth - 0.5) * 30; // ±15px
  const moveY = (offsetY / target.clientHeight - 0.5) * 30; // ±15px

  gsap.to(overlapGroup, {
    '--bg-transform': `scale(1.2) translate(${moveX}px, ${moveY}px)`,
    duration: 0.3,
    ease: 'power2.out'
  });
});




document.addEventListener("DOMContentLoaded", () => {
  loadSongs();
  setupControls();
  setupModeButtons();
  
});
