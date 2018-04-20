# Simple Web crawler module for nodejs.
## 간단 node 웹 크롤러

목표는 web client side에서 jQuery ajax 요청(https://opentutorials.org/course/1375/6851) 같이

하나의 요청 함수 구문을 작성하여 특정 웹 사이트의 특정 정보들을 json형태로 받거나, 지정한 위치(db, file)에 저장

예제 코드 : sample.js

## example
/`
crawler.makeRequest({                                   // 크롤링 할 대상 페이지 설정
    url : url,                                          // target url
    method : 'GET',                                     // http method
    staticParams : [                                    // static url parameter
        { name : 'type', value : 'test'}
    ],
    dynamicParams : [                                   // dynamic url parameter (array)
        { name : 'id', value : [1, 2, 3, 4, 5]}
    ],
    maxConnection : 10,                                 // 전체 connection 수 및 매 커넥션 별 요청 주기
    timeInterval : 500
});

crawler.responseHandler({                               // 받아온 페이지의 내용 중 정보 선택자(jQuery 선택자)
    selectors : [
        "#id > name",
        "#value"
    ]
});

crawler.request(function(err, result) {                 // 요청 및 결과 콜백
    if(err) {
        console.log(err);
    }
    console.log(result);
});
/`