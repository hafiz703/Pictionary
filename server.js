var express = require('express');
var app = express();
app.use(express.static('public'));
var server  = require('http').createServer(app);
var io = require('socket.io').listen(server);

var users = [];
var connections=[];
const PORT = 3000;

server.listen(process.env.PORT || PORT);
console.log("Server Running on port "+PORT);
app.get('/', (req,res)=>{
    res.sendFile(__dirname+'/index.html')
})

const COLORS= [ 'black', 'blue', 'fuchsia', 'green', 
 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 
 'teal'];

const PERSON = ['Fireman','Policeman','Soldier','Veterinian','Teacher','DJ'];
const ANIMAL = ['Bird','Lizard',"Snake",'Cat','Dog','Dolphin'];
const ANYTHING = ['Cone','Flower','Milk','Bench','Octopus','Spider','Bucket','Cricket'];
var colIndex;
var drawPlayerIndex = 0;
var guessWord='';
// Events to emit go here
io.sockets.on('connection',(socket)=>{
    // if (socket.username){
    //     connections.push(socket)
    // }
    connections.push(socket)
    console.log('Connected: %s sockets connected',connections.length,users)
 


    // Disconnect
    socket.on('disconnect',(data)=>{        
        if(!socket.username) {
            connections.splice(connections.indexOf(socket),1);
            console.log('Disconnected: %s sockets connected',connections.length)
            return;
        }
        io.sockets.emit('user disconnected',{user:socket.username,
                                            color:socket.color});
        users.splice(users.indexOf(socket.username),1)
        updateUsernames();
        connections.splice(connections.indexOf(socket),1);
        console.log('Disconnected: %s sockets connected',connections.length)
        if(users.length<1){
            drawPlayerIndex = 0;
        }
    })

    //Send message

    socket.on('send message',(data)=>{
        console.log('kekerz')
        String.prototype.format = function() {
            a = this;
            for (k in arguments) {
              a = a.replace("{" + k + "}", arguments[k])
            }
            return a
          }
        // If correct word
        if(data.toLowerCase()==guessWord.toLowerCase()){
          
            // Add points
            for (var i=0;i<users.length;i++){
                if (users[i].user == socket.username){
                    users[i].points+= 5;
                }

               
            }
            users[drawPlayerIndex].points+=2;
            io.sockets.emit('correctAns',{msg:'<span style="color:{0}"><strong>'.format(socket.color)+socket.username+'</strong></span> has guessed the word!',
            user:socket.username,
            color:socket.color},users);
             
            drawPlayerIndex=(drawPlayerIndex+1)%users.length;

        }else{
            let sockuser = socket.username
            let sockcolor = socket.color;
            if(socket.username==null){
                sockuser="System";
                sockcolor = "Black";
            }
            io.sockets.emit('new message',
                            {
                            msg:data,
                            user:sockuser,
                            color:socket.color
                            });
        }
        
    })

    

    socket.on('new user',(data,callback)=>{
        
        if (users.filter(function(e) { return e.user == data; }).length > 0 || data.length<3) {             
            callback(false)
        
        }else{
            colIndex = Math.floor((Math.random() * COLORS.length-1) + 1);             
            socket.color = COLORS[colIndex]
            console.log(COLORS[colIndex])
            console.log('userid',socket.id) 
            callback(true,socket.id);
            socket.username = data;
            socket.points=0;                      
            users.push({user:socket.username,color:socket.color,id:socket.id,points:socket.points});
            console.log(users)
            updateUsernames()

        }
        
    });

    socket.on('mouse',(data)=>{
        // console.log(data)
        socket.broadcast.emit('mouse',data);
    })

    let updateUsernames = function(){
        io.sockets.emit('set users',users);

    }

    socket.on('setdrawplayer',()=>{            
            // updateUsernames();        
            // drawPlayerIndex+=1;
            // console.log('draw player: ',drawPlayerIndex,users[drawPlayerIndex].id)
            try{
                io.to(users[drawPlayerIndex].id).emit('receiveControl', 'whatever');
            }catch(e){
                drawPlayerIndex = 0;
                io.to(users[drawPlayerIndex].id).emit('receiveControl', 'whatever');
            }
            
            
        
        // console.log('drawplayerindex: ',drawPlayerIndex)
    })

    socket.on('setWord',(category)=>{        
        // console.log(category)
       switch(category){
           case 'person':
                guessWord = PERSON[Math.floor((Math.random() * PERSON.length-1) + 1)];
                break;
           case 'animals':
                guessWord = ANIMAL[Math.floor((Math.random() * ANIMAL.length-1) + 1)];
                break;
           case 'anything':
                guessWord = ANYTHING[Math.floor((Math.random() * ANYTHING.length-1) + 1)];
                break;
           default:
                guessWord = 'Bee'  



       }
       io.sockets.emit('setTimer',guessWord,users[drawPlayerIndex].id);
    //    io.to(users[drawPlayerIndex].id).emit('setTimer',guessWord);
       
    })

    



    
    
})
