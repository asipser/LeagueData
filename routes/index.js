var express = require('express');
var router = express.Router();
var key = "3ca3e63b-f0ea-4641-bdf9-ad0171b74b30";
var throttle = require('request-promise');
var coreURI = "https://na.api.pvp.net";
var username = undefined;
var numMatches = 15;
var throttle = require('../quota.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/userSearch', function(req, res, next) {
  getSummonerID(req)
    .then(getMatchList)
    .then(getRelaventMatches)
    .then(function(data){
    res.send(data);
  });
});
module.exports = router;

function getSummonerID(req){
  username = req.query.username;
  var summonerIdOptions = {
      uri: coreURI + '/api/lol/na/v1.4/summoner/by-name/'+username,
      qs: {
          api_key: key // -> uri + '?access_token=xxxxx%20xxxxx'
      },
      headers: {
          'User-Agent': 'Request-Promise'
      },
      json: true // Automatically parses the JSON string in the response
  };
  return throttle(summonerIdOptions)  
}

function getMatchList(summoner){
      var summonerId = summoner[username]['id'];
      var matchListOptions = {
        uri: coreURI + '/api/lol/na/v2.2/matchlist/by-summoner/'+summonerId,
        qs: {
            api_key: key // -> uri + '?access_token=xxxxx%20xxxxx'
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
      };
      return throttle(matchListOptions)
}
/**
 * args: matchlist object from rito api
 * return: array of match json objects from rito api 
 */
function getRelaventMatches(matchList){
  var matchData = [];
  for(var i =0;i<numMatches;i++){
    var matchId = matchList['matches'][i]['matchId'];
    matchData.push(getMatch(matchId));
  }
  return Promise.all(matchData);

}
function getMatch(matchId){
      var matchOptions = {
        uri: coreURI + '/api/lol/na/v2.2/match/' + matchId,
        qs: {
            api_key: key // -> uri + '?access_token=xxxxx%20xxxxx'
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
      };
      return throttle(matchOptions);
}
