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
	ResourceManager.addRequest("torus1", "res/torus1.moj");
	ResourceManager.addDependencies(["cube1", "torus1"], setupScene);
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
	
	// add cube
	cubeNode = MojitoLoader.parseMojito(ResourceManager.data.cube1);
   	mat4.translate(cubeNode.transformation, [2, 0, -10]);
	mat4.scale(cubeNode.transformation, [0.01, 0.01, 0.01]);
	world.nodes.push(cubeNode);
	
	// add torus
	torusNode = MojitoLoader.parseMojito(ResourceManager.data.torus1);
	torusNode.translate([-2, 0, -10]);
	torusNode.scale([0.006, 0.006, 0.006]);
	world.nodes.push(torusNode);
	
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

	mat4.rotate(cubeNode.transformation, Mp3D.degToRad(50)*elapsed, [2, 1, 1]);
	//mat4.rotate(torusNode.transformation, Mp3D.degToRad(-30)*elapsed, [2, 1, 1]);
	torusNode.rotate(Mp3D.degToRad(-40)*elapsed, [2, 1, 1]);

	Mp3D.drawScene();
	requestAnimFrame(main);
}

