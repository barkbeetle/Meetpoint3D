function SimpleTextureMaterial()
{
	this.shaderProgram = Mp3D.simpleTextureShader;
	this.texture = null;
}

Mp3D.registerMaterial(SimpleTextureMaterial);

SimpleTextureMaterial.getResourceDependencies = function()
{
	// register all resources needed for setup
	return [["simpleTextureVertexShader", "res/shaders/simpleTextureShader.vert"], ["simpleTextureFragmentShader", "res/shaders/simpleTextureShader.frag"]];
}

SimpleTextureMaterial.init = function()
{
	// load simple texture shader
	var simpleTextureVertexShader = Mp3D.loadVertexShader("simpleTextureVertexShader");
	var simpleTextureFragmentShader = Mp3D.loadFragmentShader("simpleTextureFragmentShader");
		
	var simpleTextureShaderProgram = Mp3D.gl.createProgram();
    Mp3D.gl.attachShader(simpleTextureShaderProgram, simpleTextureVertexShader);
    Mp3D.gl.attachShader(simpleTextureShaderProgram, simpleTextureFragmentShader);
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
    
    SimpleTextureMaterial.shaderProgram = simpleTextureShaderProgram;
}

SimpleTextureMaterial.prototype.setTexture = function(filename)
{
	this.texture = Mp3D.gl.createTexture();
	this.texture.image = new Image();
	var loadedTexture = this.texture;
	this.texture.image.onload = function(){ Mp3D.handleLoadedTexture(loadedTexture); };
	this.texture.image.src = filename;
}

SimpleTextureMaterial.setMatrixUniforms = function()
{
	// set modelview and projection matrix
	Mp3D.gl.uniformMatrix4fv(SimpleTextureMaterial.shaderProgram.pMatrixUniform, false, Mp3D.pMatrix);
	Mp3D.gl.uniformMatrix4fv(SimpleTextureMaterial.shaderProgram.mvMatrixUniform, false, Mp3D.mvMatrix);
	
	// set normal matrix
	var normalMatrix = mat3.create();
    mat4.toInverseMat3(Mp3D.mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    Mp3D.gl.uniformMatrix3fv(SimpleTextureMaterial.shaderProgram.nMatrixUniform, false, normalMatrix);

	// set light information (if available)
	if(Mp3D.activeWorld && Mp3D.activeWorld.lights[0])
	{
		Mp3D.gl.uniform3fv(SimpleTextureMaterial.shaderProgram.lightDirection, Mp3D.activeWorld.lights[0].direction);
		Mp3D.gl.uniform3fv(SimpleTextureMaterial.shaderProgram.lightAmbientColor, Mp3D.activeWorld.lights[0].ambientColor);
		Mp3D.gl.uniform3fv(SimpleTextureMaterial.shaderProgram.lightDiffuseColor, Mp3D.activeWorld.lights[0].diffuseColor);
	}
}

SimpleTextureMaterial.prototype.drawModel = function(model)
{
	SimpleTextureMaterial.setMatrixUniforms();

	Mp3D.gl.useProgram(SimpleTextureMaterial.shaderProgram);

	Mp3D.gl.bindBuffer(Mp3D.gl.ARRAY_BUFFER, model.vertexPositionBuffer);
    Mp3D.gl.vertexAttribPointer(SimpleTextureMaterial.shaderProgram.vertexPositionAttribute, model.vertexPositionBuffer.itemSize, Mp3D.gl.FLOAT, false, 0, 0);
    
	Mp3D.gl.bindBuffer(Mp3D.gl.ARRAY_BUFFER, model.vertexNormalBuffer);
    Mp3D.gl.vertexAttribPointer(SimpleTextureMaterial.shaderProgram.vertexNormalAttribute, model.vertexNormalBuffer.itemSize, Mp3D.gl.FLOAT, false, 0, 0);
    
	Mp3D.gl.bindBuffer(Mp3D.gl.ARRAY_BUFFER, model.vertexTexCoordBuffer);
    Mp3D.gl.vertexAttribPointer(SimpleTextureMaterial.shaderProgram.vertexTexCoordAttribute, model.vertexTexCoordBuffer.itemSize, Mp3D.gl.FLOAT, false, 0, 0);
    
    if(this.texture)
    {
		Mp3D.gl.activeTexture(WebGLRenderingContext.TEXTURE0);
    	Mp3D.gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, this.texture);
    	Mp3D.gl.uniform1i(SimpleTextureMaterial.shaderProgram.samplerUniform, 0);
    }

 	Mp3D.gl.drawElements(WebGLRenderingContext.TRIANGLES, model.vertexIndexBuffer.numItems, WebGLRenderingContext.UNSIGNED_SHORT, 0);
}

