// 文本解码器
var textDecoder = new TextDecoder('utf-8');
// 从buffer中读取int
const readInt = function (buffer, start, len) {
    let result = 0
    for (let i = len - 1; i >= 0; i--) {
        result += Math.pow(256, len - i - 1) * buffer[start + i]
    }
    return result
}
/**
* blob blob数据
* call 回调 解析数据会通过回调返回数据
*/
function decode(blob, call) {
    let reader = new FileReader();
    reader.onload = function (e) {
        let buffer = new Uint8Array(e.target.result)
        let result = {}
        result.packetLen = readInt(buffer, 0, 4)
        result.headerLen = readInt(buffer, 4, 2)
        result.ver = readInt(buffer, 6, 2)
        result.op = readInt(buffer, 8, 4)
        result.seq = readInt(buffer, 12, 4)
        if (result.op == 5) {
            result.body = []
            let offset = 0;
            while (offset < buffer.length) {
                let packetLen = readInt(buffer, offset + 0, 4)
                let headerLen = 16// readInt(buffer,offset + 4,4)
                let data = buffer.slice(offset + headerLen, offset + packetLen);

                let body = "{}"
                if (result.ver == 2) {
                    //协议版本为 2 时  数据有进行压缩 通过pako.js 进行解压
                    body = textDecoder.decode(pako.inflate(data));
                } else {
                    //协议版本为 0 时  数据没有进行压缩
                    body = textDecoder.decode(data);
                }
                if (body) {
                    // 同一条消息中可能存在多条信息，用正则筛出来
                    const group = body.split(/[\x00-\x1f]+/);
                    group.forEach(item => {
                        try {
                            result.body.push(JSON.parse(item));
                        } catch (e) {
                            // 忽略非JSON字符串，通常情况下为分隔符
                        }
                    });
                }
                offset += packetLen;
            }
        }
        //回调
        call(result);
    }
    reader.readAsArrayBuffer(blob);
}

//组合认证数据包
function getCertification(json) {
    var bytes = str2bytes(json);  //字符串转bytes
    var n1 = new ArrayBuffer(bytes.length + 16)
    var i = new DataView(n1);
    i.setUint32(0, bytes.length + 16), //封包总大小
        i.setUint16(4, 16), //头部长度
        i.setUint16(6, 1), //协议版本
        i.setUint32(8, 7),  //操作码 7表示认证并加入房间
        i.setUint32(12, 1); //就1
    for (var r = 0; r < bytes.length; r++) {
        i.setUint8(16 + r, bytes[r]); //把要认证的数据添加进去
    }
    return i; //返回
}

//字符串转bytes //这个方法是从网上找的QAQ
function str2bytes(str) {
    const bytes = []
    let c
    const len = str.length
    for (let i = 0; i < len; i++) {
        c = str.charCodeAt(i)
        if (c >= 0x010000 && c <= 0x10FFFF) {
            bytes.push(((c >> 18) & 0x07) | 0xF0)
            bytes.push(((c >> 12) & 0x3F) | 0x80)
            bytes.push(((c >> 6) & 0x3F) | 0x80)
            bytes.push((c & 0x3F) | 0x80)
        } else if (c >= 0x000800 && c <= 0x00FFFF) {
            bytes.push(((c >> 12) & 0x0F) | 0xE0)
            bytes.push(((c >> 6) & 0x3F) | 0x80)
            bytes.push((c & 0x3F) | 0x80)
        } else if (c >= 0x000080 && c <= 0x0007FF) {
            bytes.push(((c >> 6) & 0x1F) | 0xC0)
            bytes.push((c & 0x3F) | 0x80)
        } else {
            bytes.push(c & 0xFF)
        }
    }
    return bytes
}