const THREE = require('three');

window.THREE = THREE;
require('three/examples/js/controls/OrbitControls');

const canvas = document.querySelector('#three');

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.setZ(2);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;

const scene = new THREE.Scene();

const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
});
const geometryBeforeSplitting = new THREE.IcosahedronGeometry(1, 1);
const geoBSVerts = geometryBeforeSplitting.vertices;
const geoBSFaces = geometryBeforeSplitting.faces;
geoBSFaces.forEach((face) => {
  const splitGeo = new THREE.Geometry();
  splitGeo.vertices.push(geoBSVerts[face.a], geoBSVerts[face.b], geoBSVerts[face.c]);
  const newFace = face;
  newFace.a = 0;
  newFace.b = 1;
  newFace.c = 2;
  splitGeo.faces.push(newFace);
  const mesh = new THREE.Mesh(splitGeo, material);
  const wireGeometry = new THREE.EdgesGeometry(geometryBeforeSplitting);
  const wireMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const wireframe = new THREE.LineSegments(wireGeometry, wireMaterial);
  mesh.add(wireframe);
  scene.add(mesh);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
