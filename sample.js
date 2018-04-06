const crawler = require('./main');

// const url = 'http://land.naver.com/article/complexInfo.nhn?rletTypeCd=A01&tradeTypeCd=&rletNo=2';
// console.log( $("[title='시/도'] option:selected").text());
// console.log( $("[title='시/군/구'] option:selected").text());
// console.log( $("[title='읍/면/동'] option:selected").text());
// console.log( $("[title='단지명'] option:selected").text());

crawler.makeRequest({
    url : 'http://land.naver.com/article/complexInfo.nhn',
    staticParams : [
        { name : 'rletTypeCd', value : 'A01'},
        { name : 'tradeTypeCd', value : ''}
    ],
    dynamicParams : [
        { name : 'rletNo', value : ['2', '3']}
    ]
});

crawler.addSelector("[title='시/도'] option:selected");
crawler.addSelector("[title='시/군/구'] option:selected");
crawler.addSelector("[title='읍/면/동'] option:selected");
crawler.addSelector("[title='단지명'] option:selected");

crawler.request(function(err, result) {
    if(err) {
        console.log(err);
    }
    console.log(result);
});