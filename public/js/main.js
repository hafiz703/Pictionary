var lock = false;
var reset = false;
$(document).ready(function(){     
    var socket = io.connect();
    var $messageForm = $('#messageForm')
    var $message = $('#message')
    var $chat = $('#chat')

    var $messageArea = $('#messageArea')
    var $userFormArea = $('#userFormArea')
    var $userForm = $('#userForm')
    var $users = $('#users')
    var $username = $('#username')
    var $mainChatContainer = $('#mainChatContainer')
    var mycolor;     
    var timerfunc;
    var userid;

  
    
    


    $messageForm.submit((e)=>{
        e.preventDefault();
        if($message.val()){            
            console.log('Submitted')
            socket.emit('send message' ,$message.val());
            $message.val('');               
            
        } 
    })

    String.prototype.format = function() {
        a = this;
        for (k in arguments) {
          a = a.replace("{" + k + "}", arguments[k])
        }
        return a
      }

    socket.on('new message',(data,bool)=>{
        // console.log('bool')
        
        $mainChatContainer.prepend('<span style="color:{0}"><strong>'.format(data.color)+data.user+'</strong></span> : '+data.msg+'</br>')
       
        
    })

    socket.on('correctAns',(data,users)=>{        
        $mainChatContainer.prepend('<span style="color:{0}"><strong>'.format(data.color)+data.user+'</strong></span> : '+data.msg+'</br>')
        alert('Correct!')
        console.log('CORRECT')
        handOver();
        // clearInterval(timerfunc);
        // $('#timer').empty();       
        // reset = true;
        // lock = false; 
        // document.querySelector('#timer').textContent='';
        // $("#guessWord").empty()
        // socket.emit('setdrawplayer');

        var html = ''
        for (var i=0; i<users.length;i++){
            // console.log(data[i].id , userid)
            if(users[i].id == userid){
                html+='<li id="usermyRow" style="background-color:{0};" class = "list-group-item"><strong>'.format(users[i].color)+users[i].user+' : '+users[i].points+'</strong></li>'
            }else{
                html+='<li id="userRow" style="background-color:{0};" class = "list-group-item">'.format(users[i].color)+users[i].user+' : '+users[i].points+'</li>'
            }
            
        }        
        
        $users.html(html)

    })

    $userForm.submit((e)=>{
        e.preventDefault();
        var user = $username.val();
        //console.log('Submitted')
        socket.emit('new user' ,$username.val(),(bool,id)=>{
            if(bool){
                console.log('ID:) = ',id);
                userid = id;
                // console.log(user)
                socket.emit('send message','<span style="font-style: italic;color:black;"><strong>'+user+'</strong> connected</span>')
                // $mainChatContainer.prepend('<span style="font-style: italic;color:black;"><strong>'+user+'</strong> connected</span></br>')                     
                $userFormArea.hide();
                $messageArea.show();
                                
            }else{
                $('#myModal').modal('show');                
            }
        });
        $username.val('');
    })

    socket.on('set users',(data)=>{
        var html = ''
        
        for (var i=0; i<data.length;i++){
            // console.log(data[i].id , userid)
            if(data[i].id == userid){
                html+='<li id="usermyRow" style="background-color:{0};" class = "list-group-item"><strong>'.format(data[i].color)+data[i].user+' : '+data[i].points+'</strong></li>'
            }else{
                html+='<li id="userRow" style="background-color:{0};" class = "list-group-item">'.format(data[i].color)+data[i].user+' : '+data[i].points+'</li>'
            }
            
        }
        $users.html(html)
        if(data.length>1){
            $mainChatContainer.prepend('<span> Starting ! User '+data[0].user +' is getting ready to draw</span></br>')
            socket.emit('setdrawplayer');
        }
    })

    socket.on('user disconnected',(data)=>{
        socket.emit('send message','<span style="font-style: italic;color:{0};"><strong>'.format(data.color)+data.user+'</strong> disconnected</span></br>')
        // $mainChatContainer.prepend('<span style="font-style: italic;color:{0};"><strong>'.format(data.color)+data.user+'</strong> disconnected</span></br>')
    })

    socket.on('receiveControl',(data)=>{
        if (!lock) {  
            console.log(data,socket.id)
            $('#myModalCategory').modal('show');
            $('#message').prop('disabled', true);   
            //** put in socket.on('start game')
            //    display = document.querySelector('#timer');
            //    startTimer(60, display);
                // $('#guessWord').append('Test')
            lock = true;
            // socket.sentMydata = true;
        }
    })

    $('#message').keypress((e)=>{
        if(e.which ==13){
           
            $('#submitAns').submit();
            return false;
        }
    })

    function startTimer(duration, display) {
        var timer = duration, minutes, seconds;       
        timerfunc = setInterval(function(){
            minutes = parseInt(timer / 60, 10)
            seconds = parseInt(timer % 60, 10);
    
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
    
            display.textContent = minutes + ":" + seconds;             
            if (--timer < 0) {
                timer = duration;
            }

            if(minutes==0 && seconds ==0){
                // $mainChatContainer.prepend("<span><strong>Time's up !</strong></span>")
                socket.emit('send message',"<span><strong>Time's up !</strong></span>")                 
                handOver(); 
            }

            
        }, 1000);
        
    };

    $("#buttonPerson").click(()=>{
         socket.emit("setWord","person");
    })

    $("#buttonAnimals").click(()=>{
        socket.emit("setWord","animals");
    })

    $("#buttonAnything").click(()=>{
        socket.emit("setWord","anything");
    })

    socket.on('setTimer',(word,id)=>{
        if(id==socket.id){
            // $('#categoryModalBody').empty();
            $('#buttonPerson').hide()
            $('#buttonAnything').hide()
            $('#buttonAnimals').hide()

            $('#placeholder').append('You have 1 minute to draw <strong>'+word+'</strong>')
            
            setTimeout(function() {
                $('#myModalCategory').modal('hide');
                $('#placeholder').empty();
                $('#buttonPerson').show()
                $('#buttonAnything').show()
                $('#buttonAnimals').show()
            }, 2000);
            $('#guessWord').append(word)
        }
        display = document.querySelector('#timer');
        startTimer(62, display);
        
    })

    function handOver(){
        clearInterval(timerfunc);
        $('#timer').empty();                
        socket.emit('setdrawplayer');    
        $("#guessWord").empty()
        reset = true;
        lock = false;
        $('#message').prop('disabled', false);
    }
})

/*
1. change chat aesthetics --done
2. get word/ cat database
3. set game logic flow
    - let draw player choose cat and word
    - lock all others
    - guess pic in 1 min    
    - add menu for changing colors and keystrokes [only for draw player]
    - point system
    - show points beside name

*/

 

 
 