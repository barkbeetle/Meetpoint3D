#ifdef GL_ES
precision highp float;
#endif

uniform vec3 color;

varying vec3 lightedColor;

void main(void)
{
	gl_FragColor = vec4(color * lightedColor, 1);
}