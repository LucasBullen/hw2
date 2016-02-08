var Global_Fuel = 100;
var Global_Material = 200;
var Global_Energy = 300;
var Global_Buildings = [];

function buy(building, game2d) {
	if (building.canBuild()) {
		Global_Fuel -= building.cost.fuel;
		Global_Material -= building.cost.material;
		Global_Energy -= building.cost.energy;

		Global_Buildings.push(building);

		return true;
	}
	else {
		return false;
	}
}

function harvest(building, game2d) {
	var speed = building.canHarvest(game2d);
	
	if (speed != false) {
		if (building.resource.type == "fuel") {
			Global_Fuel += speed;
		}
		else if (building.resource.type == "material") {
			Global_Material += speed;
		}
		else if (building.resource.type == "energy") {
			Global_Energy += speed;
		}

		building.resource.amount -= speed;
	}
}

var Resource = function(type, amount) {
	var public = this;
	var private = {};

	public.type = type;
	public.amount = amount;
};

//base object for all buildings and spaceships
var Building = function(fuel, material, energy, speed, parent, resource) {
	var private = {}
	var public = this;
	public.parent = parent;
	public.cost = {
		fuel: fuel,
		material: material,
		energy: energy,
	};
	public.speed = speed;
	public.resource = resource;
	
	public.canBuild = function() {
		if (Global_Fuel >= public.cost.fuel && 
			 Global_Material >= public.cost.material &&
			 Global_Energy >= public.cost.energy) {

			return true;
		}
		else {
			return false;
		}
	};
	public.canHarvest = function(game2d) {
		if (public.resource.amount >= public.speed*game2d.state.dt) {
			return public.speed*game2d.state.dt;
		}
		else {
			return public.resource.amount;
		}
	};
}

var DysonSphere = function(parent) {
	var private = {};
	private.sizeMod = 20;

	public = this;
	public.parent = parent;

	private.building = new Building(
		1000,
		1000,
		1000,
		100,
		parent,
		new Resource("energy", 100000000)
	);

	for (var property in private.building) {
		if (private.building.hasOwnProperty(property)) {
			public[property] = private.building[property];
		}
	}

	public.draw = function(game2d) {
		var state = game2d.state;
		var pos = game2d.camera.wToS(public.parent.x, public.parent.y);
		var width = (game2d.persist.assets['dysonPyramid'].image.width - private.sizeMod)*state.camera.zoom;
		var height = (game2d.persist.assets['dysonPyramid'].image.height - private.sizeMod)*state.camera.zoom;

		game2d.state.ctx.globalAlpha = 1.0;

		state.ctx.drawImage(
			game2d.persist.assets['dysonPyramid'].image, 
			pos.x - (game2d.persist.assets['dysonPyramid'].image.width - private.sizeMod)*state.camera.zoom/2, 
			pos.y - (game2d.persist.assets['dysonPyramid'].image.height - private.sizeMod)*state.camera.zoom/2,
			width,
			height
		);
	};
};

var Mine = function(parent, resource) {
	var private = {};
	var public = this;

	private.building = new Building(
		0,
		100,
		100,
		100,
		parent,
		resource
	);

	for (var property in private.building) {
		if (private.building.hasOwnProperty(property)) {
			public[property] = private.building[property];
		}
	}
};


//x y of planet it is created on
var Ship = function(parent){
	var x = parent.centerx;
	var y = parent.centery;
	var private = {};
	var public = this;

	private.building = new Building(
		0,
		100,
		100,
		10000,
		parent,
		new Resource("energy", 0)
	);

	for (var property in private.building) {
		if (private.building.hasOwnProperty(property)) {
			public[property] = private.building[property];
		}
	}
	public.name = randShipName(randXY(x,y));
	public.size = 20;
	public.fuelPerUnit = 0.001;
	public.color = randColor(rand1(x),rand2(y),true);
	public.travel = {};
	public.travel.startPlanet = parent;
	public.travel.distance = 0;
	public.travel.angle = 0;
	public.travel.sx = x;
	public.travel.sy = y;
	public.travel.ex = x;
	public.travel.ey = y;
	public.travel.start = new Date();
	public.travel.end = new Date();
	public.travel.destinationPlanet = "nil"; 

	//locationInStructsArray = in planet array, makes things easier
	public.fly = function(endPlanet){
		var startPlanet = public.travel.startPlanet;
		var theta1 = Math.atan2((endPlanet.centery-startPlanet.centery),(endPlanet.centerx-startPlanet.centerx));
		var theta2 = Math.atan2((startPlanet.centery-endPlanet.centery),(startPlanet.centerx-endPlanet.centerx));
		public.travel.sx = startPlanet.centerx + startPlanet.distance*Math.cos(theta1);
		public.travel.sy = startPlanet.centery + startPlanet.distance*Math.sin(theta1);
		public.travel.ex = endPlanet.centerx + endPlanet.distance*Math.cos(theta2);
		public.travel.ey = endPlanet.centery + endPlanet.distance*Math.sin(theta2);
		public.travel.distance = Math.sqrt(Math.pow(public.travel.ex-public.travel.sx,2)+Math.pow(public.travel.ey-public.travel.sy,2));
		public.travel.angle = theta1;
		public.travel.destinationPlanet = endPlanet; 
		public.travel.start = new Date();
		var lengthOfTrip = public.travel.distance/(public.speed);
        public.travel.end = new Date(public.travel.start.getTime() + lengthOfTrip*60000);
		var fuelForTrip = public.fuelPerUnit * public.travel.distance;
			console.log("almost"+fuelForTrip);
		if (Global_Fuel>=fuelForTrip) {
			Global_Fuel-=fuelForTrip;
			console.log("in");
			FlyingShips.push(public);
			var index = startPlanet.structures.indexOf(public);
			startPlanet.structures.splice(index, 1);
		}
	};
	public.draw = function(game2d){
		var now = new Date();
		if (now >= public.travel.end) {
			var index = FlyingShips.indexOf(public);
			if (index > -1) {
			    FlyingShips.splice(index, 1);
			}
			public.travel.destinationPlanet.structures.push(public);
			public.travel.startPlanet = public.travel.destinationPlanet;

			saveSolarSystem(public.travel.startPlanet.solarSystem);

			
			var saved = false;
	        for (var i = 0; i < InteractedSolarSystems.length; i++) {
	            if (InteractedSolarSystems[i].id==public.travel.destinationPlanet.centerx+":"+public.travel.destinationPlanet.centery){
	               saved=true
	               break;
	            }
	        }
			return;
		}
		var traveledDistance = (((now-public.travel.start)/(public.travel.end-public.travel.start)))*public.travel.distance;
      	var xPlus = 1;
      	var yPlus = 1;
      	if (public.travel.sx>public.travel.ex && public.travel.destinationPlanet.centerx == public.travel.startPlanet.centerx && public.travel.destinationPlanet.centery == public.travel.startPlanet.centery) xPlus=-1;
      	if (public.travel.sy>public.travel.ey && public.travel.destinationPlanet.centerx == public.travel.startPlanet.centerx && public.travel.destinationPlanet.centery == public.travel.startPlanet.centery) yPlus=-1;
      	var currentX = public.travel.sx + xPlus*traveledDistance*Math.cos(public.travel.angle);
      	var currentY = public.travel.sy + yPlus*traveledDistance*Math.sin(public.travel.angle);


	    var state = game2d.state;
    	var pos = state.camera.wToS(currentX, currentY);

	    var startPos = state.camera.wToS(public.travel.sx, public.travel.sy);
	    var endPos = state.camera.wToS(public.travel.ex, public.travel.ey);
	    var rad = public.size*state.camera.zoom;

	    if ((pos.x + rad > 0 && pos.x - rad < state.width &&
	        pos.y + rad > 0 && pos.y - rad < state.height) || (startPos.x + rad > 0 && startPos.x - rad < state.width &&
	        startPos.y + rad > 0 && startPos.y - rad < state.height) || (endPos.x + rad > 0 && endPos.x - rad < state.width &&
	        endPos.y + rad > 0 && endPos.y - rad < state.height)) {
		}
	    	//path line
	        state.ctx.beginPath();
	        state.ctx.strokeStyle = "#F7FE2E";
	        state.ctx.moveTo(startPos.x,startPos.y);
	        state.ctx.lineTo(endPos.x,endPos.y);
	        state.ctx.stroke();
	        state.ctx.closePath();

           var width = game2d.persist.assets['ship'].image.width*state.camera.zoom;
           var height = game2d.persist.assets['ship'].image.height*state.camera.zoom;
           if (width + height > 2) {
               state.ctx.drawImage(game2d.persist.assets['ship'].image, pos.x - width/2, pos.y - height/2, width, height);
           }
	    //}
    };
    public.click = function(){
		var game2d = new Game2D(document.getElementById("game"), window);
		shipWindow(game2d, public);
	}
}

var Planet = function(x, y, distance, i, rad, solarSystem){
	var private = {}
	var public = this;
	public.solarSystem = solarSystem;
	public.centerx = x;
	public.centery = y;
	public.rad = rad;
	public.distance = distance;
	private.seed = rand2(rad*x*i);
	public.name = randPlanetName(private.seed);
	public.color = randColor(rand1(private.seed), rand2(private.seed),true);
	public.velocity = Math.floor(rand2(private.seed)*40);
	public.startingAngle = rand2(private.seed)*Math.PI*2;

	public.elements = [];
	public.structures = [];

	for (var j = 0; j < (Math.floor(randXY(private.seed,x)*10)+1); j++) {
		public.elements.push(randElement(private.seed +rand2(j)));
	}
	public.click = function(game2d) {
		console.log(public);
		clickSoundEffect();
		//fix this hack
   	windowjs.addWindow(planetWindow(game, public));
	};

	public.updateMines = function(){
		var mineralsMined = [];
		var now = new Date();
		for (var i = 0; i < public.elements.length; i++) {
			var totalMined = 0;
			var element = public.elements[i];
			for (var j = 0; j < public.elements[i].mines.length; j++) {
				var mine = public.elements[j].mines[j];
				totalMined += (mine.level * mine.baseSpeed) * (((now - mine.start)/1000)%60)
				mine.start = now;
			}
			if (totalMined >= element.amount) {
				totalMined = element.amount;
			}
			element.amount -= totalMined;
			mineralsMined.push({"element":element,"amount":totalMined});
		}
		var finished = new Array(mineralsMined.length);
		var goal = new Array(mineralsMined.length);
		for (var i = 0; i < finished.length; i++) {
			finished[i] = "false";
			goal[i] = "true";
		}
		while (JSON.stringify(finished)!=JSON.stringify(goal)){
			for (var i = 0; i < public.structures.length; i++) {
				if (public.structures[i].type = "StorageSilo") {
					var silo = public.structures[i];
					//fill one bin with minerals
					for (var i = 0; i < mineralsMined.length; i++) {
						var ammountToTry = 0;
						if (mineralsMined[i].amount > (silo.baseSize * silo.level)) {
							ammountToTry = (silo.baseSize * silo.level);
						}else{
							ammountToTry = mineralsMined[i].amount;
						}
						var ammountRemaining = silo.store(mineralsMined[i].element,ammountToTry);
						if (ammountRemaining == ammountToTry) {
							finished[i] = "true";
						}
						mineralsMined[i].amount = ammountRemaining;
					}
				}
			}
		}//end while
	};

	//mineElementNumber = locaiton of desired element in element array
	public.buildBuilding = function(Building, resources, mineElementNumber){
		var rs = resources;
		var resourcesRequired = Building.requiredToBuild;
		var canBuild = false;
		for (var i = 0; i < resources.length; i++) {
			console.log("i"+resources[i].load);
			if (resources[i].load > Building.loadRequired && resourcesRequired!=0) {
				console.log("resources[i].load"+resources[i].load);
				if (resourcesRequired <= resources[i].amount) {
					resources[i].amount -= resourcesRequired;
					resourcesRequired = 0;
					canBuild = true;
					break;
				}else{
					resourcesRequired -= resources[i].amount;
					resources[i].amount -= 0;
				}
				if (resourcesRequired==0) break;
			}
		}
		if (canBuild) {
			console.log("could build");
			if (mineElementNumber!="undefined" && Building.type == "MineralMine") {
				public.elements[mineElementNumber].mines.push(Building);
			}else{
				public.structures.push(Building);
			}
			return resources;
		}else{
			//not enough resources :(
			return rs; 
		}
	};

	public.draw = function(game2d) {
      var state = game2d.state;
      var pos = game2d.camera.wToS(public.centerx, public.centery);
      var distance = public.distance*state.camera.zoom;
      var lineWidth = 1*game2d.camera.zoom;
      var dashWidth = state.camera.zoom*21;
      
      state.ctx.beginPath();
      state.ctx.arc(pos.x, pos.y, distance, 0, 2 * Math.PI, false);
      state.ctx.lineWidth = lineWidth;
		state.ctx.setLineDash([dashWidth, dashWidth]);
      state.ctx.strokeStyle = "#fff";
      state.ctx.stroke();
		state.ctx.setLineDash([]);

      var x = Math.cos(public.startingAngle*( public.velocity*(0 - new Date())/1000000 ))*public.distance;
      var y = Math.sin(public.startingAngle*( public.velocity*(0 - new Date())/1000000 ))*public.distance;
      var rad = public.rad*state.camera.zoom;

      ppos = game2d.camera.wToS(public.centerx + x, public.centery + y);

      state.ctx.beginPath();
      state.ctx.fillStyle = public.color;
      state.ctx.arc(ppos.x, ppos.y, rad, 0, 2 * Math.PI, false);
      state.ctx.fill();
   
      if (Math.pow(game2d.mouse.x - pos.x, 2) + Math.pow(game2d.mouse.y - pos.y, 2) < Math.pow(distance + lineWidth, 2)) {
      	state.ctx.beginPath();
      	state.ctx.globalAlpha = 0.0;
	      state.ctx.arc(pos.x, pos.y, distance, 0, 2 * Math.PI, false);
	      state.ctx.fill();
      	state.ctx.globalAlpha = 1.0;

      	return true;	
      }
      else {
      	return false;
      }
   };
  	
}

var SolarSystem = function(x,y,rad,chunksize, rand) {
	var private = {}
	var public = this;
	public.x = x;
	public.y = y;
	public.rad = rad;
	public.chunksize = chunksize;
	public.rand = (typeof rand === "undefined" ? (randXY(x/chunksize, y/chunksize) - 0.9)*10 : rand ); 
	public.color = randColor(rand2(x),rand1(y));
	public.dysonSphere = false;
	public.planets = generatePlanets(public.x, public.y, public.rad, public.rand, public.chunksize, public);

	public.click = function(game2d) {		
   		windowjs.addWindow(solarSystemWindow(game2d, public));
   		clickSoundEffect();		
   	};
  	public.draw = function(game2d){
      var state = game2d.state;
      var pos = state.camera.wToS(public.x, public.y);
      var rad = public.rad*state.camera.zoom;
      var lineWidth = 10*game2d.state.camera.zoom;
      lineWidth = (lineWidth < 2 ? 2 : lineWidth);
      var alpha = 1 - (state.camera.zoom - state.camera.minz)/(state.camera.maxz - state.camera.minz) + 0.1;

      game2d.state.ctx.beginPath();
      game2d.state.ctx.globalAlpha = alpha;
      game2d.state.ctx.fillStyle = public.color;
      game2d.state.ctx.arc(pos.x, pos.y, rad, 0, 2*Math.PI);
      game2d.state.ctx.fill();
      game2d.state.ctx.globalAlpha = 1.0;

      var hover = false;

      game2d.state.ctx.globalAlpha = 1 - alpha;

      if (game2d.state.camera.zoom > 0.10) {
      	if (public.dysonSphere != false) {
				public.dysonSphere.draw(game2d);
      	}
      	else {
				var sunwidth = (game2d.persist.assets['sun'].image.width - 10)*state.camera.zoom;
				var sunheight = (game2d.persist.assets['sun'].image.height - 10)*state.camera.zoom;

				state.ctx.drawImage(
					game2d.persist.assets['sun'].image, 
					pos.x - (game2d.persist.assets['sun'].image.width - 10)*state.camera.zoom/2, 
					pos.y - (game2d.persist.assets['sun'].image.height - 10)*state.camera.zoom/2,
					sunwidth,
					sunheight
				);
      	}

         //var planets = public.planets;

         for (var p = 0, len = public.planets.length; p < len; p++) {
         	var planet = public.planets[p];

         	if (planet.draw(game2d) && hover == false) {
         		game2d.state.ctx.strokeStyle = "#f00";
      			game2d.state.ctx.globalAlpha = 0.5;
		         game2d.state.ctx.lineWidth = lineWidth;
		         game2d.state.ctx.stroke();
      			game2d.state.ctx.globalAlpha = 1.0;
      			game2d.pointer();

      			if (game2d.mouse.clicks.length > 0) {
      				planet.click(game2d);
      			}

            	hover = true;
            }
         }
      }
      
      if (hover == false) {
      	if (Math.pow(game2d.mouse.x - pos.x, 2) + Math.pow(game2d.mouse.y - pos.y, 2) < Math.pow(rad + lineWidth, 2)) {
	         game2d.state.ctx.beginPath();
	         game2d.state.ctx.strokeStyle = "#eee";
	         game2d.state.ctx.lineWidth = lineWidth;
	      	game2d.state.ctx.arc(pos.x, pos.y, rad, 0, 2*Math.PI);
	         game2d.state.ctx.stroke();

	         game2d.pointer();

	         for (var i = 0; i < game2d.mouse.clicks.length; i++) {
	            var click = game2d.mouse.clicks[i];

	            if (Math.pow(click.layerX - pos.x, 2) + Math.pow(click.layerY - pos.y, 2) < Math.pow(rad + lineWidth, 2)) {
	               console.log(public);
	               public.click(game2d);
	            }
	         }
	      }
      }

      game2d.state.ctx.globalAlpha = 1;
    };
}

var gameDraw = function(game2d) {
	var state = game2d;

   var ctx = state.ctx;
   var camera = state.camera;
   
   ctx.fillStyle = "#232323";
   ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);

   var listOfSolarSystems = generateArea(game2d);

   for (var i = 0; i < listOfSolarSystems.length; i++)
      listOfSolarSystems[i].draw(game2d);
   for (var i = 0; i < FlyingShips.length; i++)
      FlyingShips[i].draw(game2d);
};