'use strict'

function generateDep(depData, mapData, codeDep, codeType){

	var width = window.innerWidth;
	var height = window.innerHeight;

	var svg = d3.select("#department")
		.html('')
		.append('svg')
		.attr("width", width)
		.attr("height", height);

	// Define the center of the map
	var center = d3.geoCentroid(depData);

	// Projection des longitudes et latitudes
	var projection = d3.geoMercator()
		.center(center)
		.scale(width*16)
		.translate([ width /2, height/2 ])

	var path = d3.geoPath().projection(projection);

	// Draw the map
	svg.append("g")
		.selectAll("path")
		.data(mapData.features)
		.enter()
		.append("path")
			.attr('id',function(d) { return 'path_' + d.properties.code})
			.attr("fill", function(d){return color(d, codeDep);})
			.attr("d", path)
			.style('stroke','black')
			.style('stroke-width', '1px');

	// Draw the points of the places to visit
	svg.selectAll("myCircles")
		.data(legendes)
		.enter()
		.append("circle")
			.attr("id", function(d){ return 'dot_legende_' + d.id; })
			.attr("cx", function(d){ return projection([d.longitude, d.latitude])[0]; })
			.attr("cy", function(d){ return projection([d.longitude, d.latitude])[1]; })
			.attr("r", 14)
			.style("fill", "white")
			.attr("stroke", "white")
			.attr("stroke-width", 3)
			.attr("fill-opacity", .5)
			.on('mouseover', function(d){
				hover(d,this);
			})
			.on('mouseleave', function(d){
				leave(d, this);
			})
			.on('click', d => selectLegende(d.id));

	svg.selectAll("labels")
		.data(legendes)
		.enter()
		.append("text")
			.attr("id", function(d){ return 'label_legende_' + d.id; })
			.attr("lbl-legende-id", function(d){ return d.id; })
			.attr("x", function(d){ return projection([d.longitude, d.latitude])[0]; })
			.attr("y", function(d){ return projection([d.longitude, d.latitude])[1] - 14 - 20; })
			.text(function(d){ return d.nom})
			.attr("text-anchor", "middle")
			.attr("alignment-baseline", "central")
			.style("fill", "white")
			.style("font-size", 14)
			.style("font-weight", "bold")
			.attr("fill-opacity", 1)
			.on('mouseover', function(d){
				d3.select(this)
					.transition().duration(350)
					.style("font-size", 20);
				hover(null,document.getElementById('dot_legende_' + this.getAttribute('lbl-legende-id')));
			})
			.on('mouseleave', function(d){
				d3.select(this)
					.transition().duration(350)
					.style("font-size", 14);
				leave(null,document.getElementById('dot_legende_' + this.getAttribute('lbl-legende-id')));
			})
			.on('click', d => selectLegende(d.id));

}

function color(d, codeDep){
	let color = '';
	let code = d.properties.code;
	if(code == codeDep){
		color = '#88cbce';
	}
	else{
		color = 'white';
	}
	return color;
}

function hover(d,t){
	d3.select(t)
		.transition().duration(350)
		.attr("r", 20)
		.style("fill-opacity", 0.6);
	// TODO : faire apparaitre explication perso
}

function leave(d,t){
	d3.select(t)
		.transition().duration(350)
		.attr("r", 14)
		.style("fill-opacity", 0.5);
	// TODO : faire disparaitre explication perso
}

function getCodeDepartement(url){
	return url.split('/')[5];
}

function getCodeType(url){
	return url.split('/')[6];
}

function getMapDepartement(code){
	let f = null;
	for(let i in mapFusion.features){
		let feature = mapFusion.features[i];
		if(feature.properties.code == code){
			f = feature;
			break;
		}
	}
	return f;
}

function selectLegende(idLegende){
	if(idLegende > 0) document.location.href= `${ROOT}legende/${idLegende}`; 
}

function loadCharacter() {
	let nomType = legendes[0].categorie.replace(' ', '_');
	let imgChar = document.createElement('img');
	imgChar.src = `/mer-a/assets/img/personnage/image_${nomType}.png`;
	imgChar.id = 'character_image';
	persoBox.appendChild(imgChar);
}

function loadNarration() {
	narrationBox.innerHTML += narration[0];
	narration = narration.substring(1);
	if(narration.length === 0) clearInterval(narrationInterval);
}

let url = window.location.href;

var codeDep = getCodeDepartement(url);
var codeType = getCodeType(url);
var map = getMapDepartement(codeDep);
var persoBox = document.getElementById('character');
var perso = null;
//var nuage = document.getElementById('cloud');
var narrationBox = document.getElementById('narration');
let narration = narrationBox.innerHTML;
narrationBox.innerHTML = "";
let narrationInterval = setInterval(loadNarration, 60);

let legendes = null;
(async () => {
	await getLegendes(codeDep, codeType, r => legendes = r);
	//console.log(legendes);
	generateDep(map,mapFusion,codeDep,codeType);
	loadCharacter();
	perso = document.getElementById('character_image');
	setTimeout(() => perso.style.left = `${(persoBox.offsetWidth-perso.offsetWidth)/2}px`,100);
})();

window.onload = () => {
	//nuage.style.bottom = `-${nuage.offsetHeight/2}px`;
}

window.addEventListener("resize", function(e) {
	//nuage.style.bottom = `-${nuage.offsetHeight/2}px`;
	perso.style.left = `${(persoBox.offsetWidth-perso.offsetWidth)/2}px`;
	generateDep(map,mapFusion,codeDep,codeType);
});

