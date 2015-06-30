var async = require("async");
var cheerio = require("cheerio");
var fs = require("fs");
var http = require("http");
var zlib = require("zlib");
var striptags = require('striptags');

var tasks=[
	function(){Start("6-55results")},
	function(){Start("6-49results")},
	function(){Start("6-45results")},
	function(){Start("6-42results")},
	function(){Start("6-dresults")},
	function(){Start("4-dresults")},
	function(){Start("3-dresults")},
	function(){Start("2-dresults")},
];

async.parallel(tasks);

function Start(path){
	var options = {
		host:"pcso-lotto-results-and-statistics.webnatin.com",
		path:"/"+path+".asp",
		headers:{
			'Accept-Encoding':'gzip'
		}
	}
	
	var gunzip = zlib.createGunzip();
	var resStr = "";
	http.get(options,function(res){
		res.pipe(gunzip);

		gunzip.on("data",function(data){
			resStr += data;
		});

		gunzip.on("end",function(){
			var filestream = fs.createWriteStream("results/"+path+".csv").on("open",function(){
				$ = cheerio.load(resStr);
				var html = $("table").html();
				html = html.replace(/\<\/td\>/ig,",")
						.replace(/<\/tr\>/ig,"\n")
						.replace(/\&\#xA0\;/ig,"")
						.replace(/(<([^>]+)>)/ig,"");
				filestream.write(html);
				filestream.end();
			});
		});
	});
}
