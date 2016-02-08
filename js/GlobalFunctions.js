var InteractedSolarSystems = []; // {id:(lx*chunksize)+":"+(ly*chunksize), solarSystem:XX}
var FlyingShips = [];


//audio effects
var myAudio = new Audio('assets/sounds/backrepeat.mp3'); 
myAudio.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);
myAudio.play();

function buildSoundEffect(){
  new Audio('assets/sounds/build.mp3').play();
}
function levelupSoundEffect(){
  new Audio('assets/sounds/levelup.mp3').play();
}
function clickSoundEffect(){
  new Audio('assets/sounds/button.mp3').play();
}

//progress towards winning
var numOfDysons = 0;
var startGameTime = new Date();
function checkProgress(game2d){
  var x = numOfDysons;
   var text;
   if (x==1) {
      text = "First Dyson Sphere! Ra would be proud!";
   }else if (x==5) {
      text = "Half way to your goal, keep it up!";
   }else if (x==10) {
      var now = new Date();
      text = "You Made it! Feel free to continue exploring, your score: "+(now - startGameTime)/60000;
   }else{
      return;
   }
   levelupSoundEffect();
   var windowjs = game.state.windowjs;
   var theWindow = new WindowJS.Window(windowjs, text, 200, 100, 200, 200, "CONGRADULATIONS!");
   windowjs.addWindow(theWindow);
}


function saveSolarSystem(solarSystem) {
  /*InteractedSolarSystems.push({
    solarSystem: solarSystem,
    id: solarSystem.x+":"+solarSystem.y,
  });*/
  //InteractedSolarSystems[solarSystem.x+":"+solarSystem.y] = solarSystem;
  InteractedSolarSystems.push(solarSystem);
}

function randPlanetName(rand){
   var list1 = ["Ra", "Ha", "Sek", "Nu", "Osi", "Se", "Ho", "Ba", "Tho", "Is", "Ba"];
   var list2 = ["st", "", "'","at", "ru", "th", "t", "th"];
   var list3 = ["", "is","us", "th", "un", "et", "eb", "or"];

   var r1 = Math.ceil(rand1(rand)*1000);
   var r2 = Math.floor(rand2(rand)*2001);
   var r3 = Math.round(randXY(r1, r2)*3001);

   var a = list1[r1%list1.length];
   var b = list2[r2%list2.length];
   var c = list3[r3%list3.length]; 

   return a+b+c;
}
function randShipName(rand){
   var list1 = ["C", "G", "B", "K", "P", "Ch", "End", "H", "M", "St"];
   var list2 = ["ath", "agel", "tar","eye", "ort", "ura", "ent", "rad"];
   var list3 = ["ory", "away","an", "burg", "ation", "avour", "land", "enna", "strong"];

   var r1 = Math.ceil(rand1(rand)*1000);
   var r2 = Math.floor(rand2(rand)*2001);
   var r3 = Math.round(randXY(r1, r2)*3001);

   var a = list1[r1%list1.length];
   var b = list2[r2%list2.length];
   var c = list3[r3%list3.length]; 

   return a+b+c;
}
function randColor(x, y, dark){
   var list1 = ["e", "f"];
   if (dark) {
      list1 = ["8", "6", "A","0"];
   }

   var r1 = Math.ceil(rand1(x/y)*1000);
   var r2 = Math.floor(rand2(y/x)*2001);
   var r3 = Math.round(rand1(x+y)*3001);
   var r4 = Math.floor(rand1(x*y)*4001);
   var r5 = Math.round(rand2(y%x)*5001);
   var r6 = Math.floor(rand1(x%y)*6001);

   var a = list1[r1%list1.length];
   var b = list1[r2%list1.length];
   var c = list1[r3%list1.length]; 
   var d = list1[r4%list1.length];
   var e = list1[r5%list1.length]; 
   var f = list1[r6%list1.length];

   return "#"+a+b+c+d+e+f;
}

function randElement(rand){
   var list1 = ["B", "C", "D", "F", "G", "J", "K", "L", "M", "N", "P", "R", "S", "T", "V", "W", "Z", "En", "Em", "Ap", "Ad", "Aeph", "Kryp"];
   var list2 = ["eno", "ene", "ono", "ito", "old", "ado", "afo", "aglo"];
   var list3 = ["gen", "rine", "fur", "con", "phorus", "gon", "ium", "kel", "nic", "ton", "var", "non", "don"];

   var r1 = Math.ceil(rand1(rand)*1000);
   var r2 = Math.floor(rand2(rand)*2001);
   var r3 = Math.round(randXY(r1, r2)*3001);

   var a = list1[r1%list1.length];
   var b = list2[r2%list2.length];
   var c = list3[r3%list3.length];

   var name = a+b+c;
   var types = ["fuel","material","energy"];
   var type = types[Math.floor(rand1(rand)*types.length)];
   var amount = Math.round(1000 + rand*2000);

   var element = {
      "name":name,
      "type":type,
      "amount":amount,
      "mines":[]
   };
   return element;
}
function emptyElement(){
	var element = {
		"name":"",
		"type":"",
		"amount":0,
		"mines":[]
	};
	return element;
}

function generatePlanets(x, y, rad, rand, chunksize, solarSystem){
   var planets = [];
   var max = 8;
   var min = 1;

   var len = Math.round(rand2(rand2(rand1(rand)))*(max - min)*2*(rad/chunksize))+min;
   
   if (x==1 && y==1) {
      //home world
      len = maxPlanets;
   }
      for (var i = 1; i < len; i++) {
         var orbit = Math.round(i/len*rad);
      planets.push(new Planet(x, y, orbit, i, (rad/len)*(2/7)*randXY(orbit, len), solarSystem));
   };
   return planets;
}

function generateArea(game2d){
   var state = game2d.state;

	var x = game2d.camera.sToW(0, 0).x;
    var y = game2d.camera.sToW(0, 0).y;

    var objects = [];
    var chunksize = 800;
    var minsize = chunksize/3;
    var sx = Math.round(x/chunksize);
    var sy = Math.round(y/chunksize);
    var rangex = Math.round((state.canvas.width/state.camera.zoom)/chunksize);
    var rangey = Math.round((state.canvas.height/state.camera.zoom)/chunksize);

    for (var ly = sy; ly <= rangey + sy; ly++) {
    	for (var lx = sx; lx <= rangex + sx; lx++) {
    		var created = false;
			for (var i = 0; i < InteractedSolarSystems.length; i++) {
				if ((lx*chunksize) == InteractedSolarSystems[i].x && 
            (ly*chunksize) == InteractedSolarSystems[i].y) {

					created = true;
					objects.push(InteractedSolarSystems[i]);
          break;
				}
	    }    	
    	if (created) continue;
    	if (ly==1 && lx==1) {
    		var homeSolarSystem = new SolarSystem(lx*chunksize, ly*chunksize, chunksize/2, chunksize, 0.91);
        //homeSolarSystem.dysonSphere = new DysonSphere(homeSolarSystem);

        objects.push(homeSolarSystem);

        saveSolarSystem(homeSolarSystem);
      }else{
    		var random = randXY(lx, ly);
        var rad = minsize*rand1(random)*rand2(random);
        
        if (rad < chunksize/12) {
           rad = rad/minsize;
           rad = minsize*Math.pow(rad, rad);
        }

        if (random > 0.9) {
           objects.push(new SolarSystem(lx*chunksize, ly*chunksize, rad, chunksize));
        }
    	}
    }
  }
  return objects;
}
