"use strict";
const dat = lil;
const vertexShader = `
#define GLSLIFY 1
highp float random(vec2 co)
{
    highp float a=12.9898;
    highp float b=78.233;
    highp float c=43758.5453;
    highp float dt=dot(co.xy,vec2(a,b));
    highp float sn=mod(dt,3.14);
    return fract(sin(sn)*c);
}

uniform float iTime;
uniform float iVelocity;

attribute vec2 aSeed;
attribute float aSize;

varying float vRandColor;

void main(){
    vec3 p=position;
    
    float t=iTime*1000.;
    float v=iVelocity;
    float s=v*t;
    // p.z=p.z+s;
    p.z=mod(p.z+s,2000.);
    
    vec4 mvPosition=modelViewMatrix*vec4(p,1.);
    gl_Position=projectionMatrix*mvPosition;
    
    float pSize=aSize*(200./-mvPosition.z);
    gl_PointSize=pSize;
    
    float randColor=random(aSeed);
    vRandColor=randColor;
}
`;
const fragmentShader = `
#define GLSLIFY 1
float circle(vec2 st,float r){
    vec2 dist=st-vec2(.5);
    return 1.-smoothstep(r-(r*1.15),r,dot(dist,dist)*4.);
}

uniform vec3 iColor1;
uniform vec3 iColor2;

varying float vRandColor;

void main(){
    vec2 p=gl_PointCoord-.5+.5;
    
    vec3 color=iColor1;
    if(vRandColor>0.&&vRandColor<.5){
        color=iColor2;
    }
    
    float shape=circle(p,1.);
    
    vec3 col=color*shape;
    
    gl_FragColor=vec4(col,1.);
}
`;
class Particles extends kokomi.Component {
    constructor(base, config = {}) {
        super(base);
        const { count = 10000, pointColor1 = "#ff6030", pointColor2 = "#1b3984", pointSize = 3, angularVelocity = 0, velocity = 0.01 } = config;
        this.count = count;
        this.pointColor1 = pointColor1;
        this.pointColor2 = pointColor2;
        this.pointSize = pointSize;
        this.angularVelocity = angularVelocity;
        this.velocity = velocity;
        this.geometry = null;
        this.material = null;
        this.points = null;
        this.create();
    }
    create() {
        const { base, count } = this;
        const { scene } = base;
        this.dispose();
        const geometry = new THREE.BufferGeometry();
        this.geometry = geometry;
        const positions = kokomi.makeBuffer(count, () => THREE.MathUtils.randFloat(-0.5, 0.5) * 50);
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const seeds = kokomi.makeBuffer(count, () => THREE.MathUtils.randFloat(0, 1), 2);
        geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 2));
        const sizes = kokomi.makeBuffer(count, () => this.pointSize + THREE.MathUtils.randFloat(0, 1), 1);
        geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                iTime: {
                    value: 0
                },
                iColor1: {
                    value: new THREE.Color(this.pointColor1)
                },
                iColor2: {
                    value: new THREE.Color(this.pointColor2)
                },
                iVelocity: {
                    value: this.velocity
                }
            }
        });
        this.material = material;
        const points = new THREE.Points(geometry, material);
        this.points = points;
        this.changePos();
    }
    addExisting() {
        const { base, points } = this;
        const { scene } = base;
        if (points) {
            scene.add(points);
        }
    }
    update(time) {
        const elapsedTime = time / 1000;
        if (this.material) {
            const uniforms = this.material.uniforms;
            uniforms.iTime.value = elapsedTime;
        }
        if (this.points) {
            this.points.rotation.z += this.angularVelocity * 0.01;
        }
    }
    changePos() {
        const { geometry, count } = this;
        if (geometry) {
            const positionAttrib = geometry.attributes.position;
            kokomi.iterateBuffer(positionAttrib.array, count, (arr, axis) => {
                const theta = THREE.MathUtils.randFloat(0, 360);
                const r = THREE.MathUtils.randFloat(10, 50);
                const x = r * Math.cos(theta);
                const y = r * Math.sin(theta);
                const z = THREE.MathUtils.randFloat(0, 2000);
                arr[axis.x] = x;
                arr[axis.y] = y;
                arr[axis.z] = z;
            });
        }
    }
    dispose() {
        const { base } = this;
        const { scene } = base;
        if (this.geometry) {
            this.geometry.dispose();
        }
        if (this.material) {
            this.material.dispose();
        }
        if (this.points) {
            scene.remove(this.points);
        }
    }
}
const params = {
    count: 10000,
    pointColor1: "#2155CD",
    pointColor2: "#FF4949",
    angularVelocity: 0,
    fadeFactor: 0.2,
    velocity: 0.01
};
class Sketch extends kokomi.Base {
    constructor(sel = "#sketch") {
        super(sel);
        this.particles = null;
        this.persistenceEffect = null;
    }
    create() {
        this.createCamera();
        // new kokomi.OrbitControls(this);
        this.createParticles();
        window.addEventListener("resize", () => {
            this.createParticles();
        });
        this.createDebug();
    }
    createCamera() {
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera = camera;
        this.interactionManager.camera = camera;
        camera.position.z = 1000;
    }
    createParticles() {
        if (this.particles) {
            this.particles.dispose();
        }
        if (this.persistenceEffect) {
            this.persistenceEffect.disable();
        }
        const particles = new Particles(this, {
            count: params.count,
            pointColor1: params.pointColor1,
            pointColor2: params.pointColor2,
            angularVelocity: params.angularVelocity,
            velocity: params.velocity
        });
        particles.addExisting();
        this.particles = particles;
        const persistenceEffect = new kokomi.PersistenceEffect(this, {
            fadeColor: new THREE.Color("#191919"),
            fadeFactor: params.fadeFactor
        });
        persistenceEffect.addExisting();
        this.persistenceEffect = persistenceEffect;
    }
    createDebug() {
        var _a;
        const gui = new dat.GUI();
        const { particles, persistenceEffect } = this;
        const uniforms = (_a = particles === null || particles === void 0 ? void 0 : particles.material) === null || _a === void 0 ? void 0 : _a.uniforms;
        gui
            .add(params, "count")
            .min(0)
            .max(50000)
            .step(1)
            .onChange(() => {
            this.createParticles();
        });
        gui.addColor(params, "pointColor1").onChange(() => {
            if (uniforms) {
                uniforms.iColor1.value = new THREE.Color(params.pointColor1);
            }
        });
        gui.addColor(params, "pointColor2").onChange(() => {
            if (uniforms) {
                uniforms.iColor2.value = new THREE.Color(params.pointColor2);
            }
        });
        gui
            .add(params, "angularVelocity")
            .min(0)
            .max(1)
            .step(0.001)
            .onChange(() => {
            if (particles) {
                particles.angularVelocity = params.angularVelocity;
            }
        });
        gui
            .add(params, "fadeFactor")
            .min(0)
            .max(1)
            .step(0.001)
            .onChange(() => {
            if (persistenceEffect) {
                persistenceEffect.fadeFactor = params.fadeFactor;
            }
        });
        gui
            .add(params, "velocity")
            .min(0)
            .max(0.1)
            .step(0.001)
            .onChange(() => {
            if (uniforms) {
                uniforms.iVelocity.value = params.velocity;
            }
        });
    }
}
const createSketch = () => {
    const sketch = new Sketch();
    sketch.create();
    return sketch;
};
createSketch();