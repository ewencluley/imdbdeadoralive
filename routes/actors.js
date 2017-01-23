var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

var router = express.Router();

/* Gets a list of actors for a given IMDB id. */
router.get('/', function(req, res, next) {
  var imdbId = req.query.imdbId;
  request.get("http://www.imdb.com/title/" + imdbId + "/fullcredits", function (error, response, body) {
      $ = cheerio.load(body);
      var actors = [];
      $('.cast_list .itemprop a').map(function(i, actorHtml) {
          var url = actorHtml.attribs.href;
          var actorIdRx = /\/name\/([A-Za-z0-9]+)\/?/g;
          var id = actorIdRx.exec(url)[1];
          var name;
          actorHtml.children.forEach(function(item, index){
              if(item.name == "span"){
                  name = item.children[0].data;
              }
          });
          actors.push({id: id, name: name});
      });
      res.render('actors', { actors: actors });
  });
});

/* Gets the current dead or alive status for a given actor */
router.get('/:actorId', function(req, res, next) {
   request.get("http://www.imdb.com/name/"+req.params.actorId, function(error, response, body){
       if(!error && response.statusCode == 200){
           if(body.indexOf('id="name-death-info"')> -1){
               res.send({id:req.params.actorId, alive:false});
           }else{
               res.send({id:req.params.actorId, alive:true});
           }
       }

    });
});

module.exports = router;
