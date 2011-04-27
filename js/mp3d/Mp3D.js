Mp3D = new Object();

Mp3D.readyFunctions = new Array();
Mp3D.mvStack = new Array();

Mp3D.ready = function(func)
{
	Mp3D.readyFunctions.push(func);
}

Mp3D.init = function()
{
	// register all resources needed for setup
	ResourceManager.addRequest("simpleTextureVertexShader", "res/shaders/simpleTextureShader.vert");
	ResourceManager.addRequest("simpleTextureFragmentShader", "res/shaders/simpleTextureShader.frag");
	ResourceManager.addDependencies(["simpleTextureVertexShader", "simpleTextureFragmentShader"], Mp3D.setup);
	ResourceManager.loadAll();
}

Mp3D.setup = function()
{
	Mp3D.gl = Mp3D.createWebGLContext();
	Mp3D.loadShaders();
	Mp3D.setupViewport();
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
	
	Mp3D.mvMatrix = mat4.create();
	mat4.identity(Mp3D.mvMatrix);
  	Mp3D.pMatrix = mat4.create();
	
	mat4.perspective(45, Mp3D.gl.viewportWidth / Mp3D.gl.viewportHeight, 0.1, 10000.0, Mp3D.pMatrix);
}

Mp3D.loadShaders = function()
{
	// simple texture shader
	var simpleVertexShader = Mp3D.loadVertexShader("simpleTextureVertexShader");
	var simpleFragmentShader = Mp3D.loadFragmentShader("simpleTextureFragmentShader");
		
	var simpleTextureShaderProgram = Mp3D.gl.createProgram();
    Mp3D.gl.attachShader(simpleTextureShaderProgram, simpleVertexShader);
    Mp3D.gl.attachShader(simpleTextureShaderProgram, simpleFragmentShader);
    Mp3D.gl.linkProgram(simpleTextureShaderProgram);

    if(!Mp3D.gl.getProgramParameter(simpleTextureShaderProgram, Mp3D.gl.LINK_STATUS))
    {
    	Mp3D.error("Could not initialise simple shader.");
    }

	// set attributes
    simpleTextureShaderProgram.vertexPositionAttribute = Mp3D.gl.getAttribLocation(simpleTextureShaderProgram, "vertexPosition");
    Mp3D.gl.enableVertexAttribArray(simpleTextureShaderProgram.vertexPositionAttribute);
    simpleTextureShaderProgram.vertexNormalAttribute = Mp3D.gl.getAttribLocation(simpleTextureShaderProgram, "vertexNormal");
    Mp3D.gl.enableVertexAttribArray(simpleTextureShaderProgram.vertexNormalAttribute);
    simpleTextureShaderProgram.vertexTexCoordAttribute = Mp3D.gl.getAttribLocation(simpleTextureShaderProgram, "vertexTexCoord");
    Mp3D.gl.enableVertexAttribArray(simpleTextureShaderProgram.vertexTexCoordAttribute);
    
    // set uniforms
    simpleTextureShaderProgram.pMatrixUniform = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "pMatrix");
    simpleTextureShaderProgram.mvMatrixUniform = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "mvMatrix");
    simpleTextureShaderProgram.nMatrixUniform = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "nMatrix");
    simpleTextureShaderProgram.textureSampler = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "textureSampler");
    
    simpleTextureShaderProgram.lightDirection = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "lightDirection");
    simpleTextureShaderProgram.lightAmbientColor = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "lightAmbientColor");
    simpleTextureShaderProgram.lightDiffuseColor = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "lightDiffuseColor");
    
    Mp3D.simpleTextureShader = simpleTextureShaderProgram;
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
	Mp3D.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_MAG_FILTER, WebGLRenderingContext.NEAREST);
	Mp3D.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_MIN_FILTER, WebGLRenderingContext.NEAREST);
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

Mp3D.setMatrixUniforms = function(shaderProgram)
{
	// set modelview and projection matrix
	Mp3D.gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, Mp3D.pMatrix);
	Mp3D.gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, Mp3D.mvMatrix);
	
	// set normal matrix
	var normalMatrix = mat3.create();
    mat4.toInverseMat3(Mp3D.mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    Mp3D.gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);

	// set light information
	if(Mp3D.activeWorld && Mp3D.activeWorld.lights[0])
	{
		Mp3D.gl.uniform3fv(shaderProgram.lightDirection, Mp3D.activeWorld.lights[0].direction);
		Mp3D.gl.uniform3fv(shaderProgram.lightAmbientColor, Mp3D.activeWorld.lights[0].ambientColor);
		Mp3D.gl.uniform3fv(shaderProgram.lightDiffuseColor, Mp3D.activeWorld.lights[0].diffuseColor);
	}
}

Mp3D.drawScene = function()
{
	// clear screen
	Mp3D.gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);

	$.each(Mp3D.activeWorld.nodes, function()
	{
		this.draw();
	});
}

Mp3D.degToRad = function(degAngle)
{
	return (degAngle/180*Math.PI) % 2*Math.PI;
}

Mp3D.error = function(text)
{
	$("#error").append("<p>"+text+"</p>");
}


