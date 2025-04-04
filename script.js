/*
COSC 3306 Group 2
Student Name: Jiayi Zhang, Md Bhuiyan, Cole DellaSavia

Purpose: using Three.js draw island scene with animations, 10 distinct elements 
and interaction.

Reference: 
https://codepen.io/ptc24/pen/BpXbOW
https://hofk.de/main/ShaderBook/shader1/shader1.html

*/

let camera, controls, controlsk, scene, renderer, shaderMaterial;
let moveForward = false, moveBackward = false;
let speed = 2;
let timea = 0;
let water_level = -0.3;
let boat, dove, fish, eagle, buoy;

// main method
function main(){
	scene = new THREE.Scene()
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	//ARButton has conflicts with OrbitControls on camera and input control
	//renderer.xr.enabled = true;
	//document.body.appendChild(THREE.VRButton.createButton(renderer));

	//set camera
	camera.position.set(0, 15, 25);
	//set orbit control
	controls = new THREE.OrbitControls(camera);
	controls.target.set(0, 0, 0);

	// Setup pointer lock control to handle keyboard input
	controlsk = new THREE.PointerLockControls(camera, document.body);
	scene.add(controlsk.getObject());
	
	// Add event listeners
	//document.addEventListener('click', () => controls.lock());
	document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);

	// Directional Light (like sunlight)
	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
	directionalLight.position.set(-5, 10, 5);
	directionalLight.castShadow = true;
	scene.add(directionalLight);
	// Ambient Light 
	scene.add(new THREE.AmbientLight(0x000055));
	var light = new THREE.PointLight( 0xffcc77, 1);
	scene.add(light);
	light.position.set(-3,10,0);
		
	// Point Light
	light2 = new THREE.PointLight( 0xffcc77, 1.0);
	scene.add(light2);
	light2.position.set(4,2,3);
	
	// Skybox
	const loader = new THREE.CubeTextureLoader();
	const skyboxname = 'flame';
	const basePath = `./${skyboxname}`
	const skyboxtexture = loader.load([
	  basePath+'_ft.jpg',
	  basePath+'_bk.jpg',
	  basePath+'_up.jpg',
	  basePath+'_dn.jpg',
	  basePath+'_rt.jpg',
	  basePath+'_lf.jpg'
	]);
	//use scene background as skybox
	scene.background = skyboxtexture;

	//using Perlin noise to create terrain
	var pgeom = new THREE.PlaneGeometry(60,60,99,99);
	var plane = THREE.SceneUtils.createMultiMaterialObject( pgeom, [
		new THREE.MeshPhongMaterial( { color: 0x33ff33, specular: 0x773300, side: THREE.DoubleSide,  shading: THREE.FlatShading, shininess: 3} )
	]);

	plane.rotation.x = -Math.PI / 2;
	plane.position.y = 0.1;

	var heightScale = 9; //set mountain height scale
	var waterLevel = water_level; // set water level
	var ex = 0.5; //factor controls the amplitude decay between octaves
	noise.seed(Math.random());
	for(var i=0;i<100;i++) {
	  for(var j=0;j<100;j++) {
		var x = (i/100 - 0.5) * 5;
		var y = (j/100 - 0.5) * 5;
		var distance = Math.sqrt(x*x + y*y);
		var radius = 5.2;
		var falloff = 1 - Math.min(distance/radius, 1);
		falloff = Math.pow(falloff, 3); //make flat at edge of the plane
		
		pgeom.vertices[i+j*100].z = ((noise.simplex2(i/100,j/100)+
		(noise.simplex2((i+200)/50,j/50)*Math.pow(ex,1))+
		(noise.simplex2((i+400)/25,j/25)*Math.pow(ex,2))+
		  (noise.simplex2((i+600)/12.5,j/12.5)*Math.pow(ex,3))+
		  (noise.simplex2((i+800)/6.25,j/6.25)*Math.pow(ex,4)))/2)* falloff * heightScale+waterLevel;
	  }
	}
	scene.add(plane);

	// Water plane
	var waterGeom = new THREE.PlaneGeometry(300, 300);
	var waterMat = new THREE.MeshPhongMaterial({
	  color: 0x0000ff,
	  transparent: true,
	  opacity: 0.6,
	  side: THREE.DoubleSide
	});
	var water = new THREE.Mesh(waterGeom, waterMat);
	water.rotation.x = plane.rotation.x;
	water.position.y = water_level;
	water.position.z = -0.5;
	scene.add(water);

	//neon board
	shaderMaterial = new THREE.ShaderMaterial({
		uniforms: { 
				time: { value: 0 },
				v_Uv: { value: new THREE.Vector2( ) }
		},
		vertexShader: vertexShader( ), 
		fragmentShader: fragmentShader( ),
		side: THREE.DoubleSide,
		transparent: true,
	});
	const planeGeometry = new THREE.PlaneBufferGeometry( 16, 5 );
	const planeMesh = new THREE.Mesh( planeGeometry, shaderMaterial );
	planeMesh.position.set(-12, 1, -40);
	scene.add( planeMesh );
	//---

	// Load MTL(Material Template Library) for objects
	const mtlLoader = new THREE.MTLLoader();
    // Load lighthouse
    mtlLoader.load('lighthouse.mtl', (materials) => {
      materials.preload();
      const objLoader = new THREE.OBJLoader();
      objLoader.setMaterials(materials);
	  
      objLoader.load('lighthouse.obj', (lighthouse) => {
        lighthouse.position.set(0, 0, -27); 
		lighthouse.scale.set(0.15, 0.15, 0.15);
		scene.add(lighthouse);
        
      });
    });
	
	// Load house3d object
	mtlLoader.load('house3d.mtl', (materials) => {
      materials.preload();
      const objLoader = new THREE.OBJLoader();
      objLoader.setMaterials(materials);
	  
      objLoader.load('house3d.obj', (house3d) => {
        house3d.position.set(-27, 0, -27); 
		house3d.scale.set(0.4, 0.4, 0.4);
		scene.add(house3d);
        
      });
    });

	//// Load stone object
	mtlLoader.load('stone.mtl', (materials) => {
      materials.preload();
      const objLoader = new THREE.OBJLoader();
      objLoader.setMaterials(materials);
	  
      objLoader.load('stone.obj', (stone) => {
        stone.position.set(21, -0.1, -6); 
		stone.scale.set(0.05, 0.05, 0.05);
		scene.add(stone);
        
      });
    });
	
	// Load palmtree#1 object
	mtlLoader.load('palmtree.mtl', (materials2) => {
      materials2.preload();
      const objLoader = new THREE.OBJLoader();
      objLoader.setMaterials(materials2);
	  
      objLoader.load('palmtree.obj', (tree1) => {
        tree1.position.set(24, -0.5, -8); 
		tree1.scale.set(0.003, 0.003, 0.003);
		scene.add(tree1);
        
      });
    });
	
	// Load palmtree#2 object
	mtlLoader.load('palmtree.mtl', (materials2) => {
      materials2.preload();
      const objLoader = new THREE.OBJLoader();
      objLoader.setMaterials(materials2);
	  
      objLoader.load('palmtree.obj', (tree2) => {
        tree2.position.set(-25, -0.5, 3); 
		tree2.scale.set(0.003, 0.003, 0.003);
		scene.add(tree2);
        
      });
    });
	
	// Load boat object
	mtlLoader.load('boat.mtl', (materials) => {
      materials.preload();
      const objLoader = new THREE.OBJLoader();
      objLoader.setMaterials(materials);
	  
      objLoader.load('boat.obj', (loadedboat) => {
		boat = loadedboat;
        boat.position.set(-35, -0.25, -8); 
		boat.scale.set(0.03, 0.03, 0.03);
		scene.add(boat);
        
      });
    });
	
	// Load bird object
	mtlLoader.load('dove.mtl', (materials) => {
      materials.preload();
      const objLoader = new THREE.OBJLoader();
      objLoader.setMaterials(materials);
	  
      objLoader.load('dove.obj', (loadeddove) => {
		dove = loadeddove;
        dove.position.set(8, 8, -8); 
		dove.scale.set(10, 10, 10);
		scene.add(dove);
        
      });
    });
	
	// Load fish object	
	mtlLoader.load('fish.mtl', (materials) => {
      materials.preload();
      const objLoader = new THREE.OBJLoader();
      objLoader.setMaterials(materials);
	  
      objLoader.load('fish.obj', (loadedfish) => {
		fish = loadedfish;
        fish.position.set(42, -0.8, -8); 
		fish.scale.set(1, 1, 1);
		scene.add(fish);
        
      });
    });

	// Load others object 
	const objLoader = new THREE.OBJLoader();
		
	// Load eagle object 
	objLoader.load('eagle.obj', (loadedeagle) => {
		eagle = loadedeagle;
		eagle.position.set(0, 6, -10);
		eagle.scale.set(2, 2, 2);
		eagle.rotation.x = Math.PI / 2;
		
		const material1 = new THREE.MeshStandardMaterial({ color: 0xAA3300 }); // crimson

		// traverse the loaded object and apply the material to all meshes
		eagle.traverse((child) => {
			if (child.isMesh) {
				child.material = material1;
			}
		});
		scene.add(eagle);
		
	});
	
	// Load buoy object 
	objLoader.load('buoy.obj', (loadedbuoy) => {
		buoy = loadedbuoy;
		buoy.position.set(35, -0.5, -8);
		buoy.scale.set(0.6, 0.6, 0.6);
		buoy.rotation.x = Math.PI / 2;
		
		const material1 = new THREE.MeshStandardMaterial({ color: 0xFFA500 }); // orangecrimson

		// traverse the loaded object and apply the material to all meshes
		buoy.traverse((child) => {
			if (child.isMesh) {
				child.material = material1;
			}
		});
		scene.add(buoy);
		
	});
	
		
	// Load text object 
	objLoader.load('cosc3306.obj', (texto) => {
		texto.position.set(-20, 1, -40);
		texto.rotation.x = -Math.PI/2;
		texto.rotation.y = -Math.PI;
		texto.rotation.z = Math.PI;
		texto.scale.set(3, 3, 3);
		
		const material2 = new THREE.MeshStandardMaterial({ color: 0xAA3300 }); // crimson

		// traverse the loaded object and apply the material to all meshes
		texto.traverse((child) => {
			if (child.isMesh) {
				child.material = material2;
			}
		});
		scene.add(texto);
		
	});
}

//define vertex shader
function vertexShader ( ) { //   return `    `;   a multiline template literal 
    return `
        varying vec2 v_Uv;
        
		void main( ) {

				v_Uv = uv;
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				gl_Position = projectionMatrix * mvPosition;
            
		} 
    `;
}

//define fragment shader
function fragmentShader( ) {
    return `
        varying vec2 v_Uv;
		uniform float time;
        
        void main( ) {
            
            vec2 position = v_Uv;
            vec3 color1 = vec3(sin(time) * 0.5 + 0.5, 0.3, 0.5);
                        
            gl_FragColor = vec4( color1, position.y ); // color, transparency
        
        }
    `;
}

//key press down event
function onKeyDown(event) {
	switch(event.key) {
		case 'w': moveForward = true; break;
		case 's': moveBackward = true; break;
		
	}
}

//key release event
function onKeyUp(event) {
	switch(event.key) {
		case 'w': moveForward = false; break;
		case 's': moveBackward = false; break;
		
	}
}

//animation loop control
function animate() {
	
	// Update uniforms to refresh Neon board
    shaderMaterial.uniforms.time.value = timea;
    timea += 0.1;
			
	//rotate eagle icon
	if (eagle) { // Only rotate if eagle is loaded
        eagle.rotation.z += 0.06;
    }
	
	//frame control
	const delta = 0.1;
	const direction = new THREE.Vector3();
	//driving boat control
	if (moveForward) { 
		boat.rotation.y = Math.PI / 2;
		boat.position.z -= speed;
	}
	if (moveBackward) { 
		boat.rotation.y = -Math.PI / 2;
		boat.position.z += speed;
	}
	
	//bird movement control
	const time = Date.now() * 0.001; // Convert milliseconds to seconds
	if (dove) { // Only rotate if dove is loaded
	   dove.rotation.y = - Math.sin(time) * Math.PI / 2;
       dove.position.x = Math.sin(time) * 20;
	   dove.position.z = Math.cos(time) * 20;
    }
	
	//fish movement control
	if (fish) { // Only rotate if fish is loaded
		// Calculate direction (1 for positive, -1 for negative)
	   const direction = Math.sign(Math.sin(time * 2));

	   // Flip rotation by 180 degrees (π radians) when direction changes
	   fish.rotation.y = (Math.sin(time * 2) + 1) * Math.PI / 2;;
	   fish.position.y = Math.sin(time) * 0.4-0.5; //up & down in the water
       fish.position.z = Math.sin(time) * 15;
	   
    }
	
	//buoy movement control
	if (buoy) { // Only rotate if buoy is loaded
	   buoy.position.y = -Math.sin(time) * 0.4-0.4; //up & down in the water
	   
    }
	
	controls.update();
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

main();
animate();