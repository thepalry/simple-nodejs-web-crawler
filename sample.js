const crawler = require('./main');

var rletNoArray = [];
for(var i=1;i<=1000;i++) {
    rletNoArray.push(i);
}

crawler.makeRequest({
    url : 'http://realestate.daum.net/iframe/maemul/DanjiInfo.daum',
    method : 'GET',
    staticParams : [
        { name : 'tabName', value : 'info'}
    ],
    dynamicParams : [
        { name : 'danjiId', value : rletNoArray}
    ],
    maxConnection : 10,
    timeInterval : 500
});

crawler.responseHandler({
    selectors : [
        "#subTabDanji > div.tab_menu.clearfix > h3",
        "#descAddr"
    ]
});

crawler.request(function(err, result) {
    if(err) {
        console.log(err);
    }
    console.log(result);
});