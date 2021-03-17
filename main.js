
// let palette = [0x69D2E7, 0xA7DBD8, 0xF38630, 0xFA6900, 0xE0E4CC]
let main = randomColor();
let palette = [main, randomColor({hue:main}), randomColor({hue:main}), randomColor({hue:main}), randomColor({hue:main})]
let materials = [];
for(let i = 0; i < palette.length; i++) {
  let material = new THREE.MeshPhongMaterial( {
  // let material = new THREE.MeshBasicMaterial( {
    color: palette[i],
    side: THREE.DoubleSide
  } );
  // material.flatShading = true;
  materials.push(material);
}

//////////////////////////////////////////////////////////////////////////////////
//      Init
//////////////////////////////////////////////////////////////////////////////////

let updaters= [];
let toRemove = [];
let scene   = new THREE.Scene();

let renderer = new THREE.WebGLRenderer({
  antialias : true,
  preserveDrawingBuffer: true
});
renderer.setClearColor(randomColor({hue:main, luminosity: "dark"}), 1)
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let camera  = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000);

// handle window resize
window.addEventListener('resize', function(){
  renderer.setSize( window.innerWidth, window.innerHeight )
  camera.aspect   = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()     
}, false)

camera.position.z = 1;

//////////////////////////////////////////////////////////////////////////////////
//      lighting
//////////////////////////////////////////////////////////////////////////////////

let directionalLight = new THREE.DirectionalLight( 0xffffff, .8 );
directionalLight.position.set( 0, 1000, 0 );
scene.add( directionalLight ); 

let amb = new THREE.AmbientLight( 0x222222 );
let light = new THREE.HemisphereLight( 0xffffff, 0xffffff, .3 );
scene.add( amb );
scene.add( light );

var pointLight = new THREE.PointLight( 0xffffff, 1, .5 );
pointLight.position.set( 0, .5, 0 );
scene.add( pointLight );

//////////////////////////////////////////////////////////////////////////////////
//      add an object in the scene
//////////////////////////////////////////////////////////////////////////////////

let dots = [];
let screenBounds = 1;
let dotGeometry = new THREE.BoxGeometry(.2 * Math.random() * Math.random() + .003, .1 * Math.random() * Math.random() * Math.random() + .003, .01);
let dotContainer = new THREE.Object3D();
let numDot = 10;
let spawnCounter = 0;
let spawnRate = .01;

let spawnRateBase = .05;
let spawnRateRange = .3;

let framerate = 10 + (1 - Math.random()) * Math.random() * 200;

function setSpawnRate() {
  spawnRate = spawnRateBase + Math.random() * spawnRateRange;
}

scene.add(dotContainer);
updaters.push(function(i, dt, t) {
  spawnCounter += dt;
  if(dots.length == numDot) {
    spawnCounter = 0;
  }

  while(dots.length < numDot && spawnCounter > spawnRate) {
    spawnCounter -= spawnRate;
    spawnDot(
      -0.05 + (Math.random() - .5) /10,
      -.2, 0.1 + (Math.random() - .5) /2,
      1 + Math.random() * 5 + Math.sqrt(t)/800);
  }
});

function spawnDot(x, y, z, mass, vy) {

  let outerRotation = new THREE.Object3D();
  let innerRotation = new THREE.Object3D();
  let mesh = new THREE.Mesh(dotGeometry, materials[Math.floor(Math.random() * materials.length)]);
  mesh.position.set(Math.random() - .5, 
                    Math.random() - .5,
                    0);
  mesh.rotation.set(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2);
  
  dotContainer.add(outerRotation);
  innerRotation.add(mesh);
  outerRotation.add(innerRotation);

  outerRotation.position.z = 0;
  innerRotation.position.set(
    mesh.position.x + (Math.random() - .5)/3,
    mesh.position.y + (Math.random() - .5)/3,
    0);
  outerRotation.rotation.z = Math.random() * Math.PI * 2;

  dots.push(mesh);

  let outerRotationFactor = Math.random() / 10 + 1/40;
  let innerRotationFactor = Math.random() * 2 + 1;
  updaters.push(function(i, dt, t) {

    outerRotation.rotation.z += dt * outerRotationFactor;
    innerRotation.rotation.z += dt * innerRotationFactor;
    
    mesh.rotation.z += dt * 4;

  });
}
updaters.push(function(i, dt, t){
    
    dotContainer.position.z -= dt/10 * Math.sqrt(t)/100;
    amb.intensity += dt/10;    
})

//////////////////////////////////////////////////////////////////////////////////
//      render the whole thing on the page
//////////////////////////////////////////////////////////////////////////////////
// render the scene
updaters.push(function(){
  renderer.render( scene, camera );       
  renderer.autoClearColor = false;
})

// run the rendering loop
let lastTimeMsec= null
let timeCounter = 0;
let nowTime = 0;
requestAnimationFrame(function animate(nowMsec){
  // measure time
  lastTimeMsec    = lastTimeMsec || nowMsec-1000/60
  let deltaMsec   = Math.min(200000, nowMsec - lastTimeMsec)
  timeCounter += deltaMsec/1000; 
  lastTimeMsec = nowMsec;

  // call each update function
  deltaMsec = 1/framerate;
  while (timeCounter > 0) {
    timeCounter -= deltaMsec;
    if (timeCounter > .5) { // frame skip if we are lower than 2fps
      timeCounter = 0;
    }
    nowTime += deltaMsec;
    for(let i = updaters.length - 1; i >= 0; i--)
    {
      if(updaters[i](i, deltaMsec, nowMsec)) {
        updaters.splice(i, 1);
      }
    }
  }
  toRemove.sort();
  for(let i = toRemove.length - 1; i >= 0; i--)
  {
    updaters.splice(toRemove[i],1);
  }
  toRemove = [];

  // keep looping
  requestAnimationFrame( animate );
})
