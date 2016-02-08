var WindowJS = function(element) {
   var private = {};
   var public = this;
   public.windows = [];
   public.element = element;
   public.minimized = (function() {
      var local = document.createElement("div");
      local.id = "minimized";
      local.style.position = "absolute";
      local.style.width = "100%";
      local.style.height = "20px";
      local.style.bottom = "0px";
      local.style.left = "0px";

      return local;
   }());

   public.element.appendChild(public.minimized);
   public.addWindow = function(addwindow) {
      public.windows.push(addwindow);
      public.element.appendChild(addwindow.element.max);
      public.minimized.appendChild(addwindow.element.min);
   };
   public.removeWindow = function(remwindow) {
      var i = public.windows.indexOf(remwindow);
      
      if (i >= 0) {
         public.windows.splice(i, 1);
         public.element.removeChild(remwindow.element.max);
         public.minimized.removeChild(remwindow.element.min);
      }
   };
};

WindowJS.Window = function(windowJS, content, x, y, width, height, title) {
   var private = {};
   private.windowJS = windowJS;

   var public = this;
   public.content = document.createElement("div");
   public.element = (new function(content, x, y, width, height, title) {
      var local = {
         max: document.createElement("div"),
         min: document.createElement("div"),
      };
      local.max.className = "max";
      local.max.style.width = width + "px";
      local.max.style.height = height + "px";
      local.max.style.left = x + "px";
      local.max.style.top = y + "px";
      local.max.minimized = false;
      local.max.content = document.createElement("div");
      local.max.content.className = "content";

      public.content = local.max.content;

      local.min.className = "min";
      local.min.style.display = "none";

      function createTopBar(title) {
         var topbar = document.createElement("div");
         topbar.className = "topbar";

         topbar.exit = document.createElement("div");
         topbar.exit.className = "exit";
         topbar.exit.innerHTML = "x";

         topbar.mize = document.createElement("div");
         topbar.mize.className = "mize";
         topbar.mize.innerHTML = "-";

         topbar.head = document.createElement("div");
         topbar.head.className = "head";
         topbar.head.innerHTML = title;
         topbar.head.down = false;

         topbar.appendChild(topbar.exit);
         topbar.appendChild(topbar.mize);
         topbar.appendChild(topbar.head);

         return topbar;
      }

      var topbar = createTopBar(title);
      var minbar = createTopBar(title);
      minbar.mize.innerHTML = "+";

      local.max.onclick = function(event) {
         clickSoundEffect();
         if (event.target.isEqualNode(topbar.mize)) {
            local.min.style.display = "inline-block";
            local.max.style.display = "none";
         }
         else if (event.target.isEqualNode(minbar.mize)) {
            local.min.style.display = "none";
            local.max.style.display = "";
         }
         else if (event.srcElement.isEqualNode(topbar.exit) || event.srcElement.isEqualNode(minbar.exit)) {
            private.windowJS.removeWindow(public);
         }
      };
      local.min.onclick = local.max.onclick;

      local.max.onmousedown = function(event) {
         if (event.target.isEqualNode(topbar.head)) {
            topbar.head.down = {
               x: event.pageX - local.max.getBoundingClientRect().left,
               y: event.pageY - local.max.getBoundingClientRect().top,
            };
         }
      };
      local.max.onmouseup = function(event) {
         clickSoundEffect();
         if (event.toElement.isEqualNode(topbar.head)) {
            topbar.head.down = false;
         }
      };
      document.addEventListener("mousemove", function(event) {
         if (topbar.head.down != false) {
            var x = event.pageX - topbar.head.down.x;
            var y = event.pageY - topbar.head.down.y;
            local.max.style.left = x + "px";
            local.max.style.top = y + "px";
            
            public.fixPos();
         }
      });
      local.max.content.innerHTML += content;
      local.max.appendChild(topbar);
      local.max.appendChild(local.max.content);
      local.min.appendChild(minbar);

      return local;
   }(content || "", x || 0, y || 0, width || 200, height || 200, title || "window"));
   

   public.fixPos = function() {
      var rect = public.element.max.getBoundingClientRect();

      console.log(rect);
      console.log(public.element.max);
      
      if (rect.left < 0) 
         public.element.max.style.left = "0px";

      if (rect.top < 0) 
         public.element.max.style.top = "0px";

      if (rect.left + rect.width > window.innerWidth) 
         public.element.max.style.left = (window.innerWidth - rect.width) + "px";

      if (rect.top + rect.height > window.innerHeight) 
         public.element.max.style.top = (window.innerHeight - rect.height) + "px";
   };
};