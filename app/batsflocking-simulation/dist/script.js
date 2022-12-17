import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/OBJLoader.js";
import { Noise } from "https://cdn.skypack.dev/noisejs@2.1.0";

console.clear();

let maxSpeed = 0.2;
let maxForce = 0.1;
const perceptionRadius = 8;
let sceneRadius = 100;

const noiseX = new Noise(Math.random());
const noiseY = new Noise(Math.random());
const noiseZ = new Noise(Math.random());

/* SETUP */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* CONTROLS */
const controls = new OrbitControls(camera, renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x000000);
scene.add(ambientLight);

const light1 = new THREE.PointLight(0xffffff, 1, 0);
light1.position.set(0, 200, 0);
scene.add(light1);

const light2 = new THREE.PointLight(0xffffff, 1, 0);
light2.position.set(100, 200, 100);
scene.add(light2);

const light3 = new THREE.PointLight(0xffffff, 1, 0);
light3.position.set(- 100, -200, -100);
scene.add(light3);
/* BASIC BOX */

class Bat {
  constructor(mesh) {
    this.randFactor = Math.random() * 2;
    let scale = Math.random() * 0.5 + 0.3;
    this.scale = new THREE.Vector3(scale, scale, scale);
    this.position = new THREE.Vector3().random().subScalar(0.5).multiplyScalar(80);
    this.velocity = new THREE.Vector3().random().subScalar(0.5);
    this.velocity.setLength(Math.random() * 2 + 2);
    this.acceleration = new THREE.Vector3();
  }
  
  align() {
    
    return alignment;
  }
  
  separation() {
    
    return separation;
  }
  
  cohesion() {
    
    return cohesion;
  }

  
  walls () {
    if (this.position.x < -sceneRadius) {
      this.position.x = sceneRadius;
    } else if (this.position.x > sceneRadius) {
      this.position.x = -sceneRadius;
    } else if (this.position.y < -sceneRadius) {
      this.position.y = sceneRadius;
    } else if (this.position.y > sceneRadius) {
      this.position.y = -sceneRadius;
    } else if (this.position.z < -sceneRadius) {
      this.position.z = sceneRadius;
    } else if (this.position.z > sceneRadius) {
      this.position.z = -sceneRadius;
    }
  }
  
  flock () {
    let alignment = new THREE.Vector3();
    let cohesion = new THREE.Vector3();
    let separation = new THREE.Vector3();
    let total = 0;
    bats.forEach(bat => {
      let d = this.position.distanceTo(bat.position);
      if (bat !== this && d < perceptionRadius) {
        alignment.add(bat.velocity);
        cohesion.add(bat.position);
        let diff = this.position.clone().sub(bat.position);
        diff.divideScalar(d * d);
        separation.add(diff);
        total++;
      }
    });
    if (total > 0) {
      alignment.divideScalar(total);
      alignment.setLength(maxSpeed);
      alignment.sub(this.velocity);
      alignment.clampLength(0, maxForce);

      cohesion.divideScalar(total);
      cohesion.sub(this.position);
      cohesion.setLength(maxSpeed);
      cohesion.sub(this.velocity);
      cohesion.clampLength(0, maxForce);
      
      separation.divideScalar(total);
      separation.setLength(maxSpeed);
      separation.sub(this.velocity);
      separation.clampLength(0, maxForce);
    }

    alignment.multiplyScalar(0.1);
    cohesion.multiplyScalar(0.15);
    separation.multiplyScalar(0.15);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  }
  
  update() {
    this.walls();
    this.flock();
    this.acceleration.x += noiseX.simplex3(this.randFactor + this.position.x*0.1,this.position.y*0.1,this.position.z*0.1) * 0.1;
    this.acceleration.y += noiseY.simplex3(this.randFactor + this.position.x*0.1,this.position.y*0.1,this.position.z*0.1) * 0.1;
    this.acceleration.z += noiseZ.simplex3(this.randFactor + this.position.x*0.1,this.position.y*0.1,this.position.z*0.1) * 0.1;
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.clampLength(0, maxSpeed * 0.2);
    this.acceleration.multiplyScalar(0);
  }
}

/* BAT */
const loader = new OBJLoader();
loader.load("https://assets.codepen.io/127738/Bat.obj", (model) => {
  onLoad(model.children[0]);
  requestAnimationFrame(render);
});

const count = 1000;
const bats = [];
let bodiesMesh = null;
const dummy = new THREE.Object3D();
for (let i = 0; i < count; i++) {
  bats.push(new Bat());
}

function onLoad(children) {
  // BODIES
  const material = new THREE.MeshPhongMaterial({
    color: 0x000000,
    specular: 0x262626
  });
  bodiesMesh = new THREE.InstancedMesh(children.geometry, material, count);
  bodiesMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(bodiesMesh);
}

/* RENDERING */
function render(a) {
  requestAnimationFrame(render);
  
  bats.forEach((bat, i) => {
    bat.update();
  });
  bats.forEach((bat, i) => {
    dummy.position.copy(bat.position);
    dummy.scale.copy(bat.scale);
    var aimP = new THREE.Vector3();
    aimP.copy(bat.position).add(bat.velocity);
    dummy.lookAt(aimP);
    dummy.updateMatrix();
    bodiesMesh.setMatrixAt(i, dummy.matrix);
  });
  bodiesMesh.instanceMatrix.needsUpdate = true;
  
  noiseX.seed(a * 0.00000001);
  noiseY.seed(a * 0.00000001 + 30);
  noiseZ.seed(a * 0.00000001 + 60);

  renderer.render(scene, camera);
}

/* EVENTS */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize, false);