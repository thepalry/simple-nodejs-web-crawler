const url = require('url');
const request = require('request');
const userAgentRuleBase = "user-agent";
const allowRuleBase = "allow";
const disallowRuleBase = "disallow";
const comment = "#";


isAllowed = function(userAgent, baseUrl, callback) {
    var parsedUrl = url.parse(baseUrl);
    var robots = url.resolve(parsedUrl.href, "/robots.txt");
    request({
        uri: robots,
        method: 'GET',
        headers: {
             'Accept-Charset': 'utf-8'
        }
    }, function(err, res, body){
        if(err) {
            throw err;
        }
        if(res.statusCode == 404) { // if robots.txt not exists
            callback(true);
            return;
        } else if(res.statusCode != 200) { // if response is not ok
            throw Error("Bad response on robots");
        }
        var rules = ruleMaker(body);
        var rule = rules.find(function(element) {
            return element.agent == userAgent;
        });

        if(rule == null) {
            rules.find(function(element) {
                return element.agent == '*';
            });
            if(rule == null) {
                callback(true);
                return;
            }
        }
        /*
        console.log(rule);
        var result = false;
        rule.disallow.forEach(disallow => {
            var disallowUrl = url.resolve(parsedUrl.href, disallow);
            if(baseUrl.indexOf(disallowUrl) >= 0) {
                callback(false);
                return;
            }
        });

        rule.allow.forEach(allow => {
            var allowUrl = url.resolve(parsedUrl.href, allow);
            if(baseUrl.match(allowUrl) >= 0) {
                callback(true);
                return;
            }
        });
        // tree를 이용해서 처리하기

        callback(baseUrl, false);*/
    });
}

function temp(baseUrl, result) {
    console.log(baseUrl, result);
}
isAllowed("*", 'https://www.naver.com/?abc=2123', temp);
isAllowed("*", 'https://www.naver.com/', temp);
//isAllowed("*", 'https://ko.wikipedia.org/wiki/%EC%9B%B9_%ED%81%AC%EB%A1%A4%EB%9F%AC', temp);
//isAllowed("IsraBot", 'https://ko.wikipedia.org/wiki/%EC%9B%B9_%ED%81%AC%EB%A1%A4%EB%9F%AC', temp);
//isAllowed("Orthogaffe", 'https://ko.wikipedia.org/wiki/%EC%9B%B9_%ED%81%AC%EB%A1%A4%EB%9F%AC', temp);
//isAllowed("*", 'http://www.dogdrip.net/robots.txt', temp); // no robots.txt

function ruleMaker(robotsBody) {
    var rules = [];
    var rule = null;
    var lines = robotsBody.split('\n');
    for(var i = 0;i<lines.length;i++) {
        var attrs = lines[i].split(' ');
        for(var j=0;j<attrs.length;j++) {
            var attr = attrs[j].toLowerCase();
            if(attr.indexOf(userAgentRuleBase) >= 0) {
                if(rule != null) {
                    rules.push(rule);
                }
                rule = {agent : null, allow : [], disallow : []};
                rule.agent = attrs[++j];
            } else if(attr.indexOf(disallowRuleBase)>= 0) {
                var target = attrs[++j];
                while(target == ':') {
                    target = attrs[++j];
                }
                rule.disallow.push(target);
            } else if(attr.indexOf(allowRuleBase) >= 0) {
                var target = attrs[++j];
                while(target == ':') {
                    target = attrs[++j];
                }
                rule.allow.push(target);
            } else if(attr.indexOf(comment) >= 0) {
                break;
            }
        }
    }
    if(rule != null) {
        rules.push(rule);
        rule = null;
    }
    return rules;
}