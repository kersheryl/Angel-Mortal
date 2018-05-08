var TelegramBot = require('node-telegram-bot-api');
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db2"

});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


// telegram 
var token = "511494675:AAEdGVasWJW-NAT8fAPGgjxfqJPTFOBysXA";
var opt = {polling: true}; //check new updates
var bot = new TelegramBot(token, opt);


// bot.on('message', function (msg) {
// 	console.log(msg);
// 	//get id
// 	var id = msg.chat.id;

// 	//gtet text
// 	var echo = msg.text;

// 	//send text
// 	bot.sendMessage(id, echo);
// });

// Matches /echo [whatever]
// msg - received msg from telegram
// match - 
// bot.onText(/\/createlist/, function (msg, match) {
//   var fromId = msg.from.id;
//   var resp = match[1]; //capture whatever
//   bot.sendMessage("183181262", "ehllo");
// });

// bot.onText(/\/start/, function (msg, match) {
//   var fromId = msg.from.id;
//   bot.sendMessage(fromId, "The game has started");
// });


bot.onText(/\/creategame/, function (msg, match) {
	var fromId = msg.from.id;
	var playername = msg.from.first_name;
	var gamedate = msg.date;

	if (msg.text=="/creategame") {
		bot.sendMessage(fromId, "Please use the correct format (eg. /creategame <gameid>)");	

	}
	else {
	var gameID = msg.text.split(" ")[1];
	var sql = "SELECT 1 FROM " + gameID + " LIMIT 1;";
	con.query(sql, function(err, result) {
		if (err) {
			console.log("Table does not exist");
			var sql = "CREATE TABLE " + gameID + " (id VARCHAR(255), fname VARCHAR(255), angel VARCHAR(255), mortal VARCHAR(255), date VARCHAR(255));";
			var inputMyself = "INSERT INTO " + gameID + " (id, fname, date) VALUES " + "(" + fromId + ", '" + playername + "'," + gamedate + ");";
		    con.query(sql, function (err, result) {
		    if (err) throw err;
		    console.log("Table created");
		  	});
		  	con.query(inputMyself, function (err, result) {
		  	if (err) throw err;
		  	console.log("1 row added"); });
		  	bot.sendMessage(fromId, "Game is created! Invite your friends to join with your gameid " + gameID + ". When all players have joined, use the command /startgame " + gameID + " to start Mortal assignment");
		  // }
			}
		else {
			bot.sendMessage(fromId, "GameID exists. Please call the command /creategame again with another gameid.");
		}

	});
	// else {
	// var sql = "SHOW TABLES FROM mydb;";
 //  	var allTables = con.query(sql, function (err, result) {
 //  	if (err) throw err;
 //  	// console.log(allTables); 
 //  });
	// if (gameID in allTables) { /*CHECKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK*/
	// 	bot.sendMessage(fromId, "This gameID is taken. Call the command with a different gameID");
	// }
	// else {
	
	// 
}
});

bot.onText(/\/joingame/, function (msg, match) {
	var fromId = msg.from.id;
	var playername = msg.chat.first_name;
	var gamedate = msg.date;

	if (msg.text=="/joingame") {
		bot.sendMessage(fromId, "Please use the correct format (eg. /joingame <gameid>)");	
	}
	else {
		var gameID = msg.text.split(" ")[1];
		var sql = "SELECT 1 FROM " + gameID + " LIMIT 1;";
		con.query(sql, function(err, result) {		

		if (err) {
			console.log("Table does not exist");
		  	bot.sendMessage(fromId, "GameID does not exist. Please call the command /creategame again with a gameid.");
		}
	  	else { 		
	  		var sql = "SELECT * FROM " + gameID + " WHERE id=" + fromId+ ";";
	  		con.query(sql, function(err, result) {
	  		console.log(result);	
	  			if (result.length==0) {
		var inputPlayer = "INSERT INTO " + gameID + " (id, fname, date) VALUES " + "(" + fromId + ", '" + playername + "'," + gamedate + ");";
	  	con.query(inputPlayer, function (err, result) {
	  	if (err) throw err;
	  	console.log("1 row added"); });
	  	bot.sendMessage(fromId, "You have joined the game " + gameID + ". When all players have joined, use the command /startgame " + gameID + " to start Mortal assignment");
	  }
	  else {
	  	bot.sendMessage(fromId, "You are already in the game " + gameID + ". When all players have joined, use the command /startgame " + gameID + " to start Mortal assignment");
	  }
});
	}
})
	}
});

// bot.onText(/\/setdeadline/, function (msg, match) {
// 	var fromId = msg.from.id;

// 	bot.sendMessage(fromId, "Choose a deadline", {"reply_markup": {
//     "keyboard": [["5 days"], ["7 days"], ["10 days"]]  }
// 	});
// 	//close the choices

//    //Receive an input
//    // for each option, endgame command will be played at the end of the date
//    bot.on('message', (msg) => {
//    	if (msg.text.toString()=="5 days") { 
//    	    //set the duration to five days
//    	}
//    	if (msg.text.toString()=="7 days") { 
//     //set the duration to seven days 
// 	}
// 	if (msg.text.toString()=="10 days") { 
//    	 //set the duration to ten days
// 	}
// 	});
//    //Set the duration of the game in the back end
// });

// result is for all angels to receive their mortal's userid
bot.onText(/\/startgame/, function (msg, match) {

	function contains(name, array){
		for (i = 0; i < array.length; i++) {
			if (array[i]===name) {
				return true;
			}
	  }
	  return false;
	}

	var allPlayers = [];
	var mortalsAssigned = [];
	var fromId = msg.from.id;

	if (msg.text=="/startgame") {
		bot.sendMessage(fromId, "Please use the correct format (eg. /startgame <gameid>)");	

	}

	else {
	var gameID = msg.text.split(" ")[1];

	//This part queries all players in the database and creates an array with the players id
	var get_player_query = "SELECT id FROM " + gameID + ";";
	con.query(get_player_query, function (err, result, fields) {
	if (err) throw err;
	for (var i in result) {
		allPlayers.push(result[i].id);
	} 		  
		console.log(allPlayers);
		
	//This part does the random assignment of the mortals for each player
	var cornercase=false;
	for (i = 0; i < allPlayers.length; i++) {
	if (i===allPlayers.length-1 && !(contains(allPlayers[i], mortalsAssigned))) {
				var hold = mortalsAssigned[allPlayers.length-2];
				mortalsAssigned[mortalsAssigned.length-2]=(allPlayers[i]);
				mortalsAssigned.push(hold);
				cornercase=true; 
				break; 
		} 
  
   
	if (cornercase==false)  {
  	var randInt = Math.floor(Math.random()*allPlayers.length);    
  	while (randInt===i || contains(allPlayers[randInt], mortalsAssigned)) {
		randInt = Math.floor(Math.random()*allPlayers.length);		 
	}
	mortalsAssigned.push(allPlayers[randInt]);
	} 
	}
	console.log(mortalsAssigned);
	// }

	//This part updates the database for each person's angel and mortal.
	for (i = 0; i < allPlayers.length; i++) {
		var insertion_query = "UPDATE " + gameID + " SET mortal = " + mortalsAssigned[i] + " WHERE id = " + allPlayers[i]+ ";";
		con.query(insertion_query, function(err, result) {
  	if (err) throw err; })
	}

	for (i = 0; i < mortalsAssigned.length; i++) {
		var insertion_query = "UPDATE " + gameID + " SET angel = " + allPlayers[i] + " WHERE id = " + mortalsAssigned[i]+ ";";
		con.query(insertion_query, function(err, result) {
  	if (err) throw err; })
	}
	console.log(allPlayers);


	for (i = 0; i < allPlayers.length; i++) {
		var currentPlayerId = allPlayers[i];
		console.log("test" + currentPlayerId);

		var getmortal = "SELECT * FROM " + gameID + " WHERE id = " + currentPlayerId + ";"; 
	 	con.query(getmortal, function (err, result, fields) {
	          if (err) throw err;
	              console.log(result);
	  	var playerMortal = result[0].mortal;
	  	var player = result[0].id;
	  	var getmortalName = "SELECT * FROM " + gameID + " WHERE id = " + playerMortal + ";"; 
	 	con.query(getmortalName, function (err, result, fields) {
	          if (err) throw err;
	              console.log(result);
	  	var mortalName = result[0].fname;
	  	// console.log("test2" + currentPlayerId);

	  	bot.sendMessage(player, "The game has started, your mortal is " + mortalName + " . Use the commands /messagemortal <gameid> <message> or /messageangel <gameid> <message> to communicate with your angel and mortals!");	
		
	 });
	 	}); 
}

});
}
});

// send message to mortal
bot.onText(/\/messagemortal/, function (msg, match) {
 var fromId = msg.from.id;
 //var playername = msg.chat.first_name;
 //var gamedate = msg.date;
 if (msg.text=="/messagemortal") {
		bot.sendMessage(fromId, "Please use the correct format (eg. /messagemortal <gameid> <message>)");	

}
else {
	var gameID = msg.text.split(" ")[1];
		var sql = "SELECT 1 FROM " + gameID + " LIMIT 1;";
		con.query(sql, function(err, result) {		

		if (err) {
			console.log("Table does not exist");
		  	bot.sendMessage(fromId, "GameID does not exist. Please call the command /creategame again with a gameid.");
		}
		else {
		 var message = msg.text.split(" ").slice(2).join(" ");
		 console.log(message);
		 var getmortal = "SELECT * FROM " + gameID + " WHERE id = " + fromId + ";"; 
		 con.query(getmortal, function (err, result, fields) {
		          if (err) throw err;
		              console.log(result);
		  var playerMortal = result[0].mortal;
		  // console.log(playerMortal);
		  bot.sendMessage(playerMortal, "With love from Angel of gameID " + gameID + ": \n" + message);
		 // // 
		 })
		}
})
	}
});

bot.onText(/\/messageangel/, function (msg, match) {
 var fromId = msg.from.id;
 //var playername = msg.chat.first_name;
 //var gamedate = msg.date;

	if (msg.text=="/messageangel") {
			bot.sendMessage(fromId, "Please use the correct format (eg. /messageangel <gameid> <message>)");	

	}
	else {
	var gameID = msg.text.split(" ")[1];
		var sql = "SELECT 1 FROM " + gameID + " LIMIT 1;";
		con.query(sql, function(err, result) {		

		if (err) {
			console.log("Table does not exist");
		  	bot.sendMessage(fromId, "GameID does not exist. Please call the command /creategame again with a gameid.");
		}
		else {

		 var message = msg.text.split(" ").slice(2).join(" ");
		 console.log(message);
		 var getmortal = "SELECT * FROM " + gameID + " WHERE id = " + fromId + ";"; 
		 con.query(getmortal, function (err, result, fields) {
		          if (err) throw err;
		              console.log(result);
		  var playerAngel = result[0].angel;
		  // console.log(playerMortal);
		  bot.sendMessage(playerAngel, "With love from Mortal of gameID " + gameID + ": \n" + message);
		 });
		}
});
	}
});



bot.onText(/\/endgame/, function (msg, match) {
	var fromId = msg.from.id;
	if (msg.text=="/endgame") {
			bot.sendMessage(fromId, "Please use the correct format (eg. /endgame <gameid>)");	

	}
	else {
 	var gameID = msg.text.split(" ")[1];
	var reveal = [];
 	var allPlayers = [];
	//This part queries all players in the database and creates an array with the players id
	var get_player_query = "SELECT id FROM " + gameID + ";";
	con.query(get_player_query, function (err, result, fields) {
	if (err) throw err;
	for (var x in result) {
		allPlayers.push(result[x].id);
	} 		  
	console.log(allPlayers);

 	for (var y in allPlayers) {
		var currentPlayerId = allPlayers[y];
		var getangel = "SELECT * FROM " + gameID + " WHERE id = " + currentPlayerId + ";"; 
		 	con.query(getangel, function (err, result, fields) {
		          if (err) throw err;
		       //       i-=1;
		        console.log(y+"test1");
	  	var playerAngel = result[0].angel;
		var playerName = result[0].fname;
	    var getangelName = "SELECT * FROM " + gameID + " WHERE id = " + playerAngel + ";"; 
		 	con.query(getangelName, function (err, result, fields) {
		          if (err) throw err;
		          //i-=1;

	  	var angelName = result[0].fname;
	  	reveal.push(playerName + "'s angel is " + angelName);
	  	if (y==allPlayers.length-1) {
	  		console.log("y is" +y);
	  		var fullAnswer = reveal.join(".\n") + ".";
	  		 for (var j in allPlayers) {
	  		 	console.log("j is " + j);
	  		 	console.log(fullAnswer);
				var currentPlayerId = allPlayers[j];
				bot.sendMessage(allPlayers[j], fullAnswer);
	  		}
	  	}

	  		
	  	 });
 });

}
	 });
}
});