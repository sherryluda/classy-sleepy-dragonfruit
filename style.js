let scene = new THREE.Scene();



let camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
let hoverLight;
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.3;
renderer.physicallyCorrectLights = true;
document.body.appendChild(renderer.domElement);

let controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(2, 4, 5);
camera.lookAt(0, 0, 0);
controls.target.set(-1.5, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// put lights
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 3);
hemisphereLight.position.set(0, 20, 0);
scene.add(hemisphereLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 20, 10);
scene.add(directionalLight);
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight2.position.set(-5, 10, -5);
scene.add(directionalLight2);

let loader = new THREE.GLTFLoader();
let dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
loader.setDRACOLoader(dracoLoader);


loader.load(
  "https://cdn.glitch.me/9f87ad99-3ab3-43a1-acaf-61a955a443c3/sun_room%E9%BB%91%E8%89%B2%E7%89%88%E6%9C%AC2.glb?v=1746427003184",
  function (gltf) {
    let room = gltf.scene;
    room.position.set(2.5, 0, 4);
    scene.add(room);
    document.getElementById("loading").style.display = "none";
  },
  function (xhr) {
    if (xhr.lengthComputable) {
      const percent = (xhr.loaded / xhr.total) * 100;
      document.getElementById("progress-bar").style.width = percent + "%";
    }
  },
  function (error) {
    console.error("room model loading fail:", error);
  }
);

let clickableModel;
let isHovered = false;
let originalY = 0;

loader.load(
  "https://cdn.glitch.global/9f87ad99-3ab3-43a1-acaf-61a955a443c3/player.glb?v=1746606259225",
  function (gltf) {
    clickableModel = gltf.scene;
    clickableModel.scale.set(0.01, 0.01, 0.01);

    let finalCameraPos = new THREE.Vector3(0, 3, 2);
    let finalLookAt = new THREE.Vector3(0, 0, 0);
    let direction = new THREE.Vector3()
      .subVectors(finalLookAt, finalCameraPos)
      .normalize();
    let clickablePos = new THREE.Vector3()
      .copy(finalCameraPos)
      .add(direction.multiplyScalar(2));

    clickableModel.position.copy(clickablePos);
    originalY = clickableModel.position.y;

    hoverLight = new THREE.PointLight(0x9966ff, 0, 10);
    hoverLight.position.copy(clickableModel.position);
    scene.add(hoverLight);

    scene.add(clickableModel);
  },
  undefined,
  function (error) {
    console.error("click model loading fail:", error);
  }
);

// scroll
let scrollCount = 0;
let targetPosition = new THREE.Vector3(2, 4, 5);
let targetLookAt = new THREE.Vector3(0, 0, 0);

window.addEventListener("wheel", (event) => {
  if (scrollCount === 0) {
    targetPosition.set(1.5, 3, 3);
    targetLookAt.set(0, 0, 0);
    scrollCount++;
  }
});

// click event for cd player
window.addEventListener("click", (event) => {
  if (!clickableModel) return;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(clickableModel, true);
  if (intersects.length > 0) {
    window.location.href = "../public/main.html";
  }
});

// hover detect
window.addEventListener("mousemove", (event) => {
  if (!clickableModel) return;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(clickableModel, true);
  isHovered = intersects.length > 0;
});

// aimation repeat
function animate() {
  requestAnimationFrame(animate);

  camera.position.lerp(targetPosition, 0.1);
  let currentLookAt = new THREE.Vector3();
  currentLookAt.lerpVectors(
    camera.getWorldDirection(new THREE.Vector3()).add(camera.position),
    targetLookAt,
    0.1
  );
  camera.lookAt(currentLookAt);

  if (clickableModel) {
    const time = performance.now() * 0.002;

    // 模型懸浮動畫
    const targetY = isHovered ? originalY + 0.3 : originalY;
    clickableModel.position.y += (targetY - clickableModel.position.y) * 0.1;

    // 光線與模型動畫
    if (isHovered) {
      clickableModel.rotation.y += 0.03; // 自轉

      clickableModel.traverse((child) => {
        if (child.isMesh && child.material && child.material.emissive) {
          child.material.emissive.set(0x9966ff); // 紫色高光
        }
      });

      if (hoverLight) {
        hoverLight.intensity += (50 - hoverLight.intensity) * 0.1;
        hoverLight.position.copy(clickableModel.position);
        hoverLight.color.set(0x9966ff);
      }
    } else {
      clickableModel.rotation.y += (0 - clickableModel.rotation.y) * 0.1;

      const flicker = (Math.sin(time) + 1) / 2; // 值為 0 ~ 1
      const glowIntensity = flicker * 2;

      clickableModel.traverse((child) => {
        if (child.isMesh && child.material && child.material.emissive) {
          const emissiveColor = new THREE.Color(0xff9900); // 橘色
          child.material.emissive.copy(emissiveColor.multiplyScalar(flicker));
        }
      });

      if (hoverLight) {
        hoverLight.intensity = glowIntensity;
        hoverLight.position.copy(clickableModel.position);
        hoverLight.color.set(0xff9900); // 橘色
      }
    }
  }
document.body.style.cursor = isHovered ? "pointer" : "default";
  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

