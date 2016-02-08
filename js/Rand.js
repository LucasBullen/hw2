function rand1(seed) {
   var x = Math.sin(seed) * 3499;
   return x - Math.floor(x);
}

function rand2(seed) {
   var x = Math.tan(seed) * 3571;
   return x - Math.floor(x);
}

function randXY(x, y) {
   var temp1 = rand1(x);
   var temp2 = rand2(y);
   var temp3 = rand1(rand2(x/y));
   var temp4 = rand1(rand2(y/x));

   return ( rand1(temp1+temp2+temp3+temp4) + rand2(temp1+temp2+temp3+temp4) )/2;
}