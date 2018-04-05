const request = require('request');
const cheerio = require('cheerio');

var baseUrl;
var params = [];

var dynamicParamName;
var dynamicParamValue = [];

var cssSelector = [];

var timeInterval = 10;
var noThread = 1;

exports.setUrl = function(url) {
    baseUrl = url;
}

exports.addUrlParam = function(name, value) {
    var param = {
        name : name,
        value : value
    }
    params.push(param);
}

exports.setUrlDynamicParam = function(name, valueArray) {
    dynamicParamName = name;
    dynamicParamValue = valueArray;
}

exports.setTimeInterval = function(interval) {
    timeInterval = interval;
}

exports.addSelector = function(selector) {
    cssSelector.push(selector);
}

exports.request = function(callback) {
    var url = baseUrl + '?';
    params.forEach(element => {
        url += element.name + '=' + element.value + '&';
    });

    var result_final = [];
    var count_result = 0;

    // temporary function for result handling, should be modifed after studying about async procedure of nodejs
    function temp(result) {
        result_final.push(result);
        count_result++;
        if(count_result >= dynamicParamValue.length) {
            callback(null, result_final);
        }
    }

    dynamicParamValue.forEach(element => {
        var final_url = url + dynamicParamName + '=' + element;
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
}