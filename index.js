var timing = performance.timing||{};
//所有图片
var entries = performance.getEntries();

var timings={
    //DNS查询耗时
    dnsTimer : timing.domainLookupEnd - timing.domainLookupStart + "ms",
    //TCP链接耗时
    tcpTimer : timing.connectEnd - timing.connectStart + "ms",
    //request请求耗时
    requestTimer : timing.responseEnd - timing.responseStart + "ms",
    //解析dom树耗时
    domTimer : timing.domComplete - timing.domInteractive + "ms",
    //白屏时间
    pageEmptyTimer : timing.responseStart - timing.navigationStart + "ms",
    //用户可操作时间
    domReadyTimer : timing.domContentLoadedEventEnd - timing.navigationStart + "ms",
    //onload时间
    onloadTimer : timing.loadEventEnd - timing.navigationStart + "ms",
    //图片加载完成
    lastImg:_.max(_.map(entries,function(entry){
        return entry.duration
    })),
    //分辨率
    width:window.screen.width, 
    height:window.screen.height
}


var _xhr = function(req) {
    var ajax={};
    req.addEventListener('readystatechange', function() {
        if(this.readyState == 4) {
            ajax.end = Date.now();
            if ((req.status >= 200 && req.status < 300) || req.status == 304 ) {
                //简单的中文计算
                ajax.endBytes = req.responseText.length * 2 /(1024 * 1024) +"kb";
            }else {//请求失败
                ajax.endBytes = 0;
            }
            ajax.interval = ajax.end - ajax.start + "ms";
            console.log(ajax)
        }
    }, false);
    var _open = req.open;
    req.open = function(type, url, async) {
        ajax.type = type;
        ajax.url = url;
        return _open.apply(req, arguments);
    };
    
    var _send = req.send;
    req.send = function(data) {
        ajax.start = Date.now();
        var bytes = 0;//发送数据大小
        if(data) {
            ajax.startBytes = JSON.stringify(data).length * 2 /(1024 * 1024) +"kb";
        }else{
            ajax.startBytes = "0kb";
        }
        return _send.apply(req, arguments);
    };
};

var _XMLHttpRequest = window.XMLHttpRequest;
//拦截xhr
window.XMLHttpRequest = function(flags) {
    var req;
    // 调用原生的XMLHttpRequest
    req = new _XMLHttpRequest(flags);
    _xhr(req);
    return req;
};


window.onerror = function(msg, url, line, col, error) {
    var newMsg = msg;
    if (error && error.stack) {
        var stack = error.stack.replace(/\n/gi, "").split(/\bat\b/).slice(0, 9).join("@").replace(/\?[^:]+/gi, "");
        var msg = error.toString();
        if (stack.indexOf(msg) < 0) {
            stack = msg + "@" + stack;
        }
        newMsg = stack;
    }
    console.log({msg:newMsg, target:url, rowNum:line, colNum:col})
};