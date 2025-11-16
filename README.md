# Simple Web Crawler Module for Node.js

간단한 설정만으로 다수의 URL 조합을 순차·동시로 호출하고, CSS 선택자를 이용해 원하는 정보를 추출할 수 있는 Node.js 기반 크롤러입니다. jQuery AJAX 호출을 구성하듯 `request → 응답 파싱 → 콜백` 흐름을 코드 한 덩어리 안에서 선언형으로 작성할 수 있도록 설계되었습니다.

> 예제 전체 코드는 `sample.js` 참고.

## 목차
- [설치](#설치)
- [빠른 시작](#빠른-시작)
- [핵심 개념](#핵심-개념)
- [API 레퍼런스](#api-레퍼런스)
  - [`crawler.makeRequest(options)`](#crawlermakerequestoptions)
  - [`crawler.responseHandler(options)`](#crawlerresponsehandleroptions)
  - [`crawler.request(callback)`](#crawlerrequestcallback)
  - [`robotsHandler.isAllowed(userAgent-baseUrl-callback)`](#robotshandlerisalloweduseragent-baseurl-callback)
- [엔드투엔드 예제](#엔드투엔드-예제)
- [추가 팁](#추가-팁)

## 설치

```bash
npm install
```

패키지는 `request`, `cheerio`에 의존합니다. (이미 `package.json`에 정의되어 있으므로 `npm install`만 실행하면 됩니다.)

## 빠른 시작

1. 크롤링할 기본 URL과 파라미터 조합을 `crawler.makeRequest`로 선언합니다.
2. 응답 본문에서 추출할 CSS 선택자 목록을 `crawler.responseHandler`에 등록합니다.
3. `crawler.request`를 호출해 병렬 요청을 시작하고, 결과를 콜백으로 처리합니다.

## 핵심 개념

- **Static Params / Dynamic Params**  
  정적 파라미터는 모든 요청에 공통으로 붙는 쿼리 문자열입니다. 동적 파라미터는 값 배열을 받아 조합 가능한 모든 URL을 생성합니다.

- **Connection Pooling**  
  `maxConnection` 값만큼 동시에 `realRequest`가 실행되어 대기열의 URL을 처리합니다.

- **응답 파싱**  
  `cheerio`를 이용해 HTML을 파싱한 뒤, 등록된 CSS 선택자마다 `text()` 결과를 배열로 반환합니다.

## API 레퍼런스

### `crawler.makeRequest(options)`

기본 URL, HTTP 메서드, 파라미터, 연결 옵션을 설정합니다. 한 번 설정하면 이후 요청까지 상태가 유지됩니다.

| 옵션 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `url` | `string` | ✓ | 크롤링 대상 기본 URL |
| `method` | `'GET' \| 'POST' ...` | ✓ | HTTP 메서드 (`request` 모듈에 그대로 전달) |
| `staticParams` | `{name: string, value: string}[]` | ✕ | 모든 요청에 동일하게 붙는 쿼리 파라미터 |
| `dynamicParams` | `{name: string, value: (string\|number)[] }[]` | ✕ | 값 배열을 기반으로 URL 조합 생성 |
| `maxConnection` | `number` | ✕ (기본 10) | 동시에 유지할 연결 수. 이 수만큼 워커가 URL 큐를 소모합니다. |
| `timeInterval` | `number` (ms) | ✕ (기본 100) | 요청 간 지연 간격. 현재 구현은 500 ms 고정으로 동작하며 추후 개선 예정입니다. |

> ⚠️ `timeInterval` 값은 내부 변수에 저장되지만, 현 버전의 `realRequest`는 500 ms 상수로 `setTimeout`을 호출합니다. 필요 시 코드 수정이 필요합니다.

### `crawler.responseHandler(options)`

응답 HTML에서 텍스트를 추출할 CSS 선택자 목록을 등록합니다.

| 옵션 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `selectors` | `string[]` | ✓ | `cheerio`가 인식 가능한 CSS 선택자 배열. 각 선택자마다 `.text()` 결과가 결과 배열에 push 됩니다. |

선택자들은 순서대로 평가되며, 각 요청마다 `[selector1Text, selector2Text, ...]` 형태로 결과가 누적됩니다.

### `crawler.request(callback)`

URL 큐를 생성하고, `maxConnection` 수 만큼 병렬 요청을 시작합니다. 모든 URL을 처리하면 누적 결과 배열을 콜백에 전달합니다.

| 인자 | 타입 | 설명 |
| --- | --- | --- |
| `callback` | `(err: Error \| null, results: string[][]) => void` | 요청 처리 완료 또는 에러 발생 시 호출 |

콜백 시그니처:

```js
crawler.request(function (err, results) {
    if (err) {
        console.error('크롤링 실패', err);
        return;
    }
    console.log('총', results.length, '개의 응답을 수집했습니다.');
});
```

- `results`는 각 URL 요청마다 `[selector1Text, selector2Text, ...]` 구조를 갖는 2차원 배열입니다.
- 내부적으로 `request` 모듈이 직접 호출되며, HTTP 에러 발생 시 `err` 인자로 전달됩니다.

### `robotsHandler.isAllowed(userAgent, baseUrl, callback)`

`robotsHandler.js` 모듈이 제공하는 공개 함수로, 대상 사이트의 `robots.txt`를 다운로드해 주어진 `User-Agent`가 URL을 크롤링할 수 있는지 판별합니다.

| 인자 | 타입 | 설명 |
| --- | --- | --- |
| `userAgent` | `string` | 검사할 User-Agent 이름 (예: `"*"`, `"MyCrawler"`) |
| `baseUrl` | `string` | 접근하려는 전체 URL |
| `callback` | `(allowed: boolean) => void` | `robots.txt` 규칙 기반 허용 여부 |

사용 예시:

```js
const robots = require('./robotsHandler');

robots.isAllowed('*', 'https://www.example.com/news', function (allowed) {
    if (!allowed) {
        console.log('robots.txt가 요청을 차단했습니다.');
        return;
    }
    // 안전하게 crawler.request 실행
});
```

> 현재 구현은 `allow`/`disallow` 세부 판정을 주석 처리한 상태이며, 기본적인 룰 파싱 로직(`ruleMaker`)만 활성화되어 있습니다. 필요 시 주석을 해제하거나 로직을 확장하세요.

## 엔드투엔드 예제

`sample.js`는 대규모 `danjiId` 목록을 대상으로 Daum 부동산 정보를 가져오는 예제입니다. 요약하면 다음과 같은 흐름입니다.

```js
const crawler = require('./main');

crawler.makeRequest({
    url: 'http://realestate.daum.net/iframe/maemul/DanjiInfo.daum',
    method: 'GET',
    staticParams: [{ name: 'tabName', value: 'info' }],
    dynamicParams: [{ name: 'danjiId', value: Array.from({ length: 1000 }, (_, i) => i + 1) }],
    maxConnection: 10,
    timeInterval: 500
});

crawler.responseHandler({
    selectors: [
        '#subTabDanji > div.tab_menu.clearfix > h3',
        '#descAddr'
    ]
});

crawler.request((err, result) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(result);
});
```

## 추가 팁

- **에러 처리**: `request` 모듈의 콜백에서 에러가 발생하면 즉시 `resultCallback(err, null)`이 호출됩니다. 필요하다면 에러만 별도 배열에 모아 재시도 로직을 추가하세요.
- **속도 조절**: 대상을 과도하게 부하시키지 않도록 `maxConnection`과 `setTimeout` 지연(현재 500 ms)을 적절히 조정하세요.
- **확장**: CSS 선택자 대신 속성 값을 추출해야 한다면 `responseHandler` 내부를 수정해 `$(selector).attr('href')`와 같은 맞춤 파싱을 수행할 수 있습니다.
