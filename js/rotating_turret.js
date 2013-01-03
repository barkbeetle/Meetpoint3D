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
	ResourceManager.addRequest("turret", "res/models/turret/turret2.moj", "xml");
	ResourceManager.addDependencies(["turret"], setupScene);
	ResourceManager.loadAll();
}

function setupScene()
{
	// setup world
	var world = new World();
	Mp3D.activeWorld = world;
	
	var light = new Light();
	light.direction = [0, 0, -3];
	light.ambientColor = [0.1, 0.1, 0.1];
	light.diffuseColor = [1.0, 1.0, 1.0];
	light.specularColor = [1.0, 1.0, 1.0];
	
	world.lights.push(light);	
	
	// add turret
	turret = MojitoLoader.parseMojito(ResourceManager.data.turret);
	turret.translate([0, -1, -4]);
	turret.scale([0.008, 0.008, 0.008]);
	turret.rotate(Mp3D.degToRad(-20), [0, 1, 0]);
	world.nodes.push(turret);

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

	turret.rotate(Mp3D.degToRad(15)*elapsed, [0, 1, 0]);

	Mp3D.drawScene();
	requestAnimFrame(main);
}

