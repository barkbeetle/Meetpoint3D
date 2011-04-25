$(document).ready(function()
{
	if($.url.param("content") == "play")
	{
		setupCanvas();
		
		if(gl)
		{
			initShaders();
  			initBuffers();
  			initTextures();
  			initLights();
			setupScene();
			mainLoop();
		}
	}
});

function setupCanvas()
{
	var canvas = $("#glcanvas")[0];
	gl = initWebGL(canvas);
  	if(gl)
  	{
  		gl.clearColor(0, 0, 0, 1);
  		gl.enable(gl.DEPTH_TEST);
  	}
}

function initWebGL(canvas)
{
	try
	{
		gl = canvas.getContext("webgl");
	}
	catch(e)
	{
		alert(e);
	}
	
	if(!gl)
	{
		try
		{
			gl = canvas.getContext("experimental-webgl");
		}
		catch(e)
		{
			alert(e);
		}
	}
	
	if(gl)
	{
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	}
	else
	{
		var message = "Your browser does not support WebGL. See <a href=\"index.php?content=help#unsupported_browser\">this</a> help section for more information.";
		error(message);
	}
	
	return gl;
}

function initShaders()
{
	// color shader
	var vertexShader1 = loadVertexShader("vs1");
	var fragmentShader1 = loadFragmentShader("fs1");
	
	shaderProgram1 = gl.createProgram();
    gl.attachShader(shaderProgram1, vertexShader1);
    gl.attachShader(shaderProgram1, fragmentShader1);
    gl.linkProgram(shaderProgram1);

    if(!gl.getProgramParameter(shaderProgram1, gl.LINK_STATUS))
    {
    	error("Could not initialise shaders.");
    }

    shaderProgram1.vertexPositionAttribute = gl.getAttribLocation(shaderProgram1, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram1.vertexPositionAttribute);
       
    shaderProgram1.vertexColorAttribute = gl.getAttribLocation(shaderProgram1, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram1.vertexColorAttribute);
    
    shaderProgram1.pMatrixUniform = gl.getUniformLocation(shaderProgram1, "uPMatrix");
    shaderProgram1.mvMatrixUniform = gl.getUniformLocation(shaderProgram1, "uMVMatrix");
    
    
    // texture shader
	var vertexShader2 = loadVertexShader("vs2");
	var fragmentShader2 = loadFragmentShader("fs2");
	
	shaderProgram2 = gl.createProgram();
    gl.attachShader(shaderProgram2, vertexShader2);
    gl.attachShader(shaderProgram2, fragmentShader2);
    gl.linkProgram(shaderProgram2);
    
    shaderProgram2.vertexPositionAttribute = gl.getAttribLocation(shaderProgram2, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram2.vertexPositionAttribute);
    
    shaderProgram2.vertexNormalAttribute = gl.getAttribLocation(shaderProgram2, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram2.vertexNormalAttribute);

    shaderProgram2.textureCoordAttribute = gl.getAttribLocation(shaderProgram2, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram2.textureCoordAttribute);
    
    shaderProgram2.pMatrixUniform = gl.getUniformLocation(shaderProgram2, "uPMatrix");
    shaderProgram2.mvMatrixUniform = gl.getUniformLocation(shaderProgram2, "uMVMatrix");
    shaderProgram2.nMatrixUniform = gl.getUniformLocation(shaderProgram2, "uNMatrix");
    shaderProgram2.samplerUniform = gl.getUniformLocation(shaderProgram2, "uSampler");
    
	shaderProgram2.useLightingUniform = gl.getUniformLocation(shaderProgram2, "uUseLighting");
	shaderProgram2.ambientColorUniform = gl.getUniformLocation(shaderProgram2, "uAmbientColor");
	shaderProgram2.lightingDirectionUniform = gl.getUniformLocation(shaderProgram2, "uLightingDirection");
	shaderProgram2.directionalColorUniform = gl.getUniformLocation(shaderProgram2, "uDirectionalColor");
}

function loadVertexShader(id)
{
	return loadShader(id, "vertex");
}

function loadFragmentShader(id)
{
	return loadShader(id, "fragment");
}

function loadShader(id, type)
{
	var shader = null;
	var source = $("#"+id)[0].textContent;
	
	if(type=="vertex")
	{
		shader = gl.createShader(gl.VERTEX_SHADER);
	}
	else if(type=="fragment")
	{
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	}
	else
	{
		error("Unknown shader type: "+type);
		return null;
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
	{
		error("Could not compile shader. "+gl.getShaderInfoLog(shader));
		return null;
	}
		
	return shader;
}

function setMatrixUniforms()
{
	gl.uniformMatrix4fv(shaderProgram1.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram1.mvMatrixUniform, false, mvMatrix);
	
	gl.uniformMatrix4fv(shaderProgram2.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram2.mvMatrixUniform, false, mvMatrix);

	var normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    
    gl.uniformMatrix3fv(shaderProgram2.nMatrixUniform, false, normalMatrix);
}

function initBuffers()
{
	// triangle
	var triangleVertices = [
         0.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0
    ];
    
    var triangleColors = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0
    ];

	triangleVertexPositionBuffer = gl.createBuffer();
	
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
    triangleVertexPositionBuffer.numItems = 3;
    
    triangleVertexColorBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleColors), gl.STATIC_DRAW);
    triangleVertexColorBuffer.itemSize = 4;
    triangleVertexColorBuffer.numItems = 3;


	// cube
    var cubeVertices = [
		// Front face
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		 1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,

		// Back face
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0, -1.0, -1.0,

		// Top face
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		 1.0,  1.0, -1.0,

		// Bottom face
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,

		// Right face
		 1.0, -1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0,  1.0,  1.0,
		 1.0, -1.0,  1.0,

		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0,  1.0, -1.0
	];
	
	var cubeVertexIndices = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23  // Left face
    ];
    
    var cubeTexCoords = [
		// Front face
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Back face
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		// Top face
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		// Bottom face
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		// Right face
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,	
		// Left face
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0
    ];
    
	var cubeVertexNormals = [
      // Front face
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
      // Back face
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
      // Top face
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
      // Bottom face
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
      // Right face
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
      // Left face
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0
    ];

	cubeVertexPositionBuffer = gl.createBuffer();
	
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 24;
    
    cubeVertexIndexBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;
   
    cubeVertexTexCoordBuffer = gl.createBuffer();
    
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTexCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeTexCoords), gl.STATIC_DRAW);
    cubeVertexTexCoordBuffer.itemSize = 2;
    cubeVertexTexCoordBuffer.numItems = 24;
    
    cubeVertexNormalBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertexNormals), gl.STATIC_DRAW);
    cubeVertexNormalBuffer.itemSize = 3;
    cubeVertexNormalBuffer.numItems = 24;
}



function initTextures()
{
	cubeTexture = gl.createTexture();
	cubeTexture.image = new Image();
	cubeTexture.image.onload = function(){ handleLoadedTexture(cubeTexture); };
	cubeTexture.image.src = "res/cube1.png";
}

function handleLoadedTexture(texture)
{
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.bindTexture(gl.TEXTURE_2D, null);
  }
  
function initLights()
{
	gl.useProgram(shaderProgram2);
	gl.uniform1i(shaderProgram2.useLightingUniform, 1);

	// directional light	
	var direction = [10.0, -1.0, -5.0];
	var directionVector = vec3.create();
	vec3.normalize(direction, directionVector);
	vec3.scale(directionVector, -1.0);
	
	gl.uniform3fv(shaderProgram2.lightingDirectionUniform, directionVector);
	gl.uniform3f(shaderProgram2.directionalColorUniform, 0.8, 0.8, 0.8);

	// ambient light
	gl.uniform3f(shaderProgram2.ambientColorUniform, 0.3, 0.3, 0.3);
	
}

function setupScene()
{
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	mvMatrix = mat4.create();
  	pMatrix = mat4.create();
	
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
	setMatrixUniforms();
	
	triangleAngle = 0;
	cubeAngle = 0;
	
	timeBefore = 0;
}

function drawScene()
{
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// draw triangle
	gl.useProgram(shaderProgram1);

	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
	mat4.rotate(mvMatrix, triangleAngle, [0, 1, 0]);
	
	setMatrixUniforms();
	
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram1.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram1.vertexColorAttribute, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
	
	
	// draw cube
	gl.useProgram(shaderProgram2);
	
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, [1.5, 0.0, -7.0]);
	mat4.rotate(mvMatrix, cubeAngle, [2, 1, 1]);
	
	setMatrixUniforms();
		
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram2.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram2.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTexCoordBuffer);
    gl.vertexAttribPointer(shaderProgram2.textureCoordAttribute, cubeVertexTexCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
      
	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
    gl.uniform1i(shaderProgram2.samplerUniform, 0);
       
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	
 	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

}

function mainLoop()
{
    var timeNow = new Date().getTime();
    if(timeBefore)
    {
    	elapsed = (timeNow-timeBefore)/1000;
    }
    else
    {
    	elapsed = 0;
    }
    timeBefore = timeNow;
    
	requestAnimFrame(mainLoop);

	cubeAngle += degToRad(60)*elapsed;
	triangleAngle += degToRad(90)*elapsed;

	drawScene();
}

function degToRad(degAngle)
{
	return (degAngle/180*Math.PI)%Math.PI;
}

function error(text)
{
	$("#error").append("<p>"+text+"</p>");
}

