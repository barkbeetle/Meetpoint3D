<div class="title">The Project</div>
<div class="title2">Project Goal</div>
<p>
	Meetpoint3D is a school project where we had to create a website. Having heard about WebGL, I wanted to try this technology and gain some experience in OpenGL and 3D design.
</p>

<div class="title2">Components of a three-dimensional world</div>
<div class="title3">Scenegraph</div>
<p>
	<img src="doc/example_scenegraph.png" align="right" title="A simple scenegraph"></img>Meetpoint3D organizes its objects in a scenegraph. This allows you to work with relative transformations. For instance, Player one and two's transformation are relative to the transformation of the floor which again depends on World's transformation. But the camera can be transformed however you want it since it is independent of the World node.
</p>
<div class="title3">Models</div>
<p>
	An important part of every 3D game are models that represent players, enemies or parts of the virtual world. In OpenGL, models consist of vertices (points in the 3-dimensional space) and faces (usually triangles) that connect them. Vertices may contain additional information such as normal vectors or texture coordinates used for materials.<br/>
	A cube, as an example, is pretty easy to create: You define 8 vertices and six faces (quads) and there you go. A sphere in an acceptable resolution is much more work. And if you work on more complex models, defining all vertices manually is nearly impossible. I therefore created a small plugin for <a href="https://www.maxon.net/en/products/cinema-4d/">Cinema 4D</a>, a 3D modelling tool for Macintosh and Windows platforms. It exports all geometry information of your object into a Mojito-XML file (described below). The plugin can be found on GitHub: <a href="http://github.com/sropelato/MojitoExporter">github.com/sropelato/MojitoExporter</a>
</p>
<div class="title3">The Mojito file format</div>
<p>
	Mojito is a leightweight XML-based file format for static 3D objects. Nodes are organized hierarchically and contain the following information:
	<ul>
		<li>transformation relative to the parent node</li>
		<li>vertices (position, normal, texcoords)</li>
		<li>faces</li>
		<li>material names (mapped in materials.xml)</li>
		<li>child nodes</li>
	</ul>
	An importer for this file format is integrated in Meetpoint3D.
</p>
<div class="title3">Materials</div>
<p>
	WebGL is shaderbases which means that all visible objects must be rendered in a shader. There are two classes implemented in Meetpoint3D - SimpleColorMaterial and SimpleTextureMaterial both of which use an own shader to render objects.
</p>

<div class="title2">The multiplayer part</div>
<p>
	Meetpoint3D enables you to communicate with other players in real-time.
</p>
<div class="title3">Gameserver</div>
<p>
	To enable multiplayer interaction, I run a dedicated gameserver in my home network. It is written in Java and runs surprisingly stable ;-)<br/>
	All it does is listen to incoming HTTP request, reading the information out of it and sending a response with the data requested. More details in the "Communication protocol" section.<br/>
	Find more information about the game server on GitHub: <a href="http://github.com/sropelato/Meetpoint3DServer">github.com/sropelato/Meetpoint3DServer</a>
</p>
<div class="title3">Communication protocol</div>
<p>
	<img src="doc/example_communication.png" align="right" title="Example communication"></img>
	<ol>
		<li>Client registers himself with the server.</li>
		<li>Server generates a unique player id and sends it back to the client.</li>
		<li>Client sends it's position.</li>
		<li>Server updates client and sends all other client's positions.</li>
	</ol>
</p>
<p style="height:300px;"></p>
