function Material()
{
	this.shaderProgram = null;
	this.texture = null;
}

Material.prototype.draw = function()
{
	Mp3D.gl.useProgram(this.shaderProgram);

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
    	Mp3D.gl.uniform1i(Mp3D.simpleShader.samplerUniform, 0);
    }

 	Mp3D.gl.drawElements(WebGLRenderingContext.TRIANGLES, this.vertexIndexBuffer.numItems, WebGLRenderingContext.UNSIGNED_SHORT, 0);
}

