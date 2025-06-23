// assets/js/vr-headset-animation.js

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('vr-headset-container');
    if (!container) {
        console.error('VR Headset container (ID "vr-headset-container") not found!');
        return;
    }

    let scene, camera, renderer, headsetModel;

    // Initialize Three.js scene
    function initScene() {
        scene = new THREE.Scene();
        scene.background = null;

        const aspect = container.clientWidth / container.clientHeight;
        camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 1000);
        camera.position.set(0, 0, 6);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Lighting setup
        scene.add(new THREE.AmbientLight(0xffffff, 0.8));

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(5, 5, 5).normalize();
        scene.add(directionalLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, -5, -5).normalize();
        scene.add(fillLight);

        // Handle resize with debounce
        window.addEventListener('resize', debounce(onResize, 200));
        onResize();
    }

    // Load the GLB model
    function loadModel() {
        const loader = new THREE.GLTFLoader();

        // Optional: set Draco loader if using compressed glb
        // const dracoLoader = new THREE.DRACOLoader();
        // dracoLoader.setDecoderPath('/path/to/draco/');
        // loader.setDRACOLoader(dracoLoader);

        loader.load(
            'assets/models/vr_headset.glb',
            (gltf) => {
                headsetModel = gltf.scene;
                scene.add(headsetModel);

                headsetModel.scale.set(8, 8, 8);

                const box = new THREE.Box3().setFromObject(headsetModel);
                const center = box.getCenter(new THREE.Vector3());

                headsetModel.position.sub(center); // center model

                // Basic rotation and floating animation using GSAP
                gsap.to(headsetModel.rotation, {
                    y: "+=" + Math.PI * 2,
                    duration: 20,
                    repeat: -1,
                    ease: "none"
                });

                gsap.to(headsetModel.position, {
                    y: headsetModel.position.y + 0.1,
                    duration: 3,
                    repeat: -1,
                    yoyo: true,
                    ease: "power1.inOut"
                });

                // Remove loading spinner if exists
                document.querySelector('.spinner')?.remove();
            },
            undefined,
            (error) => {
                console.error('Error loading VR Headset model:', error);
            }
        );
    }

    // Resize handler
    function onResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    }

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    // Debounce utility
    function debounce(fn, delay) {
        let timeout;
        return function () {
            clearTimeout(timeout);
            timeout = setTimeout(fn, delay);
        };
    }

    // Start everything lazily
    function start() {
        initScene();
        loadModel();
        animate();
    }

    // Defer loading to idle time
    if ('requestIdleCallback' in window) {
        requestIdleCallback(start);
    } else {
        setTimeout(start, 100);
    }
});
