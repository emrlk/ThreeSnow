import * as THREE from "../node_modules/three/build/three.module.js

// Initialize variables
let camera, scene, renderer;
let snowflakes = [];
const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
const windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);

let targetZoom = 20;
let currentZoom = 50;

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 0, 50); // Add fog with color and density
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    //snowflake geometry
    const snowflakeGeometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 8000; i++) {
        positions.push((Math.random() - 0.5) * 50); // x
        positions.push((Math.random() - 0.5) * 50); // y
        positions.push((Math.random() - 0.5) * 50); // z
    }
    snowflakeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const snowflakeMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });

    //Create snowflake particles
    snowflakes = new THREE.Points(snowflakeGeometry, snowflakeMaterial);
    scene.add(snowflakes);


    //ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
    scene.add(ambientLight);

    //directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0); // Set light direction
    scene.add(directionalLight);


    //Create ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5;
    scene.add(ground);

    //Create trees
    const numTrees = 150;
    const spread = 80;
    const treeGeometry = new THREE.ConeGeometry(1, 3, 8);
    const treeMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });

    for (let i = 0; i < numTrees; i++) {
        const tree = new THREE.Mesh(treeGeometry, treeMaterial);
        const posX = (Math.random() - 0.5) * spread;
        const posZ = (Math.random() - 0.5) * spread;
        tree.position.set(posX, -2.5, posZ);
        scene.add(tree);
    }

    // Create skybox
    const skyGeometry = new THREE.SphereGeometry(1000, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec3 color = vec3(0.0);
                float elevation = vWorldPosition.y / 1000.0;
                color += vec3(0.2, 0.5, 1.0) * smoothstep(0.0, 1.0, elevation) * 0.5;
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        side: THREE.BackSide
    });
    const skybox = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skybox);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);




    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('wheel', onMouseWheel, false);
    window.addEventListener('resize', onResize, false);

}

function onMouseMove(event) {
    mouse.x = (event.clientX - windowHalf.x);
    mouse.y = (event.clientY - windowHalf.x);
}

function onMouseWheel(event) {
    targetZoom -= event.deltaY * 0.08; // Adjust targetZoom based on deltaY
}

function onResize(event) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    windowHalf.set(width / 2, height / 2);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function animate() {
    target.x = (1 - mouse.x) * 0.0002;
    target.y = (1 - mouse.y) * 0.0002;
    camera.rotation.x += 0.05 * (target.y - camera.rotation.x);
    camera.rotation.y += 0.05 * (target.x - camera.rotation.y);

    //Smooth zoom
    currentZoom += (targetZoom - currentZoom) * 0.05;
    camera.position.z = currentZoom;

    // Update snowflake positions
    const snowflakePositions = snowflakes.geometry.attributes.position.array;
    for (let i = 1; i < snowflakePositions.length; i += 3) {
        snowflakePositions[i] -= 0.01; // Adjust the falling speed as needed
        if (snowflakePositions[i] < -25) { // Reset snowflake position if it falls below the ground
            snowflakePositions[i] = 25;
        }
    }
    snowflakes.geometry.attributes.position.needsUpdate = true;

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function startGame() {
    init();
    animate();
}

startGame();








