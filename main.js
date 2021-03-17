
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
renderer.autoClearColor = false;
//renderer.setClearColor(palette[0], 1)
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
// renderer.domElement.addEventListener('touchstart', function(ev) {
//   for (let i = 0; i < ev.touches.length; i++) {
//     fire(
//         (ev.targetTouches[i].clientX - window.innerWidth/2)
//             / window.innerWidth,
//         -(ev.targetTouches[i].clientY - window.innerHeight/2)
//             / window.innerHeight
//       );
//   }
//   ev.preventDefault();
// });
// renderer.domElement.addEventListener('mousedown', function(ev) {
//     fire(
//         (ev.clientX - window.innerWidth/2)
//             / window.innerWidth,
//         -(ev.clientY - window.innerHeight/2)
//             / window.innerHeight
//       );
// });

// dynamic aspect cameras
let camera  = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000);
//let camera = new THREE.OrthographicCamera( window.innerWidth / - 2 /1000, window.innerWidth / 2 /1000, window.innerHeight / 2 /1000, window.innerHeight / - 2 /1000, 1, 1000 );

// fixed aspect cameras
//let camera  = new THREE.PerspectiveCamera(45, 1, 0.01, 4000);
//let camera = new THREE.OrthographicCamera( - 1/2, 1 / 2, -1 / 2, 1 / 2, 1, 1000 );

// handle window resize
window.addEventListener('resize', function(){
  renderer.setSize( window.innerWidth, window.innerHeight )
  camera.aspect   = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()     
}, false)

camera.position.z = 1;
// camera.position.y = -.07;
// camera.rotation.x = .2;

let timeScales = [];
let keyboard    = new THREEx.KeyboardState();


//////////////////////////////////////////////////////////////////////////////////
//      lighting
//////////////////////////////////////////////////////////////////////////////////

let directionalLight = new THREE.DirectionalLight( 0xffffff, .3 );
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

//money 
let moneys = [];
let screenBounds = 1;
let moneyGeometry = new THREE.BoxGeometry(.01, .01, .01);
let moneyContainer = new THREE.Object3D();
let numMoney = 10;
let effectScaleBase = 400000;
let effectScale = effectScaleBase;
let spawnCounter = 0;
let spawnRate = .01;

let spawnRateChangeCounter = 0;
let spawnRateChangeRate = .1;

let spawnRateBase = .05;
let spawnRateRange = .3;
let effectScaleRangeSqrt = effectScaleBase * 2;

function setSpawnRate() {
  spawnRate = spawnRateBase + Math.random() * spawnRateRange;
}

function setEffectScale() {
  effectScale = effectScaleBase + Math.random() * effectScaleRange;
}
//average 1 change per minute
let spawnRateChangeChance = spawnRateChangeRate /60 /5;
updaters.push(function(i, dt, t) {
  spawnRateChangeCounter += dt;
  while(spawnRateChangeCounter > spawnRateChangeRate) {
    spawnRateChangeCounter -= spawnRateChangeRate;
    if(Math.random() < spawnRateChangeChance) {
      setSpawnRate();
    }
    if(Math.random() < spawnRateChangeChance / 5) {
      setEffectScaleRate();
    }
  }
});
scene.add(moneyContainer);
updaters.push(function(i, dt, t) {
  spawnCounter += dt;
  if(moneys.length == numMoney) {
    spawnCounter = 0;
  }

  while(moneys.length < numMoney && spawnCounter > spawnRate) {
    spawnCounter -= spawnRate;
    spawnMoney(
      -0.05 + (Math.random() - .5) /10,
      -.2, 0.1 + (Math.random() - .5) /2,
      1 + Math.random() * 5 + Math.sqrt(t)/800);
  }
  effectScale -= dt*1000;
});
let speed = .005;
let speedMin = 0;
updaters.push(function(i, dt, t) {
  if(speed < .01) {
    speed+= dt * .003;
  }
  if(speedMin < .03) {
    speedMin += dt * .03;
  }
});
function spawnMoney(x, y, z, mass, vy) {

  let money = {
    collided: false,
    mass: mass || Math.random() * 20,
    mesh: null,
    vx: vy ? 0 : (Math.random() > .5 ? 1 : -1) * (Math.random() * speed + speedMin)
        /novaModifier,
    vy: vy || Math.random() /50 ,
    vz: vy ? 0 : (Math.random() > .5 ? 1 : -1) * (Math.random() * speed + speedMin)
        /novaModifier,
  };
  if (Math.abs(money.mass) < 2) {
    money.mass = Math.random() * 15 + 5;
  }
  let container = new THREE.Object3D();
  let container2 = new THREE.Object3D();
  let mesh = new THREE.Mesh(moneyGeometry, materials[Math.floor(Math.random() * materials.length)]);
  mesh.position.set(Math.random() - .5, 
                    Math.random() - .5,
                    0);
  mesh.rotation.set(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2);
  money.mesh = mesh;
  
  moneyContainer.add(container);
  container2.add(mesh);
  container.add(container2);
  container.position.z = 0;
  container2.position.set(
    mesh.position.x + (Math.random() - .5)/3,
    mesh.position.y + (Math.random() - .5)/3,
    0);
  container.rotation.z = Math.random() * Math.PI * 2;
  moneys.push(money);
  let outerRotationFactor = Math.random() / 10 + 1/40;
  let innerRotationFactor = Math.random() * 2 + 1;
  updaters.push(function(i, dt, t) {
    // mesh.position.x += money.vx * dt;
    // mesh.position.y += money.vy * dt;
    container.rotation.z += dt * outerRotationFactor;
    container2.rotation.z += dt * innerRotationFactor;
    container.position.z -= dt/10;
    mesh.rotation.z += dt * 4;

    amb.intensity += dt/100;
    // if (container.position.z < -3) {
    //   // container.position.z -= 4;
    //   moneyContainer.remove(container);
    //   moneys.splice(moneys.indexOf(money), 1);
    //   return true;
    // }
    // if (Math.random() < .001) {
    //   moneyContainer.remove(container);
    //   moneys.splice(moneys.indexOf(money), 1);
    //   return true;
    // }
    // mesh.position.x = Math.sin(t) * 1;
    // mesh.position.y = Math.cos(t) * 1;
    // mesh.position.z += money.vz * dt;
    // if (money.collided || money.mesh.position.length() > screenBounds) {
    //   moneyContainer.remove(mesh);
    //   moneys.splice(moneys.indexOf(money), 1);
    //   return true;
    // }
    // let meshDirection = new THREE.Vector3(money.vx, money.vy, money.vz);
    // if(meshDirection.length() > .1) {
    //   money.collided = true;
    // }
    // if(meshDirection.length() == 0) {
    //   meshDirection.x = 1;
    // }
    // else {
    //   meshDirection.normalize();
    // }
    // let neutralDirection = new THREE.Vector3(1, 0, 0);
    // mesh.quaternion.setFromUnitVectors(neutralDirection, meshDirection);

    // for(let oMoney of moneys) {
    //   if(oMoney === money) {
    //     continue;
    //   }
    //   let moneyVector = new THREE.Vector3(
    //     oMoney.mesh.position.x - money.mesh.position.x,
    //     oMoney.mesh.position.y - money.mesh.position.y,
    //     oMoney.mesh.position.z - money.mesh.position.z);
    //   let moneyDistSq = moneyVector.lengthSq();
    //   if (moneyDistSq < .01) {
    //     moneyDistSq *= -8;
    //   }
    //   if(moneyDistSq != 0){
    //     moneyVector.normalize();
    //     money.vx +=
    //       moneyVector.x / moneyDistSq / effectScale * dt * oMoney.mass;
    //     money.vy +=
    //       moneyVector.y / moneyDistSq / effectScale * dt * oMoney.mass + (dt/(60000 - t/50))
    //       / novaModifier;
    //     money.vz +=
    //       moneyVector.z / moneyDistSq / effectScale * dt * oMoney.mass;
    //   }
    // }

  });
}



let novaModifier = 1;
let novaModifierStartAmount = 8;
let novaModifierReturnSpeed = 0.05;
updaters.push(function(i, dt, t) {
  novaModifier = novaModifier -= dt * novaModifierReturnSpeed;
  novaModifier = Math.max(1, novaModifier);
  if(moneys.length < 3 && novaModifier < 1.5) {
    //novaModifier = novaModifierStartAmount;
  }
});
let cullCounter = 0;
let cullRate = 1;
let expected = 0;

//////////////////////////////////////////////////////////////////////////////////
//      render the whole thing on the page
//////////////////////////////////////////////////////////////////////////////////
// render the scene
updaters.push(function(){
    renderer.render( scene, camera );       
})

// run the rendering loop
let lastTimeMsec= null
let timeCounter = 0;
let nowTime = 0;
requestAnimationFrame(function animate(nowMsec){
  // keep looping
  requestAnimationFrame( animate );
  // measure time
  lastTimeMsec    = lastTimeMsec || nowMsec-1000/60
  let deltaMsec   = Math.min(200000, nowMsec - lastTimeMsec)
  //slow time /speed up time (stable, loses framerate at lower speeds)
  timeCounter += deltaMsec/1000; 
  lastTimeMsec    = nowMsec
  // call each update function
  let timeScale = 1;
  for(let i = 0; i < timeScales.length; i++)
  {
    timeScale *= timeScales[i];
  }
  deltaMsec = 1/144;
  //timeCounter = Math.min(timeCounter, 1/60);
  while (timeCounter > 0) {
    timeCounter -= deltaMsec;
    if (timeCounter > deltaMsec * 100) {
      timeCounter = 0;
    }
    // timeCounter = 0;
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
})
