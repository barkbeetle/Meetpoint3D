key = new Array();
ignoredKeys = [37, 38, 39, 40];

//serverAddress = "http://localhost:63387";
serverAddress = "https://mp3d.newtonweb.net";

myClient = new Client();
otherClients = [];

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
				event.preventDefault();
			}
			key[event.which] = true;
	
		});
		$(window).keyup(function(event)
		{
			key[event.which] = false;
		});
		$("#chat_input").focus();
		$("#chat_input").keypress(function(event)
		{
			if(event.which == 13)
				sendMessage();
		});
		
		characterId = Math.floor(Math.random()*3);
	}
});

function prepare()
{
	joinGame(characterId);
}

function loadResources()
{
	var characterModel = "";
	
	if(characterId == 0)
		characterModel = "res/models/characters/character1.moj";
	else if(characterId == 1)
		characterModel = "res/models/characters/character2.moj";
	else
		characterModel = "res/models/characters/character3.moj";

	ResourceManager.addRequest("level1", "res/models/level1/level1.moj", "xml");
	ResourceManager.addRequest("character1", characterModel, "xml");
	ResourceManager.addRequest("bubble1", "res/models/characters/bubble1.moj", "xml");
	ResourceManager.addDependencies(["level1", "character1", "bubble1"], setupScene);
	ResourceManager.loadAll();
}

function setupScene()
{
	// setup world
	var world = new World();
	Mp3D.activeWorld = world;
	
	var light = new Light();
	light.direction = [1, -1, -2];
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
	world.nodes.push(character1);
	bubble1 = MojitoLoader.parseMojito(ResourceManager.data.bubble1);
	
	level1 = MojitoLoader.parseMojito(ResourceManager.data.level1);
	level1.translate([0, 0, 0]);
	level1.scale([0.1, 0.1, 0.1]);
	world.nodes.push(level1);
	
	cameraNode.translate([0, 2, 10]);
	cameraNode.rotate(Mp3D.degToRad(-8), [1, 0, 0]);

	cameraNode.translate([0, 200, 1000]);
	
	character1.append(cameraNode);
	character1.append(bubble1);
	
	myClient.node = character1;
	myClient.scale =  0.008;
	myClient.xPosition = 0;
	myClient.zPosition = 0;
	myClient.angle = 0;
	
	myClient.bubbleNode = bubble1;

	startGame();
}

function startGame()
{
	timeBefore = 0;
	sendCoordinates();
	main();
}

function main()
{
	var d = new Date();
	var timeNow = d.getTime();
	
    if(timeBefore)
    	elapsed = (timeNow-timeBefore)/1000;
    else
    	elapsed = 0;

	timeBefore = timeNow;

	if(key[37])
	{
		// turn left
		myClient.rotate(90*elapsed);
	}
	if(key[39])
	{
		// turn right
		myClient.rotate(-90*elapsed);
	}
	if(key[38])
	{
		// move forward
		myClient.move(10*elapsed);
	}
	if(key[40])
	{
		// move backward
		myClient.move(-10*elapsed);
	}
	
	if(myClient.xPosition > 48.8)
		myClient.xPosition = 48.8;
	if(myClient.xPosition < -48.8)
		myClient.xPosition = -48.8;
	if(myClient.zPosition > 48.8)
		myClient.zPosition = 48.8;
	if(myClient.zPosition < -48.8)
		myClient.zPosition = -48.8;
	
	myClient.updateNode();
	myClient.bubbleAngle += 90*elapsed;
	
	for(var clientId in otherClients)
	{
		if(clientId != "contains")
		{
			otherClients[clientId].bubbleAngle += 90*elapsed;
			otherClients[clientId].updateNode();
		}
	}

	Mp3D.drawScene();
	requestAnimFrame(main);
}

function joinGame(characterId)
{
	$.ajax({
		url: serverAddress+"/register?"+characterId,
		type: "GET",
		dataType: "text",
		success: function(data)
		{
			myClient.clientId = data;
			loadResources();
		},
		error: function(error)
		{
			Mp3D.error(error.responseText);
		}
	});
}

function sendCoordinates()
{
	var informationString = myClient.getInformationString();
	$.ajax({
		url: serverAddress+"/position?"+informationString,
		type: "GET",
		dataType: "text",
		success: receiveCoordinates,
		error: function(error)
		{
			Mp3D.error(error.responseText);
		}
	});
}

function receiveCoordinates(data)
{
	var clientsToRemove = []
	for(var clientId in otherClients)
	{
		if(clientId != "contains")
		{
			clientsToRemove[clientId] = true;
		}
	}
	
	var allClients = data.split("\n");
	$.each(allClients, function()
	{
		if(this.substr(0, 1) == "@")
		{		
			// chat message
			var delimiterPos = this.indexOf(";");
			var sender = this.substr(1, delimiterPos-1);
			var message = this.substr(delimiterPos+1, this.length-delimiterPos-1);
			
			var paragraph = document.createElement("p");
			var bold = document.createElement("b");
			var senderNode = document.createTextNode(unescape(sender)+":");
			var spaceNode = document.createElement("span");
			var messageNode = document.createTextNode(unescape(message));
			
			spaceNode.innerHTML = "&nbsp;";
			
			bold.appendChild(senderNode);
			paragraph.appendChild(bold);
			bold.appendChild(spaceNode);
			paragraph.appendChild(messageNode);
			
			$("#chat").prepend(paragraph);
			
			if(sender == myClient.clientId)
			{
				myClient.lastSpeaking = new Date().getTime();
			}
			else
			{
				otherClients[sender].lastSpeaking = new Date().getTime();
			}
		}
		else
		{
			// client information
			var clientInfo = this.split(";");
			
			var clientId = clientInfo[0];
			var characterId = clientInfo[1];
			var xPosition = parseFloat(clientInfo[2]);
			var zPosition = parseFloat(clientInfo[3]);
			var angle = parseFloat(clientInfo[4]);
			
			delete clientsToRemove[clientId];
			
			if(clientId && clientId != myClient.clientId)
			{
				var client = otherClients[clientId];
				if(client)
				{
					// client already exists, update position and angle
					client.newXPosition = xPosition;
					client.newZPosition = zPosition;
					client.newAngle = angle;
				}
				else
				{
					// new client
					client = new Client();
					client.clientId = clientId;
					client.characterId = characterId;
					
					var characterModel = "res/models/characters/character2.moj";
					var bubbleModel = "res/models/characters/bubble1.moj";
					
					if(characterId == 0)
						characterModel = "res/models/characters/character1.moj";
					else if(characterId == 1)
						characterModel = "res/models/characters/character2.moj";
					else
						characterModel = "res/models/characters/character3.moj";
				
					
					$.ajax({
						url: characterModel,
						type: "GET",
						dataType: "xml",
						success: function(data)
						{
							loadClientCharacter(client, data);
						}
					});
					
					$.ajax({
						url: bubbleModel,
						type: "GET",
						dataType: "xml",
						success: function(data)
						{
							loadClientBubble(client, data);
						}
					});
						
					client.scale = 0.008;
					client.xPosition = xPosition;
					client.zPosition = zPosition;
					client.angle = angle;
					client.newXPosition = xPosition;
					client.newZPosition = zPosition;
					client.newAngle = angle;
					client.smoothMovements = true;
					
					otherClients[client.clientId] = client;
				}
			}
		}
	});
	
	
	// remove clients which are not on the list
	for(var clientId in clientsToRemove)
	{
		if(clientId != "contains")
		{
			Mp3D.activeWorld.nodes.splice(Mp3D.activeWorld.nodes.indexOf(otherClients[clientId].node), 1);
			delete otherClients[clientId];
		}
	}
	
	setTimeout(sendCoordinates, 100);
}

function loadClientCharacter(client, modelData)
{
	var character = MojitoLoader.parseMojito(modelData);
	Mp3D.activeWorld.nodes.push(character);
	client.node = character;
	if(client.bubbleNode)
	{
		client.node.append(client.bubbleNode);
	}
	client.updateNode();
}

function loadClientBubble(client, modelData)
{
	var bubble = MojitoLoader.parseMojito(modelData);
	if(client.node)
	{
		client.node.append(bubble);
	}
	client.bubbleNode = bubble;
}

function sendMessage()
{
	var message = escape($("#chat_input")[0].value);
	$("#chat_input")[0].value = ""
	if(message)
	{
		$.ajax({
			url: serverAddress+"/chat?"+myClient.clientId+"&"+message,
			type: "GET",
			dataType: "text",
			error: function(error)
			{
				Mp3D.error(error.responseText);
			}
		});
	}
}

