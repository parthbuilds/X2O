// assets/js/vr-headset-animation.js

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('vr-headset-container');
    if (!container) {
        console.error('VR Headset container (ID "vr-headset-container") not found in the HTML!');
        return;
    }

    let scene, camera, renderer, headsetModel;

    let ASPECT_RATIO; // This will now always match the container's aspect ratio

    function init() {
        scene = new THREE.Scene();
        scene.background = null;

        // Set initial aspect ratio based on the container's current size.
        ASPECT_RATIO = container.clientWidth / container.clientHeight;
        // Increased FOV (from 20 to 35) to reduce zoom, making the asset appear smaller in the frame.
        camera = new THREE.PerspectiveCamera(35, ASPECT_RATIO, 0.1, 1000);
        // Initial camera position. This will be adjusted explicitly after model load.
        camera.position.set(0, 0, 5);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        // Set renderer size to match container's current size.
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(5, 5, 5).normalize();
        scene.add(directionalLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, -5, -5).normalize();
        scene.add(fillLight);

        const loader = new THREE.GLTFLoader();

        loader.load(
            'assets/models/vr_headset.glb',
            (gltf) => {
                headsetModel = gltf.scene;
                scene.add(headsetModel);

                // Retaining the aggressive scaling of the model.
                // You can adjust this value to further fine-tune its base size.
                headsetModel.scale.set(8, 8, 8);
                // If the model looks too massive now with reduced zoom, you can reduce this.
                // E.g., headsetModel.scale.set(50, 50, 50);

                const box = new THREE.Box3().setFromObject(headsetModel);
                const center = box.getCenter(new THREE.Vector3());

                // Center the model's pivot point.
                headsetModel.position.x -= center.x;
                headsetModel.position.y -= center.y;
                headsetModel.position.z -= center.z;

                // Increased camera Z position (from 3 to 6) to move the camera further back, reducing zoom.
                camera.position.set(0, 0, 6); // Adjust this Z value for more/less zoom. Higher = less zoom.
                camera.lookAt(0, 0, 0); // Make camera look at the origin (where the model is now centered).

                gsap.to(headsetModel.rotation, {
                    y: `+=${Math.PI * 2}`,
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
            },
            undefined,
            (error) => {
                console.error('An error occurred loading the 3D model:', error);
            }
        );

        window.addEventListener('resize', onWindowResize, false);
        onWindowResize();
    }

    function onWindowResize() {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;

        ASPECT_RATIO = newWidth / newHeight;

        camera.aspect = ASPECT_RATIO;
        camera.updateProjectionMatrix();

        renderer.setSize(newWidth, newHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    init();
    animate();
});
