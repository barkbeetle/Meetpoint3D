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
	
	//cubeNode = MojitoLoader.parseMojito(ResourceManager.data.cube1);
    
    var cube = Mp3D.createCube();
	cubeNode = new Node();
	cubeNode.model = cube;
	
	cubeAngle = 0;

	world.nodes.push(cubeNode);
	
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
	
	mat4.identity(cubeNode.transformation);
	mat4.translate(cubeNode.transformation, [0, 0, -7]);
	mat4.rotate(cubeNode.transformation, cubeAngle, [2, 1, 1]);

	Mp3D.drawScene();
	requestAnimFrame(main);
}
