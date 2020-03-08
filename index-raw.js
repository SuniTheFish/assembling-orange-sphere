const THREE = require('three');

window.THREE = THREE;
require('three/examples/js/controls/OrbitControls');

/**
 * resize a renderer to the size of the css display
 * @param {THREE.Renderer} renderer the renderer to resize
 */
function resizeToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

/** @param {string} id the id of the canvas */
function createAnimation(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.setZ(4);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.autoRotate = true;

  const scene = new THREE.Scene();

  const icoMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6b1c,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
    side: THREE.DoubleSide,
  });
  const geometryBeforeSplitting = new THREE.IcosahedronGeometry(1, 2);
  const geoBSVerts = geometryBeforeSplitting.vertices;
  const geoBSFaces = geometryBeforeSplitting.faces;
  const splitGeo = new THREE.Group();
  /** @type {THREE.Geometry[]} */
  const splitFragments = [];
  geoBSFaces.forEach((face) => {
    const splitGeoFragment = new THREE.Geometry();
    splitGeoFragment.vertices.push(geoBSVerts[face.a], geoBSVerts[face.b], geoBSVerts[face.c]);
    const newFace = face;
    newFace.a = 0;
    newFace.b = 1;
    newFace.c = 2;
    splitGeoFragment.faces.push(newFace);
    splitFragments.push(splitGeoFragment);
    const mesh = new THREE.Mesh(splitGeoFragment, icoMaterial);
    const wireGeometry = new THREE.EdgesGeometry(splitGeoFragment);
    const wireMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const wireframe = new THREE.LineSegments(wireGeometry, wireMaterial);
    mesh.add(wireframe);
    splitGeo.add(mesh);
  });
  scene.add(splitGeo);

  // randomize face heights
  splitGeo.children.forEach((tri, i) => {
    tri.translateOnAxis(
      splitFragments[i].faces[0].normal,
      (Math.random() - 0.5) * 0.1,
    );
  });

  let changeDist = 0;
  /** @param {number} distance */
  function expando(distance) {
    changeDist += distance;
    splitGeo.children.forEach((tri, i) => {
      tri.translateOnAxis(splitFragments[i].faces[0].normal, distance);
    });
  }

  expando(4);

  // set animation parameters
  const speed = -1;
  const jumpSpeed = 0.001;
  const jumpInital = 0.05;

  /** @type {Number[]} */
  let animationTris = [];
  let animationStage = jumpInital;
  let lastTime = 0;
  function animate(time) {
    const timeS = time / 1000;
    const dt = timeS - lastTime;
    lastTime = timeS;
    requestAnimationFrame(animate);
    controls.update();
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    resizeToDisplaySize(renderer);

    if (changeDist > 0) {
      expando(speed * dt);
    } else if (changeDist < 0) {
      expando(-changeDist);
    } else if (Math.abs(animationStage) <= jumpInital) {
      animationTris.forEach((triI) => {
        splitGeo.children[triI].translateOnAxis(
          splitFragments[triI].faces[0].normal,
          animationStage,
        );
      });
      animationStage -= jumpSpeed;
    } else {
      animationTris.forEach((triI) => {
        const curGeo = splitGeo.children[triI];
        curGeo.position.x = 0;
        curGeo.position.y = 0;
        curGeo.position.z = 0;
        splitGeo.children[triI].translateOnAxis(
          splitFragments[triI].faces[0].normal,
          (Math.random() - 0.5) * 0.1,
        );
      });
      animationTris = [];
      for (let i = 0; i < 30; i += 1) {
        animationTris.push(Math.floor(Math.random() * splitGeo.children.length));
      }
      animationStage = jumpInital;
    }
    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
}

module.exports.createAnimation = createAnimation;
