Mp3D = new Object();

Mp3D.materials = new Array();
Mp3D.defaultMaterial = null;
Mp3D.materialClasses = new Array();
Mp3D.readyFunctions = new Array();
Mp3D.mvStack = new Array();

Mp3D.ready = function(func)
{
	Mp3D.readyFunctions.push(func);
}

Mp3D.init = function()
{
	// register all resources needed for the game to startup

	// material definition
	ResourceManager.addRequest("materialDefinition", "res/materials.xml", "xml");
	ResourceManager.addDependency("materialDefinition", Mp3D.setup);

	// material resources (only the ones which cannot be loaded at runtime)
	for(var i = 0; i < Mp3D.materialClasses.length; i++)
	{
		var material = Mp3D.materialClasses[i];
		var materialDependencies = material.getResourceDependencies();
		
		$.each(materialDependencies, function()
		{
			ResourceManager.addRequest(this[0], this[1]);
			ResourceManager.addDependency(this[0], Mp3D.setup);
		});
	}
	
	ResourceManager.loadAll();
}

Mp3D.setup = function()
{
	Mp3D.gl = Mp3D.createWebGLContext();
	Mp3D.setupViewport();
	Mp3D.createMaterials();
	Mp3D.activeWorld = null;
	
	while(Mp3D.readyFunctions.length > 0)
	{
		var func = Mp3D.readyFunctions.shift();
		func();
	}
}

Mp3D.createWebGLContext = function()
{
	var glContext;
	var canvasElement = $("#glcanvas")[0];

	try
	{
		glContext = canvasElement.getContext("webgl");
	}
	catch(e)
	{
		Mp3D.error(e);
	}
	
	if(!glContext)
	{
		try
		{
			glContext = canvasElement.getContext("experimental-webgl");
		}
		catch(e)
		{
			Mp3D.error(e);
		}
	}

	if(glContext)
	{
		glContext.viewportWidth = canvasElement.width;
		glContext.viewportHeight = canvasElement.height;
  		glContext.clearColor(0, 0, 0, 1);
  		glContext.enable(WebGLRenderingContext.DEPTH_TEST);
	}
	else
	{
		var message = "Your browser does not support WebGL. See <a href=\"index.php?content=help#unsupported_browser\">this</a> help section for more information.";
		Mp3D.error(message);
	}
	
	return glContext;
}

Mp3D.setupViewport = function()
{
	Mp3D.gl.viewport(0, 0, Mp3D.gl.viewportWidth, Mp3D.gl.viewportHeight);
	Mp3D.gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);
		
	// model view matrix
	Mp3D.mvMatrix = mat4.create();
	mat4.identity(Mp3D.mvMatrix);
	
	// projection matrix
  	Mp3D.pMatrix = mat4.create();
	mat4.perspective(45, Mp3D.gl.viewportWidth / Mp3D.gl.viewportHeight, 0.1, 200000.0, Mp3D.pMatrix);

	// normal matrix
	Mp3D.normalMatrix = mat3.create();
	mat3.identity(Mp3D.normalMatrix);
}

Mp3D.registerMaterialClass = function(materialClass)
{
	Mp3D.materialClasses.push(materialClass);
}

Mp3D.createMaterials = function()
{
	// initialize all material classes
	for(var i = 0; i < Mp3D.materialClasses.length; i++)
	{
		var material = Mp3D.materialClasses[i];
		material.init();
	}
	
	// read materials from config file
	var materialDefinition = ResourceManager.data.materialDefinition;
	if(materialDefinition)
	{
		$(materialDefinition).children("materials").children("material").each(function()
		{
			Mp3D.parseMaterialNode(this);
		});
	}
	
}

Mp3D.parseMaterialNode = function(materialNode)
{
	var materialName = $(materialNode)[0].attributes["name"].value;
	var materialClass = $(materialNode).children("class")[0].attributes["name"].value;
	var materialDefault = $(materialNode)[0].attributes["default"];
	
	var material = eval("new "+materialClass+"()");
	
	var attributesNode = $(materialNode).children("attributes");	
	$.each(attributesNode.children(), function()
	{
		var attributeType = this.nodeName;
		var attributeName = this.attributes["name"].value;
		var attributeValue = this.attributes["value"].value;
		
		if(attributeType.toLowerCase() == "string")
		{
			var command  = "material.set"+attributeName.charAt(0).toUpperCase() + attributeName.slice(1)+"('"+attributeValue+"')";
			eval(command);
		}
		else
		{
			var command  = "material.set"+attributeName.charAt(0).toUpperCase() + attributeName.slice(1)+"("+attributeValue+")";
			eval(command);
		}
	});
	
	if(Mp3D.materials[materialName])
	{
		throw "duplicate entry for material '"+materialName+"'";
	}
	else
	{
		Mp3D.materials[materialName] = material;
		
		if(materialDefault && materialDefault.value.toLowerCase()== "true")
		{
			if(!Mp3D.defaultMaterial)
			{
				Mp3D.defaultMaterial = material;
			}
			else
			{
				throw "only one material can be configured to be default."
			}
		}
	}
}

Mp3D.loadVertexShader = function(name)
{
	return Mp3D.loadShader(name, "vertex");
}

Mp3D.loadFragmentShader = function(name)
{
	return Mp3D.loadShader(name, "fragment");
}

Mp3D.loadShader = function(name, type)
{
	var shader = null;
	var source = ResourceManager.data[name];
	
	if(type=="vertex")
	{
		shader = Mp3D.gl.createShader(WebGLRenderingContext.VERTEX_SHADER);
	}
	else if(type=="fragment")
	{
		shader = Mp3D.gl.createShader(WebGLRenderingContext.FRAGMENT_SHADER);
	}
	else
	{
		Mp3D.error("Unknown shader type: "+type);
		return null;
	}

	Mp3D.gl.shaderSource(shader, source);
	Mp3D.gl.compileShader(shader);
	
	if (!Mp3D.gl.getShaderParameter(shader, WebGLRenderingContext.COMPILE_STATUS))
	{
		Mp3D.error("Could not compile shader. "+Mp3D.gl.getShaderInfoLog(shader));
		return null;
	}
		
	return shader;
}

Mp3D.handleLoadedTexture = function(texture)
{
	Mp3D.gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, texture);
	Mp3D.gl.pixelStorei(WebGLRenderingContext.UNPACK_FLIP_Y_WEBGL, true);
	Mp3D.gl.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, WebGLRenderingContext.RGBA, WebGLRenderingContext.RGBA, WebGLRenderingContext.UNSIGNED_BYTE, texture.image);
	Mp3D.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_MAG_FILTER, WebGLRenderingContext.LINEAR);
    Mp3D.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_MIN_FILTER, WebGLRenderingContext.LINEAR_MIPMAP_LINEAR);
	Mp3D.gl.generateMipmap(WebGLRenderingContext.TEXTURE_2D);
}

Mp3D.pushMV = function()
{
	var newMV = mat4.create();
	mat4.set(Mp3D.mvMatrix, newMV)
	Mp3D.mvStack.push(newMV);
}

Mp3D.popMV = function()
{
	mat4.set(Mp3D.mvStack.pop(), Mp3D.mvMatrix);
}

Mp3D.drawScene = function()
{
	// clear screen
	Mp3D.gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);
	
	if(Mp3D.activeWorld.camera)
	{
		mat4.inverse(Mp3D.activeWorld.camera.getTransformation(), Mp3D.mvMatrix);
	}
	
	// calculate normal matrix
    mat4.toInverseMat3(Mp3D.mvMatrix, Mp3D.normalMatrix);
    mat3.transpose(Mp3D.normalMatrix);   
    
    $.each(Mp3D.activeWorld.lights, function()
	{
	    // set light direction relative to camera		
		mat4.multiplyVec3(mat3.toMat4(Mp3D.normalMatrix), Mp3D.activeWorld.lights[0].direction, Mp3D.activeWorld.lights[0].relativeDirection);
	});
    
    // modify light 
	var newDirection = [];		
	mat4.multiplyVec3(mat3.toMat4(Mp3D.normalMatrix), Mp3D.activeWorld.lights[0].direction, newDirection);
			
	$.each(Mp3D.activeWorld.nodes, function()
	{
		this.draw(Mp3D.mvMatrix);
	});
}

Mp3D.degToRad = function(degAngle)
{
	return (degAngle/180*Math.PI);
}

Mp3D.error = function(text)
{
	$("#error").append("<p>"+text+"</p>");
}


