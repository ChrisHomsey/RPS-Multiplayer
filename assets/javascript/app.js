// Initialize Firebase
  var config = {
    apiKey: "AIzaSyAyrSxgYCvJUDhKMepA3gWAWt8BWkhR7Vs",
    authDomain: "rps-multiplayer-fd0f9.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-fd0f9.firebaseio.com",
    projectId: "rps-multiplayer-fd0f9",
    storageBucket: "rps-multiplayer-fd0f9.appspot.com",
    messagingSenderId: "904119220859"
  };
  firebase.initializeApp(config);

  var database = firebase.database();

  database.ref('reset').set(false);

  var results;
// Game Logic

//Player 1 selects choice
$(".p-one-choice").click(function(){
	var playerOneChoice = $(this).attr("data-choice");
	console.log("Player 1 chooses: " + playerOneChoice);
	console.log("Waiting for Player 2");
	database.ref('choices').child('playerOneChoice').set(playerOneChoice);

})

//Player 2 selects choice
$(".p-two-choice").click(function(){
	var playerTwoChoice = $(this).attr("data-choice");
	console.log("Player 2 chooses: " + playerTwoChoice);
	console.log("Waiting for Player 1");
	database.ref('choices').child('playerTwoChoice').set(playerTwoChoice);
})

//Listens for choices to be made by either player.
database.ref('choices').on("value", function(snapshot){	
	
	//Identifies that player 1 has made choice
	if (snapshot.val().playerOneChoice) {
		$('#p-one-choices').hide();
		$('#waiting-one').text("Waiting for Player 2...");
	}

	//Identifies that player 2 has made choice
	if (snapshot.val().playerTwoChoice) {
		$('#p-two-choices').hide();
		$('#waiting-two').text("Waiting for Player 1...");
	}

	//Both players have chosen, and we call the compareChoices function to see who won
	if (snapshot.val().playerOneChoice && snapshot.val().playerTwoChoice) {
		console.log('Both players have locked in!');
		console.log(snapshot.val());
		var choice1 = snapshot.val().playerOneChoice;
		var choice2 = snapshot.val().playerTwoChoice;

		//Store the return of compareChoices to var results, console.log it, then display the results in both the game and the chat messages
		results = compareChoices(choice1, choice2)
		console.log(results);
		$('#results-display').html(results + '<br><button id="play-again" class>Play Again</button>');


	}



})

//#play-again button is clicked- the results are pushed into the chat messages and we clear the choices stored in our database
$('#results-display').on('click', '#play-again', function(){
	database.ref('messages').push({
		message: '<p class="game-message">' + results + '</p>',
		dateAdded: firebase.database.ServerValue.TIMESTAMP
	})
	database.ref('reset').set(true);
	database.ref('choices').set(null);
})

//Makes sure that the game starts again for both players when the #play-again button is clicked.
database.ref('reset').on("value", function(snapshot){
	if (snapshot.val() === true){
		$('#results-display').empty();
		database.ref('reset').set(false);
	}
	if (snapshot.val() === false) {
		$('#waiting-two').empty();
		$('#waiting-one').empty();
		$('#p-one-choices').show();
		$('#p-two-choices').show();
	}
})


//Compares both player's choices to see who wins
function compareChoices(choice1, choice2) {
	if(choice1===choice2){
        return "Tie! Nobody wins this round!";
    }else{
	  	if(choice1==="rock"){
	        if(choice2==="scissors"){
	            return "Rock beats scissors. Player 1 wins!";
	        }
	        else{
	            return "Paper beats rock. Player 2 wins!";
	        }
	    }
	    if(choice1==="paper"){
	        if(choice2==="rock"){
	            return "Paper beats rock. Player 1 wins!";
	        }
	        else{
	            return "Scissors beats paper. Player 2 wins!";
	        }
	    }
	    if(choice1==="scissors"){
	        if(choice2==="paper"){
	            return "Scissors beats paper. Player 1 wins!";
	        }
	        else{
	            return "Rock beats scissors. Player 2 wins!";
	        }
	    }
	}
}


//Chat Function

//posts new messages
database.ref('messages').orderByChild("dateAdded").on("child_added", function(snapshot) {
	var $m = $('<p>');
	$m.html(snapshot.val().message);
	$('#messages').append($m);
})


//when the chat-submit button is clicked, a new message is pushed into "messages" array in our firebase database
$('#chat-submit').click(function(event){
	event.preventDefault();
	var message = $('#chat-input').val();
	database.ref('messages').push({
      message: message,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    })
    $('#chat-input').val('');
})

//When the #chat-clear button is pressed we clear the #messages div and our messages array in firebase database
$('#chat-clear').click(function(event){
	event.preventDefault();
	$('#messages').empty();
	database.ref('messages').remove();
})

