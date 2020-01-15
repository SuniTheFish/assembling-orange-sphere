"use strict";

var THREE = require('three');

window.THREE = THREE;

require('three/examples/js/controls/OrbitControls');
/**
 * resize a renderer to the size of the css display
 * @param {THREE.Renderer} renderer the renderer to resize
 */


function resizeToDisplaySize(renderer) {
  var canvas = renderer.domElement;
  var width = canvas.clientWidth;
  var height = canvas.clientHeight;
  var needResize = canvas.width !== width || canvas.height !== height;

  if (needResize) {
    renderer.setSize(width, height, false);
  }

  return needResize;
}
/** @param {string} id the id of the canvas */


function createAnimation(canvas) {
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.setZ(4);
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.autoRotate = true;
  var scene = new THREE.Scene();
  var icoMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6b1c,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
    side: THREE.DoubleSide
  });
  var geometryBeforeSplitting = new THREE.IcosahedronGeometry(1, 2);
  var geoBSVerts = geometryBeforeSplitting.vertices;
  var geoBSFaces = geometryBeforeSplitting.faces;
  var splitGeo = new THREE.Group();
  /** @type {THREE.Geometry[]} */

  var splitFragments = [];
  geoBSFaces.forEach(function (face) {
    var splitGeoFragment = new THREE.Geometry();
    splitGeoFragment.vertices.push(geoBSVerts[face.a], geoBSVerts[face.b], geoBSVerts[face.c]);
    var newFace = face;
    newFace.a = 0;
    newFace.b = 1;
    newFace.c = 2;
    splitGeoFragment.faces.push(newFace);
    splitFragments.push(splitGeoFragment);
    var mesh = new THREE.Mesh(splitGeoFragment, icoMaterial);
    var wireGeometry = new THREE.EdgesGeometry(splitGeoFragment);
    var wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000
    });
    var wireframe = new THREE.LineSegments(wireGeometry, wireMaterial);
    mesh.add(wireframe);
    splitGeo.add(mesh);
  });
  scene.add(splitGeo); // randomize face heights

  splitGeo.children.forEach(function (tri, i) {
    tri.translateOnAxis(splitFragments[i].faces[0].normal, (Math.random() - 0.5) * 0.1);
  });
  var changeDist = 0;
  /** @param {number} distance */

  function expando(distance) {
    changeDist += distance;
    splitGeo.children.forEach(function (tri, i) {
      tri.translateOnAxis(splitFragments[i].faces[0].normal, distance);
    });
  }

  expando(4); // set animation parameters

  var speed = -1;
  var jumpSpeed = 0.001;
  var jumpInital = 0.05;
  /** @type {Number[]} */

  var animationTris = [];
  var animationStage = jumpInital;
  var lastTime = 0;

  function animate(time) {
    var timeS = time / 1000;
    var dt = timeS - lastTime;
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
      animationTris.forEach(function (triI) {
        splitGeo.children[triI].translateOnAxis(splitFragments[triI].faces[0].normal, animationStage);
      });
      animationStage -= jumpSpeed;
    } else {
      animationTris.forEach(function (triI) {
        var curGeo = splitGeo.children[triI];
        curGeo.position.x = 0;
        curGeo.position.y = 0;
        curGeo.position.z = 0;
        splitGeo.children[triI].translateOnAxis(splitFragments[triI].faces[0].normal, (Math.random() - 0.5) * 0.1);
      });
      animationTris = [];

      for (var i = 0; i < 30; i += 1) {
        animationTris.push(Math.floor(Math.random() * splitGeo.children.length));
      }

      animationStage = jumpInital;
    }

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
}

module.exports.createAnimation = createAnimation;

