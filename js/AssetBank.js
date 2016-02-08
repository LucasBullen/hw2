var AssetBank = function(preload, preload_callback) {
   var private = {};
   var public = this;

   private.load_image = function(url, callback, preload) {
      var image = new Image();
      image.onload = function() {
         callback(image, preload);
      };
      image.src = url;
   };
   private.load_sound = function(url, callback, preload) {
      var audio = new Audio();
      audio.addEventListener("canplaythrough", function() {
         console.log("audio loaded");
         callback(audio, preload);
      });
      audio.src = url;
   };

   if (typeof preload !== "undefined" && typeof preload_callback !== "undefined") {  
      private.preload_callback = preload_callback;
      private.done = preload.length;
      
      private.loaded = function() {
         private.done -= 1;
         
         if (private.done == 0) {
            private.preload_callback();
         }
      };

      for (var i = 0; i < preload.length; i++) {
         console.log(preload[i].type);
         if (preload[i].type == "image") {
            public[preload[i].name] = {
               image: undefined,
               loaded: false,
            };
            private.load_image(preload[i].url, function(image, name) {
               public[name].image = image;
               public[name].loaded = true;

               private.loaded();
            },
            preload[i].name);
         }else{
            public[preload[i].name] = {
               audio: undefined,
               loaded: false,
            };
            private.load_sound(preload[i].url, function(audio, name) {
               public[name].audio = audio;
               public[name].loaded = true;

               private.loaded();
            },
            preload[i].name);
         }
      }
   }
};