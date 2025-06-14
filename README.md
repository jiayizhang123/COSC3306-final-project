# COSC3306-final-project
Introduction:
    The objective is to draw an island scene with animations, 10 distinct elements and interaction by using Three.js and knowledge learnt from COSC 3306.
Our island terrain design is inspired from Course 17-Perlin noise examples, but the edge of this example is not natural.  https://codepen.io/ptc24/pen/BpXbOW
 In order to make the edge of terrain flat, we use variables “falloff” to gradually lower the height of terrain around the center of the plane:
	var distance = Math.sqrt(x*x + y*y);	
	var falloff = 1 - Math.min(distance/radius, 1);
Call Perlin noise.simplex2 to create 5 noise layers, and control part of plane under water:
….(noise.simplex2((i+800)/6.25,j/6.25)*Math.pow(ex,4)))/2)* falloff * heightScale+waterLevel
We design a neon board. In order to show the diversity color, we use THREE.ShaderMaterial to implement on a 16*5 plane, add time value in the uniforms of ShaderMaterial, and use sin(time) to control color in fragmentShader, then change the time value in animate method to show the animation.
![alt text](https://github.com/jiayizhang123/COSC3306-final-project/blob/main/demo1.png?raw=true)
live link: https://jiayizhang123.github.io/COSC3306-final-project/
