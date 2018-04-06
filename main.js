const request = require('request');
const cheerio = require('cheerio');

var baseUrl;
var sParams = [];
var dParams = [];

var cssSelector = [];

exports.makeRequest = function(options) {
    baseUrl = options.url;
    options.staticParams.forEach(staticParam => {
        sParams.push(staticParam);
    });
    options.dynamicParams.forEach(dynamicParam => {
        dParams.push(dynamicParam);
    });
}

exports.addSelector = function(selector) {
    cssSelector.push(selector);
}

exports.request = function(callback) {
    var url = baseUrl + '?';
    sParams.forEach(sParam => {
        url += sParam.name + '=' + sParam.value + '&';
    });

    var result_final = [];
    var count_result = 0;
    var final_count = 0;
    dParams.forEach(dParam => {
        final_count += dParam.value.length;
    });

    // temporary function for result handling, should be modifed after studying about async procedure of nodejs
    function temp(result) {
        result_final.push(result);
        count_result++;
        if(count_result >= final_count) {
            callback(null, result_final);
        }
    }

    dParams.forEach(dParam => {
        dParam.value.forEach(dParamValue => {
            var final_url = url + dParam.name + '=' + dParamValue;
            request({
                uri: final_url,
                method: 'GET',
                headers: {
                     'Accept-Charset': 'utf-8'
                }
            }, function(err, res, body){
                if(err) {
                    callback(err, null);
                }
                const $ = cheerio.load(body, {
                    decodeEntities: false
                });
        
                var result = [];
                cssSelector.forEach(element => {
                    result.push($(element).text());
                });
     
                temp(result);
            }); 
        });
    });
}