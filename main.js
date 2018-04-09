const request = require('request');
const cheerio = require('cheerio');

var baseUrl;
var method;
var sParams = [];
var dParams = [];

var connectionCount = 0;
var maxConnection = 10;
var timeInterval = 1;

var cssSelector = [];

exports.makeRequest = function(options) {
    baseUrl = options.url;
    method = options.method;
    options.staticParams.forEach(staticParam => {
        sParams.push(staticParam);
    });
    options.dynamicParams.forEach(dynamicParam => {
        dParams.push(dynamicParam);
    });
    maxConnection = options.maxConnection;
    timeInterval = options.timeInterval;
}

exports.responseHandler = function(options) {
    options.selectors.forEach(selector => {
        cssSelector.push(selector);
    });
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
    function resultCallback(result) {
        result_final.push(result);
        count_result++;
        if(count_result >= final_count) {
            callback(null, result_final);
        }
    }

    dParams.forEach(dParam => {
        dParam.value.forEach(dParamValue => {
            var final_url = url + dParam.name + '=' + dParamValue;

            var requestAttempt = setInterval(() => {
                if(connectionCount < maxConnection) {
                    console.log(final_url, "connected");
                    realRequest(final_url, resultCallback);
                    clearInterval(requestAttempt);
                }
            }, 1000 * timeInterval);
        });
    });
}

function realRequest(url, resultCallback) {
    connectionCount++;
    request({
        uri: url,
        method: method,
        headers: {
             'Accept-Charset': 'utf-8'
        }
    }, function(err, res, body){
        connectionCount--;
        if(err) {
            resultCallback(err, null);
        }
        const $ = cheerio.load(body, {
            decodeEntities: false
        });

        var result = [];
        cssSelector.forEach(element => {
            result.push($(element).text());
        });
        resultCallback(result);
    });
}