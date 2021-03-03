
let palette = [0x69D2E7, 0xA7DBD8, 0xF38630, 0xFA6900, 0xE0E4CC]
let materials = [];
for(let i = 0; i < palette.length; i++) {
  //let material = new THREE.MeshPhongMaterial( {
  let material = new THREE.MeshBasicMaterial( {
    color: palette[i],
    side: THREE.DoubleSide
  } );
  material.flatShading = true;
  materials.push(material);
}

//////////////////////////////////////////////////////////////////////////////////
//      Init
//////////////////////////////////////////////////////////////////////////////////

let updaters= [];
let toRemove = [];
let scene   = new THREE.Scene();
// instantiate a loader
let loader = new THREE.OBJLoader();
let loader2 = new THREE.OBJLoader();

let og1Container = new THREE.Object3D();
og1Container.position.y = -.15;
og1Container.rotation.x = -.31;
og1Container.scale.y = 1.7;
og1Container.scale.x = 1.7;
scene.add(og1Container);
loader2.load('o.obj', function(object) {
  object.scale.set(.015, .015, .015);
  object.rotation.set(0, -Math.PI/2, 0);
  object.position.set(0, .5, 0);
  og1Container.add(object);
});
let loader3 = new THREE.OBJLoader();

loader3.load('g.obj', function(object) {
  object.scale.set(.015, .015, .015);
  object.rotation.set(0, -Math.PI/2, 0);
  object.position.set(0, .38, 0);
  og1Container.add(object);
  //let mesh = new THREE.Mesh(
  //  new THREE.BoxGeometry(.045, .085, .045));
  //  //new THREE.MeshBasicMaterial({color:0x0}));
  //mesh.position.set(.02, .24, 0);
  //og1Container.add(mesh);
  let mesh2 = new THREE.Mesh(
    new THREE.BoxGeometry(.04, .08, .04),
    new THREE.MeshBasicMaterial({color:0x0}));
  mesh2.position.set(0, .24, 0);
  og1Container.add(mesh2);
});
// load a resource
let loader5 = new THREE.OBJLoader();
loader5.load(
  // resource URL
  'stance.obj',
  // called when resource is loaded
  function ( object ) {
    object.scale.set(.05, .05, .05);
    object.position.set(0,-.139,.2);
    object.rotation.set(-.3,Math.PI + .2,0);
    scene.add( object );
    updaters.push(function(i, dt, t) {
      //og1Container.rotation.x += dt/5;
      //container.rotation.y += dt/10;
    });
  }
);
let loader4 = new THREE.OBJLoader();
loader4.load(
  // resource URL
  'decimated2.obj',
  // called when resource is loaded
  function ( object ) {
    object.scale.set(.5, .5, .5);
    object.position.set(0,-.07,0);
    object.rotation.set(-.6,- .6,0);
    scene.add( object );
    updaters.push(function(i, dt, t) {
      //container.rotation.y += dt/10;
    });
  }
);
// load a resource
//loader.load(
//  // resource URL
//  'decimated.obj',
//  // called when resource is loaded
//  function ( object ) {
//    object.scale.set(.5, .5, .5);
//    object.position.set(0,-.07,0);
//    object.rotation.set(-.6,- .6,0);
//    scene.add( object );
//    updaters.push(function(i, dt, t) {
//      //container.rotation.y += dt/10;
//    });
//  }
//);

let renderer = new THREE.WebGLRenderer({
  antialias : true,
  preserveDrawingBuffer: true
});
renderer.autoClearColor = false;
//renderer.setClearColor(palette[0], 1)
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.domElement.addEventListener('touchstart', function(ev) {
  for (let i = 0; i < ev.touches.length; i++) {
    fire(
        (ev.targetTouches[i].clientX - window.innerWidth/2)
            / window.innerWidth,
        -(ev.targetTouches[i].clientY - window.innerHeight/2)
            / window.innerHeight
      );
  }
  ev.preventDefault();
});
renderer.domElement.addEventListener('mousedown', function(ev) {
    fire(
        (ev.clientX - window.innerWidth/2)
            / window.innerWidth,
        -(ev.clientY - window.innerHeight/2)
            / window.innerHeight
      );
});

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
camera.position.y = -.07;
camera.rotation.x = .2;
//updaters.push(function(i, dt, t) {
//  camera.rotation.y = t/1000;
//});

let timeScales = [];
let keyboard    = new THREEx.KeyboardState();


//////////////////////////////////////////////////////////////////////////////////
//      utils
//////////////////////////////////////////////////////////////////////////////////

function isColliding(a, b) {
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  let d = b.r + a.r;
  return dx * dx + dy * dy < d * d;
}

function setMass(money, mass) {
  money.mass = mass;
  let scale = .1 + 
    (Math.abs(money.mass) < 1 ?
      money.mass : 1 + Math.sqrt(Math.abs(money.mass))/5);
  money.mesh.scale.set(scale,scale,scale);
  money.mesh.material = materials[money.mass > 0 ? 0 : 2];
  //money.mesh.visible = money.mass > 0;
}
//////////////////////////////////////////////////////////////////////////////////
//      add an object in the scene
//////////////////////////////////////////////////////////////////////////////////


//extra meter
let extraness = 0;
let notExtraStreak = 0;
function addExtra(extra) {
  extraness += extra || 2;
  notExtraStreak = 0;
}

//let sliceAngle = 0;
//{
//  let geometry = new THREE.BoxGeometry(3, .001, .001);
//  let material = new THREE.MeshPhongMaterial({
//    color: 0xFFFFFF,
//    shading: THREE.SmoothShading,
//  });
//  let mesh = new THREE.Mesh( geometry, material );
//  scene.add(mesh);
//  updaters.push(function(i, dt, t) {
//    sliceAngle += dt/5;
//    mesh.rotation.z = sliceAngle;
//    mesh.rotation.y = sliceAngle*3;
//  });
//}

{
  let geometry = new THREE.BoxGeometry(1, 1);
  let material = new THREE.MeshPhongMaterial({
    color: 0x0,
    shading: THREE.SmoothShading,
    transparent: true,
    opacity: .001,
  });
  let mesh = new THREE.Mesh( geometry, material );
  mesh.scale.set(100, 100, 100);
  scene.add(mesh);
}

{
  let geometry = new THREE.BoxGeometry(1, 1);
  let material = new THREE.MeshPhongMaterial({
    color: 0x402F3F,
    shading: THREE.SmoothShading,
    transparent: true,
    opacity: .1,
  });
  let mesh = new THREE.Mesh( geometry, material );
  mesh.scale.set(100, 100, 100);
  scene.add(mesh);
}
  
//player attacks
let playerHitboxes = new Set();
function fire2(x, y) {
  let geometry = new THREE.TorusKnotGeometry(0.5-0.12, 0.12);
  let material = new THREE.MeshPhongMaterial( { color: 0x402F3F, shading: THREE.SmoothShading } )
  let mesh = new THREE.Mesh( geometry, material );
  mesh.scale.set(.01,.01,.01);
  mesh.position.x = x;
  mesh.position.y = y;
  mesh.position.z = 1;
  scene.add( mesh );

  let bulletLife = .2;
  let playerHitbox = null;
  updaters.push(function(i, dt, t) {
    bulletLife -= dt
    if(playerHitbox != null) {
      if(bulletLife < -.3) {
        scene.remove(mesh);
        playerHitboxes.delete(playerHitbox);
        return true;
      }
    }
    else if(bulletLife < 0) {
      let r = .1;
      mesh.scale.set(r, r, r);
      playerHitbox = {x , y, r};
      playerHitboxes.add(playerHitbox);
    }
  });
}

//cigarette enemy
let cigaretteCounter = 0;
let cigaretteSpawnTime = 1;
updaters.push(function(i, dt, t) {
    cigaretteCounter += dt;
    while (cigaretteCounter > cigaretteSpawnTime) {
      //spawnCigarette();
      cigaretteCounter -= cigaretteSpawnTime;
    }
});

let numCigarettes = 0;
function spawnCigarette() {
  if (numCigarettes > 20) {
    return;
  }
  numCigarettes += 1;
  let geometry = new THREE.BoxGeometry(1, 1, 1);
  let material = new THREE.MeshPhongMaterial( { color: 0x402F3F, shading: THREE.SmoothShading } )
  let mesh = new THREE.Mesh( geometry, material );
  mesh.scale.set(.1,.1,.1);
  mesh.rotation.set(20, 4, 2.1110288);
  mesh.position.x = Math.random() - .5;
  mesh.position.y = -1.1 - Math.random() / 7;
  mesh.position.z = 1;
  scene.add( mesh );

  updaters.push(function(i, dt, t) {
    mesh.position.y += dt;
    if (mesh.position.y > 1) {
      addExtra();
      mesh.position.y = -1.1;
      for (let j = 0; j < 1; j++) {
        spawnCigarette();
      }
    }
    collisionFound = false;

    playerHitboxes.forEach(function(hitbox) {
      if (isColliding({
            x: mesh.position.x,
            y: mesh.position.y,
            r: .1
          }, hitbox)) {
        scene.remove(mesh);
        numCigarettes -= 1;
        collisionFound = true;
      }
    });
    return collisionFound;
  });
}
function fire5() {
  let plane = new THREE.Plane();
  let vector = new THREE.Vector3(0, 1, 0);
  let sphere = new THREE.Sphere(new THREE.Vector3(), .005);
  vector.applyAxisAngle(new THREE.Vector3(0, 0, 1), sliceAngle);
  plane.normal.copy(vector);
  for(let money of moneys) {
    sphere.center.copy(money.mesh.getWorldPosition());
    if(plane.intersectsSphere(sphere)) {
      money.collided = true;
    }
  }
}
  
let raycaster = new THREE.Raycaster();
let fireRadius = .2;
let attractors = [{
  x: 0,
  y: .3,
  z: 0,
  mass: 100,
}];
function fire4(x, y) {
  let attractor = new THREE.Vector3();
  attractors.push(attractor);
  let mouse = new THREE.Vector2(x*2, y*2);
  raycaster.setFromCamera(mouse, camera);
  attractor.copy(raycaster.ray.at(2));
  let attractorLifetime = 0;
  updaters.push(function (i, dt, t) {
    attractorLifetime += dt;
    if (attractorLifetime > 1) {
      attractors.splice(attractors.indexOf(attractor), 1);
    }
    return true;
  });
}
function fire3(x, y) {
  let mouse = new THREE.Vector2(x*2, y*2);
  raycaster.setFromCamera(mouse, camera);
  let lowestDistance = 100000000;
  let lowestDistanceMoney = null;
  for(let money of moneys) {
    let dist = raycaster.ray.distanceSqToPoint(money.mesh.position);
    if(lowestDistanceMoney == null || dist< lowestDistance) {
      lowestDistance = dist;
      lowestDistanceMoney = money;
    }
  }
  for(let money of moneys) {
    if(raycaster.ray.distanceSqToPoint(money.mesh.position)
        < fireRadius * fireRadius) {
      if(money === lowestDistanceMoney || money.mass < 0) {
        continue;
      }
      //if(lowestDistanceMoney.mass < 0 || money.mass < 0) {
      //  setMass(lowestDistanceMoney,
      //    -Math.abs(lowestDistanceMoney.mass) - Math.abs(money.mass));
      //}
      //else {
      //  setMass(lowestDistanceMoney, lowestDistanceMoney.mass + money.mass);
      //}
      money.collided = true;
    }
  }
  if(lowestDistanceMoney == null) {
    return;
  }
  lowestDistanceMoney.vx = 0;
  lowestDistanceMoney.vy = 0;
  lowestDistanceMoney.vz = 0;
}


//money 
let moneys = [];
let screenBounds = 1;
let moneyGeometry = new THREE.BoxGeometry(.01, .01, .01);
//let moneyGeometry = new THREE.SphereGeometry(.01);
let moneyContainer = new THREE.Object3D();
let numMoney = 80;
let effectScaleBase = 400000;
let effectScale = effectScaleBase;
let spawnCounter = 0;
let spawnRate = .4;

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
//let spawnRateChangeChance = 0;
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
  //moneyContainer.rotation.z = Math.sin(t/100000) * 50 ;
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
  let mesh = new THREE.Mesh(moneyGeometry, materials[Math.floor(Math.random() * materials.length)]);
  mesh.position.set(x || Math.random() - .5, 
                    y || Math.random() - .5,
                    z || Math.random() - .5);
  //mesh.visible = money.mass > 0;
  mesh.rotation.set(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2);
  money.mesh = mesh;
  
  moneyContainer.add(mesh);
  moneys.push(money);
  updaters.push(function(i, dt, t) {
    mesh.position.x += money.vx * dt;
    mesh.position.y += money.vy * dt;
    mesh.position.z += money.vz * dt;
    if (money.collided || money.mesh.position.length() > screenBounds) {
      moneyContainer.remove(mesh);
      moneys.splice(moneys.indexOf(money), 1);
      return true;
    }
    let meshDirection = new THREE.Vector3(money.vx, money.vy, money.vz);
    if(meshDirection.length() > .1) {
      money.collided = true;
    }
    if(meshDirection.length() == 0) {
      meshDirection.x = 1;
    }
    else {
      meshDirection.normalize();
    }
    let neutralDirection = new THREE.Vector3(1, 0, 0);
    mesh.quaternion.setFromUnitVectors(neutralDirection, meshDirection);
    //mesh.rotation.x = money.mass * money.vx;
    //mesh.rotation.y = money.mass * money.vy;
    //mesh.rotation.z = money.mass * money.vz;

    for(let oMoney of moneys) {
      if(oMoney === money) {
        continue;
      }
      let moneyVector = new THREE.Vector3(
        oMoney.mesh.position.x - money.mesh.position.x,
        oMoney.mesh.position.y - money.mesh.position.y,
        oMoney.mesh.position.z - money.mesh.position.z);
      let moneyDistSq = moneyVector.lengthSq();
      if (oMoney.mass && money.mass > 0 && moneyDistSq < .0001) {
        //let vx = (money.vx * money.mass + oMoney.vx * oMoney.mass)
        //    / (money.mass + oMoney.mass);
        //let vy = (money.vy * money.mass + oMoney.vy * oMoney.mass)
        //    / (money.mass + oMoney.mass);
        //let vz = (money.vz * money.mass + oMoney.vz * oMoney.mass)
        //    / (money.mass + oMoney.mass);
        //money.vx = vx;
        //money.vy = vy;
        //money.vz = vz;
        //setMass(money, money.mass + oMoney.mass);
        //oMoney.collided = true;
      }
      if (moneyDistSq < .01) {
        moneyDistSq *= -8;
      }
      if(moneyDistSq != 0){
        moneyVector.normalize();
        money.vx +=
          moneyVector.x / moneyDistSq / effectScale * dt * oMoney.mass;
        money.vy +=
          moneyVector.y / moneyDistSq / effectScale * dt * oMoney.mass + (dt/(60000 - t/50))
          / novaModifier;
        //if(Math.sign(moneyVector.z) == Math.sign(money.vz)) {
        //  moneyVector.z /= 2;
        //}
        money.vz +=
          moneyVector.z / moneyDistSq / effectScale * dt * oMoney.mass;
      }
    }

    //for(let attractor of attractors) {
    //  let attractVector = new THREE.Vector3(
    //    attractor.x - money.mesh.position.x,
    //    attractor.y - money.mesh.position.y,
    //    attractor.z - money.mesh.position.z);
    //  let attractDistSq = attractVector.lengthSq();
    //  if (attractDistSq < .01) {
    //    attractDistSq *= -8;
    //  }
    //  else {
    //    attractVector.normalize();
    //    money.vx += attractVector.x / attractDistSq / effectScale
    //      * dt * attractor.mass;
    //    money.vy += attractVector.y / attractDistSq / effectScale
    //      * dt * attractor.mass;
    //    money.vz += attractVector.z / attractDistSq / effectScale
    //      * dt * attractor.mass;
    //  }
    //}

  });
}
//spawnMoney(0, .6, 1000);

//let moneyCounter = 0;
//let moneyBaseRate = .5;
//let moneyRate = 5;
//let totalMoney = 1;
//updaters.push(function(i, dt, t) {
//  moneyCounter += dt;
//  moneyCounterRate = Math.min(moneyBaseRate, moneyRate/Math.sqrt(totalMoney));
//  while (moneyCounter > moneyCounterRate) {
//    moneyCounter -= moneyCounterRate;
//    spawnMoney();
//  }
//});

//updaters.push(function(i, dt, t) {
//  let averageVelocity = new THREE.Vector3(0, 0, 0);
//  let maxMoneyMass = 0;
//  for (let money of moneys) {
//    maxMoneyMass = Math.max(maxMoneyMass, money.mass);
//    averageVelocity.x += money.vx;
//    averageVelocity.y += money.vy;
//    averageVelocity.z += money.vz;
//  }
//  averageVelocity.multiply(
//    new THREE.Vector3(moneys.length, moneys.length, moneys.length));
//  if (moneys.length > 10 && averageVelocity.y < 0 && maxMoneyMass < 200) {
//    fire();
//  }
//});

//function fire() {
//    spawnMoney(0, -.5 + Math.random() * .2, 0, 500, -.4);
//}



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
//updaters.push(function(i, dt, t) {
//  cullCounter += dt;
//  while(cullCounter > cullRate) {
//    cullCounter -= cullRate;
//    let biggestMoney = null;
//    for (let money of moneys) {
//      if(biggestMoney == null || money.mass > biggestMoney.mass) {
//        biggestMoney = money;
//      }
//    }
//    if (biggestMoney != null) {
//      totalMoney += biggestMoney.mass;
//      biggestMoney.collided = true;
//      document.getElementById("money").innerHTML = "" + Math.floor(totalMoney);
//    }
//  }
//  expected += dt * 100;
//  document.getElementById("expected").innerHTML = "" + Math.floor(expected);
//});

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
