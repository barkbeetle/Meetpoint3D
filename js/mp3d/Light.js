function Light()
{
	this.direction = [0, -1, 0];
	this.ambientColor = [0.2, 0.2, 0.2];
	this.diffuseColor = [1.0, 1.0, 1.0];
	
	// light direction relative to camera
	this.relativeDirection = [0, -1, 0];
}