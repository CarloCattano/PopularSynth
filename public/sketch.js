var posX, posY;
var radius;

function setup(){
    createCanvas(screen.width , screen.height);   
    radius = 24;
    posX = window.innerWidth*0.8;
    posY = 40;
    background(0,0,0,80);
                        } 
function draw(){
        fill(255,255,255,100);
        text("FullScreen", posX+15, posY); //offset Fullscreen Button Position
        fill(255,255,0);
        ellipse(posX,posY,radius,radius);
            //Lerping random background color fading
    var color1 =color(0,0,0);
    var color2 =color(255,255,255);
    var c1 = lerpColor(color1,color2, Math.random()*2);
    }

function mousePressed() {
  var d = dist(mouseX, mouseY, posX, posY);
    if (d < radius/2) {
        //Clicked inside
         var fs = fullscreen();
        fullscreen(!fs);
        }
   
  }
function windowResized() {
  resizeCanvas(screen.width, screen.height);
    posX = window.innerWidth*0.8;
    background(0,0,0,80);
}


