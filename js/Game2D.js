var Game2D = function(canvas, spec_window) {
   // private object
   var private = {};
   private.window = spec_window || window;
   private.referenceTime;

   // public object this
   // constructor
   var public = this;
   public.canvas = canvas;
   public.ctx = public.canvas.getContext("2d");
   public.hud = [];
   public.pointer = function() { canvas.style.cursor = "pointer"; };

   // public state
   public.camera = {
      world: {
         x: -800,
         y: -800,
      },
      screen: {
         x: 0,
         y: 0,
         localx: 0,
         localy: 0,
      },
      offsetx: 0,
      offsety: 0,
      zoom: 0,
      minz: 0.01,
      maxz: 0.5,
      zoomspeed: 0.00001,
      lastzoom: {
         x: 0,
         y: 0,
      },
   };
   public.camera.zoom = public.camera.maxz;
   public.mouse = {
      x: 0,
      y: 0,
      down: false,
      last_down: {
         x: 0,
         y: 0,
      },
      clicks: [],
   };
   public.state = {
      dt: 0,
      camera: public.camera,
      mouse: public.mouse,
      canvas: public.canvas,
      ctx: public.ctx,
   };

   // empty object for local state
   public.persist = {};

   // general refresh
   private.refresh = function(state) {
      state.canvas.width = private.window.innerWidth;
      state.canvas.height = private.window.innerHeight;
   };

   // screen to world pos
   public.camera.sToW = function(x, y) {
      var camera = public.camera;
      return {
         x: -1*(camera.screen.x + camera.screen.localx + camera.offsetx)/camera.zoom + camera.screen.x - camera.world.x,
         y: -1*(camera.screen.y + camera.screen.localy + camera.offsety)/camera.zoom + camera.screen.y - camera.world.y,
      };
   };

   // world to screen pos
   public.camera.wToS = function(x, y) {
      var camera = public.camera;
      return {
         x: (x + camera.world.x - camera.screen.x)*camera.zoom + (camera.screen.x + camera.screen.localx + camera.offsetx),
         y: (y + camera.world.y - camera.screen.y)*camera.zoom + (camera.screen.y + camera.screen.localy + camera.offsety),
      };
   };

   // overrides
   public.init = function(state, persist) {};
   public.update = function(state, persist) {};
   public.draw = function(state, persist) {};

   // callback flow, set interval
   public.start = function() {
      private.referenceTime = new Date();
      public.canvas.style.width = "100%";
      public.canvas.style.height = "100%";

      // event listeners
      public.canvas.addEventListener("click", function(event) {
         public.mouse.clicks.push(event);
      });
      public.canvas.addEventListener("mousemove", function(event) {
         public.mouse.x = event.layerX;
         public.mouse.y = event.layerY;

         if (public.mouse.down) {
            public.camera.screen.localx = event.layerX - public.mouse.last_down.x;
            public.camera.screen.localy = event.layerY - public.mouse.last_down.y;
         }
      });
      public.canvas.addEventListener("mousedown", function(event) {
         public.mouse.down = true;
         public.mouse.last_down = {
            x: event.layerX,
            y: event.layerY,
         };
      });
      public.canvas.addEventListener("mouseup", function(event) {
         public.mouse.down = false;

         public.camera.world.x += public.camera.screen.localx / public.camera.zoom;
         public.camera.world.y += public.camera.screen.localy / public.camera.zoom;

         public.camera.screen.localx = 0;
         public.camera.screen.localy = 0;
      });
      public.canvas.addEventListener("mousewheel", function(event) {
         public.camera.zoom += event.pageY*event.deltaY*public.camera.zoomspeed;
         
         if (public.camera.zoom < public.camera.minz)
            public.camera.zoom = public.camera.minz;

         if (public.camera.zoom > public.camera.maxz)
            public.camera.zoom = public.camera.maxz;

         if (public.camera.screen.x != event.layerX &&
             public.camera.screen.y != event.layerY) {

            public.camera.world.x += public.camera.screen.x;
            public.camera.world.y += public.camera.screen.y;
         }
      });

      // init override
      public.init(public.state, public.persist);

      // "main loop"
      private.window.setInterval(function() {
         // frame time
         var dt = (new Date()) - private.referenceTime;
         private.referenceTime = new Date();
         public.state.dt = dt/1000;

         public.camera.offsetx = public.canvas.width/2;
         public.camera.offsety = public.canvas.height/2;

         canvas.style.cursor = "";

         // refresh
         private.refresh(public.state, public.persist);

         // override calls
         public.update(public.state, public.persist);
         public.draw(public.state, public.persist);

         // HUD
         public.ctx.globalAlpha = 1;

         var h = 1;
         var i = 12;
         public.state.ctx.fillStyle = "#f00";
         public.state.ctx.font = i + "px Arial";
         
         for (var key in public.hud) {
            if (typeof public.hud[key] === "function") {
               public.state.ctx.fillText(key + ": " + public.hud[key](), 3, h*i);
            }
            else {
               public.state.ctx.fillText(key + ": " + public.hud[key], 3, h*i);
            }
            h++;   
         }

         // reset clicks
         public.mouse.clicks = [];
      });
   };
};