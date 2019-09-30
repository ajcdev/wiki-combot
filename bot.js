var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var apiKey = 'championsAPIKey_15agGs';
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if(message.length < 4){
        return;
    }
    console.log(channelID);
    if (message.substring(0, 1) == '!' ) {
        let args = message.substring(1).split(" ");
        if(args.length < 2){
            return;
        }
        let command = args[0];
        if(command == "stats"){
            sendPlayerInfo(args, channelID);
        } else if(command == 'item') {
            sendItemInfo(args, channelID);
        }
     }
});

function sendItemInfo(args, channelID){
    let xhr = new XMLHttpRequest();
    args.shift();
    let item = args.join(" ");
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            if( xhr.status == 200){
                let jsonResponse = JSON.parse(xhr.responseText);
                if(jsonResponse.Success == false){
                    return bot.sendMessage({
                        to: channelID,
                        message: jsonResponse.Message
                    });
                }
                //console.log(jsonResponse);
                //console.log(jsonResponse.length);
                if(jsonResponse.length == 1){
                    if(jsonResponse[0].Success == false){
                        return bot.sendMessage({
                            to: channelID,
                            message: jsonResponse[0].Message
                        });
                    }

                }
                for(let index = 0; index < jsonResponse.length && index < 3; index++){
                    let infoString = getItemInfoString(jsonResponse[index])
                    bot.sendMessage({
                        to: channelID,
                        message: infoString
                    });
                }
            } else {
                return bot.sendMessage({
                    to: channelID,
                    message: 'Something went wrong with Tractors server :/'
                });
            }
        }
    }
    xhr.open("GET", "http://www.championsofmadrigal.com/WebApi/itemInfo?name=" + item  + "&apikey=" + apiKey);
    xhr.send();
}

function getItemInfoString(item){
    if(item.Success == false){
        return "mhm idk what happend";
    }
    let itemInfosString = "```cpp";
    itemInfosString += 'Item: ' + item.Name;
    itemInfosString += '\nRequires level: ' + item.RequiredLevel;
    itemInfosString += '\nRarity: ' + item.Rarity;
    itemInfosString += '\nDescription: ' + item.Description;
    itemInfosString += '\nDamage: ' + item.DamageMin + ' - ' + item.DamageMax;
    itemInfosString += '\nEffects: ' + item.DestStatsString;
    itemInfosString += '\nPenya cost: ' + item.PenyaCost;
    itemInfosString += '\n-------------------------'
    itemInfosString += "```cpp";
    return itemInfosString;
}

function sendPlayerInfo(args, channelID){
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            if( xhr.status == 200){
                let jsonResponse = JSON.parse(xhr.responseText);
                if(jsonResponse.Success == false){
                    return bot.sendMessage({
                        to: channelID,
                        message: jsonResponse.Message
                    });
                }
                let message = "```cpp";
                message += "Name: " + jsonResponse.Name;
                message += '\nClass: ' + jsonResponse.Class;
                message += '\nLevel: ' + jsonResponse.Level;
                message += '\nGuild: ';
                message += jsonResponse.Guild != null ? jsonResponse.Guild :'no guild';
                message += '\nIs Online: ' + jsonResponse.IsOnline;
                message += '\nFaction: ';
                message += "```"
                message += jsonResponse.FactionAlignment != null ? jsonResponse.FactionAlignment : 'no faction';
                return bot.sendMessage({
                    to: channelID,
                    message: message
                });
            } else {
                return bot.sendMessage({
                    to: channelID,
                    message: 'Something went wrong with Tractors server :/'
                });
            }
        }
    }
    xhr.open("GET", "http://www.championsofmadrigal.com/WebApi/GetCharInfo?name=" + args[1]  + "&apikey=" + apiKey);
    xhr.send();
}
