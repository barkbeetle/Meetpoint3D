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
	ResourceManager.addRequest("character1", "res/models/characters/character1.moj", "xml");
	ResourceManager.addRequest("character2", "res/models/characters/character2.moj", "xml");
	ResourceManager.addRequest("character3", "res/models/characters/character3.moj", "xml");
	ResourceManager.addDependencies(["character1", "character2", "character3"], setupScene);
	ResourceManager.loadAll();
}

function setupScene()
{
	// setup world
	var world = new World();
	Mp3D.activeWorld = world;
	
	var light = new Light();
	light.direction = [0, 0, -1];
	light.ambientColor = [0.1, 0.1, 0.1];
	light.diffuseColor = [1.0, 1.0, 1.0];
	light.specularColor = [1.0, 1.0, 1.0];
	
	var camera = new Camera();
	cameraNode = new Node();
		camera.node = cameraNode;
	
	world.lights.push(light);
	world.camera = camera;
	
	// add character
	character1 = MojitoLoader.parseMojito(ResourceManager.data.character1);
	character1.translate([-1.5, 0, 0]);
	character1.scale([0.008, 0.008, 0.008]);
	//character1.rotate(Mp3D.degToRad(180), [0, 1, 0]);
	world.nodes.push(character1);
	
	character2 = MojitoLoader.parseMojito(ResourceManager.data.character2);
	character2.translate([1.5, 0, 0]);
	character2.scale([0.008, 0.008, 0.008]);
	//character2.rotate(Mp3D.degToRad(180), [0, 1, 0]);
	world.nodes.push(character2);
	
	character3 = MojitoLoader.parseMojito(ResourceManager.data.character3);
	character3.translate([0, 0, 2.6]);
	character3.scale([0.008, 0.008, 0.008]);
	//character3.rotate(Mp3D.degToRad(180), [0, 1, 0]);
	world.nodes.push(character3);
	
	cameraNode.translate([0, 2, 10]);
	cameraNode.rotate(Mp3D.degToRad(-4), [1, 0, 0]);

	//cameraNode.translate([0, 200, 1000]);
	//character1.append(cameraNode);

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

	character1.rotate(Mp3D.degToRad(15)*elapsed, [0, 1, 0]);

	Mp3D.drawScene();
	requestAnimFrame(main);
}

