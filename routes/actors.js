var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

var router = express.Router();

/* Gets a list of actors for a given IMDB id. */
router.get('/', function(req, res, next) {
  var imdbId = req.query.imdbId;
  request.get("http://www.imdb.com/title/" + imdbId + "/fullcredits", function (error, response, body) {
      $ = cheerio.load(body);
      var title = {};
      var actors = [];
      if($('.subpage_title_block div h3 a')[0] &&
            $('.subpage_title_block div h3 a')[0].children[0].data){
          title.name = $('.subpage_title_block div h3 a')[0].children[0].data;
      }
      $('.cast_list tr').map(function(i, actorRow) {
          if(i > 0){
              var url, name, imgSrc, character, id;
              var actorHtml = cheerio.load(actorRow);
              var actorImg = actorHtml('td.primary_photo img')[0];
              if(actorImg && actorImg.attribs.src){
                  imgSrc = actorImg.attribs.src;
              }
              var characterDetails = actorHtml('td.character div')[0];
              if(characterDetails &&
                  characterDetails.children &&
                  characterDetails.children[1] &&
                  characterDetails.children[1].children &&
                  characterDetails.children[1].children[0] &&
                  characterDetails.children[1].children[0].data){
                        character = characterDetails.children[1].children[0].data;
              }else if( characterDetails &&
                        characterDetails.children &&
                        characterDetails.children[0] &&
                        characterDetails.children[0].data){
                  character = characterDetails.children[0].data;
              }

              var actorDetails = actorHtml('td.itemprop a')[0];
              if(actorDetails && actorDetails.attribs.href){
                  url = actorDetails.attribs.href;
                  var actorIdRx = /\/name\/([A-Za-z0-9]+)\/?/g;
                  id = actorIdRx.exec(url)[1];
                  actorDetails.children.forEach(function(item, index){
                      if(item.name == "span"){
                          name = item.children[0].data;
                      }
                  });
                  actors.push({id: id, name: name, image: imgSrc, character: character});
              }
          }
      });
      title.actors = actors;
      res.render('actors', title);
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
