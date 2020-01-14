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

const icoMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
});
const geometryBeforeSplitting = new THREE.IcosahedronGeometry(1, 1);
const geoBSVerts = geometryBeforeSplitting.vertices;
const geoBSFaces = geometryBeforeSplitting.faces;
const splitGeo = new THREE.Group();
geoBSFaces.forEach((face) => {
  const splitGeoSegment = new THREE.Geometry();
  splitGeoSegment.vertices.push(geoBSVerts[face.a], geoBSVerts[face.b], geoBSVerts[face.c]);
  const newFace = face;
  newFace.a = 0;
  newFace.b = 1;
  newFace.c = 2;
  splitGeoSegment.faces.push(newFace);
  const mesh = new THREE.Mesh(splitGeoSegment, icoMaterial);
  const wireGeometry = new THREE.EdgesGeometry(geometryBeforeSplitting);
  const wireMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const wireframe = new THREE.LineSegments(wireGeometry, wireMaterial);
  mesh.add(wireframe);
  splitGeo.add(mesh);
});
scene.add(splitGeo);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
