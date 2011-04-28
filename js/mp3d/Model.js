function Model()
{
	this.vertexPositionBuffer = Mp3D.gl.createBuffer();
	this.vertexNormalBuffer = Mp3D.gl.createBuffer();
	this.vertexTexCoordBuffer = Mp3D.gl.createBuffer();
	this.vertexColorBuffer = Mp3D.gl.createBuffer();
	this.vertexIndexBuffer = Mp3D.gl.createBuffer();
	this.material = null;
}

Model.prototype.setVertexPositions = function(vertexPositions)
{
	Mp3D.blubb = vertexPositions;
	Mp3D.gl.bindBuffer(Mp3D.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    Mp3D.gl.bufferData(Mp3D.gl.ARRAY_BUFFER, new Float32Array(vertexPositions), WebGLRenderingContext.STATIC_DRAW);
    this.vertexPositionBuffer.itemSize = 3;
    this.vertexPositionBuffer.numItems = vertexPositions.length/3;
}

Model.prototype.setVertexNormals = function(vertexNormals)
{
	Mp3D.gl.bindBuffer(Mp3D.gl.ARRAY_BUFFER, this.vertexNormalBuffer);
    Mp3D.gl.bufferData(Mp3D.gl.ARRAY_BUFFER, new Float32Array(vertexNormals), WebGLRenderingContext.STATIC_DRAW);
    this.vertexNormalBuffer.itemSize = 3;
    this.vertexNormalBuffer.numItems = vertexNormals.length/3;
}

Model.prototype.setVertexTexCoords = function(vertexTexCoords)
{
	Mp3D.gl.bindBuffer(Mp3D.gl.ARRAY_BUFFER, this.vertexTexCoordBuffer);
    Mp3D.gl.bufferData(Mp3D.gl.ARRAY_BUFFER, new Float32Array(vertexTexCoords), WebGLRenderingContext.STATIC_DRAW);
    this.vertexTexCoordBuffer.itemSize = 2;
    this.vertexTexCoordBuffer.numItems = vertexTexCoords.length/2;
}

Model.prototype.setVertexColors = function(vertexColors)
{
	Mp3D.gl.bindBuffer(Mp3D.gl.ARRAY_BUFFER, this.vertexColorBuffer);
    Mp3D.gl.bufferData(Mp3D.gl.ARRAY_BUFFER, new Float32Array(vertexColors), WebGLRenderingContext.STATIC_DRAW);
    this.vertexColorBuffer.itemSize = 4;
    this.vertexColorBuffer.numItems = vertexColors.length/4;
}

Model.prototype.setVertexIndices = function(vertexIndices)
{
	Mp3D.gl.bindBuffer(Mp3D.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
	Mp3D.gl.bufferData(Mp3D.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), WebGLRenderingContext.STATIC_DRAW);
	this.vertexIndexBuffer.itemSize = 1;
	this.vertexIndexBuffer.numItems = vertexIndices.length;
}

Model.prototype.setMaterial = function(material)
{
	this.material = material;
}

/*Model.prototype.setTexture = function(filename)
{
	this.texture = Mp3D.gl.createTexture();
	this.texture.image = new Image();
	var loadedTexture = this.texture;
	this.texture.image.onload = function(){ Mp3D.handleLoadedTexture(loadedTexture); };
	this.texture.image.src = filename;
}*/

Model.prototype.draw = function()
{
	this.material.drawModel(this);

	/*Mp3D.gl.useProgram(this.shaderProgram);
	Mp3D.setMatrixUniforms(this.shaderProgram);

	Mp3D.gl.bindBuffer(Mp3D.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    Mp3D.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, Mp3D.gl.FLOAT, false, 0, 0);
    
	Mp3D.gl.bindBuffer(Mp3D.gl.ARRAY_BUFFER, this.vertexNormalBuffer);
    Mp3D.gl.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute, this.vertexNormalBuffer.itemSize, Mp3D.gl.FLOAT, false, 0, 0);
    
	Mp3D.gl.bindBuffer(Mp3D.gl.ARRAY_BUFFER, this.vertexTexCoordBuffer);
    Mp3D.gl.vertexAttribPointer(this.shaderProgram.vertexTexCoordAttribute, this.vertexTexCoordBuffer.itemSize, Mp3D.gl.FLOAT, false, 0, 0);
    
    if(this.texture)
    {
		Mp3D.gl.activeTexture(WebGLRenderingContext.TEXTURE0);
    	Mp3D.gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, this.texture);
    	Mp3D.gl.uniform1i(this.shaderProgram.samplerUniform, 0);
    }

 	Mp3D.gl.drawElements(WebGLRenderingContext.TRIANGLES, this.vertexIndexBuffer.numItems, WebGLRenderingContext.UNSIGNED_SHORT, 0);*/
}

