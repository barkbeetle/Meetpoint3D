$(document).ready(function()
{
	if($.url.param("content") == "play")
	{
		Mp3D.ready(function()
		{
			prepare();
		});
		Mp3D.init();
	}
});

function prepare()
{
	loadResources();
}

function loadResources()
{
	ResourceManager.addRequest("cube1", "res/cube1.moj");
	ResourceManager.addDependency("cube1", setupScene);
	ResourceManager.loadAll();
}

function setupScene()
{
	// setup world
	var world = new World();
	Mp3D.activeWorld = world;
	
	var light = new Light();
	light.direction = [1, -1, -3];
	light.ambientColor = [0.2, 0.2, 0.2];
	light.diffuseColor = [1.0, 1.0, 1.0];
	
	world.lights.push(light);
	
	// cube
	//cube = Mp3D.parseMojito(ResourceManager.data.cube1);
    
    cube = Mp3D.createCube();
    cubeAngle = 0;
	world.models.push(cube);
	
	startGame();
}

function startGame()
{
	timeBefore = 0;
	main();
}

function main()
{
	var timeNow = new Date().getTime();
	
    if(timeBefore)
    	elapsed = (timeNow-timeBefore)/1000;
    else
    	elapsed = 0;

	timeBefore = timeNow;

	cubeAngle += Mp3D.degToRad(50)*elapsed;
	
	mat4.identity(cube.transformation);
	mat4.translate(cube.transformation, [0, 0, -7]);
	mat4.rotate(cube.transformation, cubeAngle, [2, 1, 1]);

	Mp3D.drawScene();
	requestAnimFrame(main);
}
