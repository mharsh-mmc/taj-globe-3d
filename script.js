(function() {
  const container = document.getElementById('three-container');
  let renderer, camera, scene, sphere;
  let isScrolling = false;
  let scrollDelta = 0;

  const SPHERE_RADIUS = 1;
  const MARGIN_RATIO = 0.14;
  const FOV = 50;

  function fitCameraToSphere(fov, aspect, sphereRadius, marginRatio) {
    const margin = 1 + marginRatio;
    const fovRad = fov * Math.PI / 180;
    const fitHeightDistance = margin * sphereRadius / Math.sin(fovRad / 2);
    const fitWidthDistance = margin * sphereRadius / Math.sin(Math.atan(Math.tan(fovRad / 2) * aspect));
    return Math.max(fitHeightDistance, fitWidthDistance);
  }

  function init(texture) {
    scene = new THREE.Scene();
    
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(FOV, aspect, 0.1, 1000);
    const distance = fitCameraToSphere(FOV, aspect, SPHERE_RADIUS, MARGIN_RATIO);
    camera.position.set(0, 0, distance);

    const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
    light1.position.set(1, 1, 2);
    scene.add(light1);

    const ambient = new THREE.AmbientLight(0x404080, 0.7);
    scene.add(ambient);

    const geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 64, 64);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    sphere = new THREE.Mesh(geometry, material);

    sphere.rotation.y = -Math.PI * 3 / 4; // Initial rotation to adjust globe facing
    
    scene.add(sphere);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.filter = 'drop-shadow(0 0 30px rgba(0, 0, 0, 0.5))';
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', resize, false);

    animate();
  }

  function resize() {
    if (!renderer || !camera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    requestAnimationFrame(animate);

    if (sphere) {
      sphere.rotation.y -= 0.0005; // Slow auto-rotation
      if (isScrolling) {
        sphere.rotation.y += scrollDelta;
        scrollDelta *= 0.9; // Slowly decay scroll effect
        if (Math.abs(scrollDelta) < 0.00001) {
          isScrolling = false;
        }
      }
    }

    renderer.render(scene, camera);
  }

  const loader = new THREE.TextureLoader();
  loader.load(
    "world-map.png",
    function(texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.center.set(0.5, 0.5);
      texture.offset.y = 0.2;
      init(texture);
    },
    undefined,
    function(err) {
      alert("Failed to load world map texture.");
    }
  );

  container.addEventListener('wheel', function(event) {
    event.preventDefault();

    const scrollStrength = 0.002; // smoother scroll speed
    scrollDelta += (event.deltaY > 0 ? 1 : -1) * scrollStrength;
    isScrolling = true;
  });
  // Variables to track touch
let isTouching = false;
let lastTouchX = 0;
let touchDeltaX = 0;

// Add these event listeners after "wheel" listener
container.addEventListener('touchstart', function(event) {
  if (event.touches.length === 1) {
    isTouching = true;
    lastTouchX = event.touches[0].clientX;
  }
});

container.addEventListener('touchmove', function(event) {
  if (isTouching && event.touches.length === 1) {
    const currentX = event.touches[0].clientX;
    touchDeltaX = (currentX - lastTouchX) * 0.0001; // Adjust sensitivity here
    lastTouchX = currentX;
    scrollDelta += touchDeltaX;
    isScrolling = true;
    event.preventDefault();
  }
});

container.addEventListener('touchend', function(event) {
  isTouching = false;
});


})();
