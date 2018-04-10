const request = require('request');
const cheerio = require('cheerio');

var baseUrl;
var method;
var sParams = [];
var dParams = [];

var maxConnection = 10;
var timeInterval = 100;

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
    var final_count = 1;
    dParams.forEach(dParam => {
        final_count *= dParam.value.length;
    });

    // dParam이 여럿인 경우 핸들링 해야함
    var finalUrls = [];
    dParams.forEach(dParam => {
        dParam.value.forEach(dParamValue => {
            finalUrls.push(url + dParam.name + '=' + dParamValue);
        });
    });

    function resultCallback(result) {
        result_final.push(result);
        count_result++;
        if(count_result >= final_count) {
            callback(null, result_final);
        }
    }

    for(var i=0;i<maxConnection;i++) {
        realRequest(finalUrls, resultCallback);
    }
}

function realRequest(urls, resultCallback) {
    if(urls.length <= 0) {
        return;
    }
    var url = urls.pop();
    console.log(url , " connection attempt");
    request({
        uri: url,
        method: method,
        headers: {
             'Accept-Charset': 'utf-8'
        }
    }, function(err, res, body){
        if(err) {
            resultCallback(err, null);
        }
        const $ = cheerio.load(body, {decodeEntities: false});

        var result = [];
        cssSelector.forEach(element => {
            result.push($(element).text());
        });
        resultCallback(result);
        setTimeout(realRequest, 500, urls, resultCallback);
    });
}