var planetElements = [];//all elements which holds planet info
var elementElement = [];//all elements which holds element info
var elementRequired = false;//if we are looking for elements
var planetRequired = false;//if we are looking for planets

var flightSearch = false;
var QedShip;

var elementsSelected = [];

function solarSystemWindow(game2d, solarsystem) {
   var windowjs = game.state.windowjs;

   var pos = game2d.camera.wToS(solarsystem.x + 10 + solarsystem.rad, solarsystem.y - solarsystem.rad);
   var win = new WindowJS.Window(windowjs, "", pos.x, pos.y, 250, 250, "System (" + solarsystem.x/solarsystem.chunksize + ", "+ solarsystem.y/solarsystem.chunksize + ")");
   
   var content = document.createElement("div");
   var planets = solarsystem.planets;

   var buyDyson = createButton("Buy Dyson Pyramid", function() {
      if (solarsystem.dysonSphere == false && InteractedSolarSystems.indexOf(solarsystem) >= 0) {
         var sphere = new DysonSphere(solarsystem);
         var afford = buy(sphere, game2d);
         numOfDysons++
         checkProgress(game2d);
         solarsystem.dysonSphere = sphere;
      }
   });

   win.content.innerHTML += "<div>Has Dyson Sphere: " + (solarsystem.dysonSphere != false) + "</div>";
   win.content.appendChild(buyDyson);
   content.innerHTML += "</br>";

   if (planets.length > 0) {
      content.innerHTML += '<div>Planets:</div>';
      var list = document.createElement("div");
      list.className = "list";
      
      for (var i = 0, len = planets.length; i < len; i++) {
         var item = document.createElement("div");
         item.className = "item";
         item.innerHTML = planets[i].name;
         item.onclick = planets[i].click;

         list.appendChild(item);
      }

      content.appendChild(list);
   }
   else {
      content.innerHTML += '<div>Planets: none</div>';
   }

   win.content.appendChild(content);
   win.solarsystem = solarsystem;

   return win;
}

function planetWindow(game2d, planet) {
   var windowjs = game.state.windowjs;

   var pos = game2d.camera.wToS(planet.centerx + 10 + planet.distance, planet.centery - planet.distance);
   var win = new WindowJS.Window(windowjs, "", pos.x, pos.y, 250, 400, planet.name);
   var content = document.createElement("div");
   content.style['overflow-y'] = "scroll";

   win.content.innerHTML += "<div>Elements:</div>";
   var elements = document.createElement("div");
   elements.className = "list";

   for (var i = 0; i < planet.elements.length; i++) {
      var item = document.createElement("div");
      item.className = "item";
      item.innerHTML += planet.elements[i].name;
      item.windowjs = new WindowJS.Window(game2d.state.windowjs, 
         "<div>Type: " + planet.elements[i].type + "</div>" +
         "<div>Amount: " + planet.elements[i].amount + "</div>" +
         "<div>Mines: " + planet.elements[i].mines.length + "</div>",
      pos.x, pos.y, 150, 150, planet.elements[i].name);

      var butt = createButton("Buy Mine", function() {
         if (InteractedSolarSystems.indexOf(this.planet.solarSystem) >= 0) {
            var mine = new Mine(this.planet, this.element);
            var afford = buy(mine, game2d);
            buildSoundEffect();
            if (afford) {
               this.element.mines.push(mine);
            }
         }
      });
      butt.element = planet.elements[i];
      butt.planet = planet;

      item.windowjs.content.appendChild(butt);
      
      item.onclick = function() {
         game2d.state.windowjs.addWindow(this.windowjs);
      };
      elements.appendChild(item);
   }
   win.content.appendChild(elements);
   
   win.content.appendChild(createButton("Build Ship",function(){ return buyShip(game2d,planet); }));
   if (flightSearch) win.content.appendChild(createButton("Set Destination",function(){ return setDestination(planet); }));

   content.innerHTML += "<div>Ships:</div>";
   var structures = document.createElement("div");
   structures.className = "list";

   for (var i = 0; i < planet.structures.length; i++) {
      var item = document.createElement("div");
      item.className = "item";
      item.innerHTML += planet.structures[i].name;
      item.windowjs = new WindowJS.Window(game2d.state.windowjs, 
         "<div>Speed: " + planet.structures[i].speed + "</div>",
      pos.x, pos.y, 150, 150, planet.structures[i].name);
      var ship = planet.structures[i]
      item.windowjs.content.appendChild(createButton("Travel",function(){ return flyShip(ship); }));

      item.onclick = function() {
         game2d.state.windowjs.addWindow(this.windowjs);
      };
      structures.appendChild(item);
   }
   win.content.appendChild(structures);

   win.content.appendChild(content);
   win.planet = planet;

   return win;
}

function flyShip(Ship){
   flightSearch = true;
   console.log(Ship);
   QedShip=Ship;
}
function setDestination(planet){
   if (flightSearch) {
      //fly
      QedShip.fly(planet);
      flightSearch=false;
   }
}

function buyShip(game2d,planet){
   if (InteractedSolarSystems.indexOf(planet.solarSystem) >= 0) {
      var ship = new Ship(planet);
      var afford = buy(ship, game2d);
      buildSoundEffect();
      if (afford) {
         planet.structures.push(ship);
      }
   }
}
//Lucas's stufff :)

function shipWindow(game2d, ship){
   var windowjs = game.state.windowjs;
   var traveledDistance = (((now-ship.travel.start)/(ship.travel.end-ship.travel.start)))*ship.travel.distance;
   if (traveledDistance==undefined) {
      traveledDistance=0;
   }
   var currentX = ship.travel.sx;
   var currentY = ship.travel.sy;
    var state = game2d.state;
   var pos = state.camera.wToS(currentX, currentY);

   var stats = "<p>speed:"+(ship.baseSpeed*ship.level)+" x:"+currentX+" y:"+currentY+"</p>";
   var html = "<stats>"+stats+"</stats>";
   var now = new Date();
   
   var theWindow = new WindowJS.Window(windowjs, html, pos.x, pos.y, 200, 200, "ship:"+ship.name);

   theWindow.content.appendChild(createButton("Defence Post",ship.defence.click));
   theWindow.content.appendChild(createButton("Storage Silo",ship.storage.click));

   theWindow.content.appendChild(createButton("Upgrade",function(){ return upgrade(ship,this); }));
   theWindow.content.appendChild(createButton("Travel"));

   windowjs.addWindow(theWindow);   
}

function createButton(title,onClick){
   var dpB = document.createElement("BUTTON");
   var t = document.createTextNode(title);
   dpB.onclick = onClick;
   dpB.appendChild(t);
   return dpB;
}

//inner functions
function upgrade(building,button){ 
   //TODO::
}