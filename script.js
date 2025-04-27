(function() {
  const container = document.getElementById('three-container');
  let renderer, camera, scene, sphere;
  let isScrolling = false;
  let scrollDelta = 0;

  const SPHERE_RADIUS = 1;
  const MARGIN_RATIO = 0.14;
  const FOV = 50;
  const rotationSpeed = 0.001; // Adjust this to make the auto-rotation faster or slower

  function fitCameraToSphere(fov, aspect, sphereRadius, marginRatio) {
    const margin = (1 + marginRatio);
    const fovRad = fov * Math.PI / 180;
    const fitHeightDistance = margin * sphereRadius / Math.sin(fovRad / 2);
    const fitWidthDistance = margin * sphereRadius / Math.sin(Math.atan(Math.tan(fovRad / 2) * aspect));
    return Math.max(fitHeightDistance, fitWidthDistance);
  }

  function init(texture) {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, 3);

    const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
    light1.position.set(1, 1, 2);
    scene.add(light1);

    const ambient = new THREE.AmbientLight(0x404080, 0.7);
    scene.add(ambient);

    const geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 64, 64);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    sphere = new THREE.Mesh(geometry, material);

    // 👇 Add initial rotation so a specific country appears front
    sphere.rotation.y = -Math.PI * 3 / 4; // (Rotate 90° right, adjust as needed)

    scene.add(sphere);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    resize();
    container.appendChild(renderer.domElement);

    // Add drop-shadow filter directly to renderer's DOM element
    renderer.domElement.style.filter = 'drop-shadow(0 0 30px rgba(0, 0, 0, 0.4))';

    animate();
  }

  function resize() {
    if (!renderer || !camera) return;
    const rect = container.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    const aspect = rect.width / rect.height;
    const distance = fitCameraToSphere(FOV, aspect, SPHERE_RADIUS, MARGIN_RATIO);
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  function animate() {
    requestAnimationFrame(animate);
    if (sphere) {
      sphere.rotation.y -= 0.0004; // Automatic left to right rotation
      if (isScrolling) {
        sphere.rotation.y += scrollDelta; // Rotate based on scroll
        isScrolling = false; // Reset scrolling flag after applying delta
      }
    }
    renderer.render(scene, camera);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  const loader = new THREE.TextureLoader();
  loader.load(
    "world-map.png",
    function(texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.center.set(0.5, 0.5);
      texture.offset.y = 0.2; // (you already added this shift, kept it)
      texture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 4;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      init(texture);
    },
    undefined,
    function(err) {
      alert("Failed to load world map texture.");
    }
  );

  // Scroll event listener
  container.addEventListener('wheel', function(event) {
    // Prevent default scroll behavior
    event.preventDefault();

    // Adjust scrollDelta based on both vertical and horizontal scroll
    if (event.deltaY < 0) {
      // Scroll up (move globe to left)
      scrollDelta = -0.01; // Adjust this value to control speed
    } else if (event.deltaY > 0) {
      // Scroll down (move globe to right)
      scrollDelta = 0.01; // Adjust this value to control speed
    }

    if (event.deltaX < 0) {
      // Scroll left (move globe to left)
      scrollDelta = -0.01; // Adjust this value to control speed
    } else if (event.deltaX > 0) {
      // Scroll right (move globe to right)
      scrollDelta = 0.01; // Adjust this value to control speed
    }

    // Set the scrolling flag to true to apply rotation
    isScrolling = true;
  });

})();
