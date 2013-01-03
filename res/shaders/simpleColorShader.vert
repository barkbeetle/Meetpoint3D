attribute vec3 vertexPosition;
attribute vec3 vertexNormal;
attribute vec2 vertexTexCoord;

uniform mat4 mvMatrix;
uniform mat4 pMatrix;
uniform mat3 nMatrix;

uniform vec3 lightDirection;
uniform vec3 lightAmbientColor;
uniform vec3 lightDiffuseColor;

uniform bool ignoreLighting;

varying vec3 lightedColor;

void main(void)
{
	gl_Position = pMatrix * mvMatrix * vec4(vertexPosition, 1.0);
	
	if(!ignoreLighting)
	{
		vec3 transformedNormal = normalize(nMatrix * vertexNormal);
		
		vec3 direction = normalize(lightDirection * -1.0);
		vec4 ambientColor = vec4(lightAmbientColor, 1.0);
		vec4 diffuseColor = vec4(lightDiffuseColor, 1.0);
		
		float lightIntensity = max(dot(transformedNormal, direction), 0.0);
		lightedColor = (ambientColor + (diffuseColor-ambientColor) * lightIntensity).rgb;
	}
	else
	{
		lightedColor = vec3(1, 1, 1);
	}
}