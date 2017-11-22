var socket;
const SIZE = 10;
var canvas;
function setup(){
    canvas = createCanvas(window.innerWidth/1.66, window.innerHeight/2.0  )
    canvas.parent("#chat")
    canvas.background(51)
    socket = io.connect('http://localhost:3000')
    // var resetbutt = createButton("RESET");
    // resetbutt.mousePressed(resetSketch )   
    socket.on('mouse',(data)=>{
        noStroke();
        fill(255);
        ellipse(data.x,data.y,SIZE,SIZE) 
    })
}

function resetSketch(){
    canvas.background(51)
}

function mouseDragged(){
    // 
    noStroke();
    if(this.lock){        
        fill(255)    
        ellipse(mouseX,mouseY,SIZE,SIZE)

        var data = {
            x:mouseX,
            y:mouseY
        }

        socket.emit('mouse',data)
    }   
}

function draw(){
    if(this.reset){
        canvas.background(51)
        this.reset=false;
    }

}

 

 