key = new Array();
ignoredKeys = [37, 38, 39, 40];

Array.prototype.contains = function(value)
{
    for (var key in this)
        if (this[key] === value) return true;
    return false;
}

$(document).ready(function()
{
	if($.url.param("content") == "play")
	{
		Mp3D.ready(function()
		{
			prepare();
		});
		Mp3D.init();
		
		$(window).keydown(function(event)
		{
			if(ignoredKeys.contains(event.which))
			{
				event.preventDefault(); //prevent from doing whatever this key is supposed to do
			}
			key[event.which] = true;
	
		});
		$(window).keyup(function(event)
		{
			key[event.which] = false;			
		});
		
	}
});

function prepare()
{
	loadResources();
}

function loadResources()
{
	ResourceManager.addRequest("level1", "res/models/level1/level1.moj", "xml");
	ResourceManager.addRequest("character1", "res/models/characters/character1.moj", "xml");
	ResourceManager.addDependencies(["character1", "level1"], setupScene);
	ResourceManager.loadAll();
}

function setupScene()
{
	// setup world
	var world = new World();
	Mp3D.activeWorld = world;
	
	var light = new Light();
	light.direction = [0, -1, -1];
	light.ambientColor = [0.2, 0.2, 0.2];
	light.diffuseColor = [1.0, 1.0, 1.0];
	light.specularColor = [1.0, 1.0, 1.0];
	
	var camera = new Camera();
	cameraNode = new Node();
		camera.node = cameraNode;
	
	world.lights.push(light);
	world.camera = camera;
	
	// add character
	character1 = MojitoLoader.parseMojito(ResourceManager.data.character1);
	character1.translate([0, 0, 50]);
	character1.scale([0.008, 0.008, 0.008]);
	//character1.rotate(Mp3D.degToRad(180), [0, 1, 0]);
	world.nodes.push(character1);
	
	level1 = MojitoLoader.parseMojito(ResourceManager.data.level1);
	level1.translate([0, 0, 0]);
	level1.scale([0.1, 0.1, 0.1]);
	world.nodes.push(level1);
	
	cameraNode.translate([0, 2, 10]);
	cameraNode.rotate(Mp3D.degToRad(-8), [1, 0, 0]);

	cameraNode.translate([0, 200, 1000]);
	character1.append(cameraNode);

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

	if(key[37])
	{
		// turn left
		character1.rotate(Mp3D.degToRad(90)*elapsed, [0, 1, 0]);
	}
	if(key[38])
	{
		// move forward
		character1.translate([0, 0, -1000*elapsed]);
	}

	if(key[39])
	{
		// turn right
		character1.rotate(Mp3D.degToRad(-90)*elapsed, [0, 1, 0]);
	}
	if(key[40])
	{
		// move backward
		character1.translate([0, 0, 1000*elapsed]);
	}

	Mp3D.drawScene();
	requestAnimFrame(main);
}


