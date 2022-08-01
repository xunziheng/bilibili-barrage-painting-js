/**
 * 初始化一个执行类
 * @param {*} canvas 
 * @param {*} obj 
 * @returns 
 */
function run(canvas, obj) {
    obj = obj || {}
    this.canvas = canvas
    this.cvs = canvas.getContext("2d")
    this.oddBgColor = obj.oddBgColor || "#ffffff" // 奇数
    this.evenBgColor = obj.evenBgColor || "#c8c8c8" // 偶数
    this.boxSize = obj.boxSize || 30
    this.bgWidthLength = 0
    this.bgHeightLength = 0
    this.clickedArr = []
    this.start()
    return this
}
/**
 * 初始化方法：计算某个维度上像素块的数量，用canvas的长度除以每个像素块的长度；
 */
run.prototype.start = function () {
    this.bgWidthLength = parseInt(this.canvas.width / this.boxSize)
    this.bgHeightLength = parseInt(this.canvas.height / this.boxSize)
    this.drawBg()
}
/**
 * 切换选中的像素块状态
 * @param {*} o 
 * @param {*} color 
 */
run.prototype.toggleClick = function (o, color) {
    let has = {}
    has.is = true
    this.clickedArr.forEach(function (item, index) {
        if (item.x === o.x && item.y === o.y) {
            has.is = false
            has.index = index
        }
    })
    if (has.is) {
        this.clickedArr.push(o)
        this.drawBgBox(o.x * this.boxSize, o.y * this.boxSize, color)
    }
    if (!has.is) {
        this.clickedArr.splice(has.index, 1)
        let color = this.checkColor(o.x, o.y);
        this.drawBgBox(o.x * this.boxSize, o.y * this.boxSize, color)
    }
}
run.prototype.drawBg = function () {
    for (let i = 0; i < this.bgHeightLength; i++) {
        for (let j = 0; j < this.bgWidthLength; j++) {
            let color = this.checkColor(i+1, j+1);
            this.drawBgBox(j * this.boxSize, i * this.boxSize, color)
        }
    }
}
run.prototype.drawBgBox = function (x, y, color) {
    this.cvs.beginPath()
    this.cvs.fillStyle = color;
    this.cvs.fillRect(x, y, this.boxSize, this.boxSize);
    this.cvs.fill()
    this.cvs.stroke()
    this.cvs.closePath()
}
run.prototype.toggleLocation = function (x, y, color, name) {
    let o = {}
    o.x = parseInt(x - 1)
    o.y = parseInt(y - 1)
    this.toggleClick(o, color)
}
// 判断背景颜色
run.prototype.checkColor = function (x, y) {
    let color;
    // 奇奇、偶偶为oddBgColor
    if ((x%2==0 && y%2==0) || (x%2!=0 && y%2!=0)) color = this.oddBgColor;
    // 奇偶、偶奇为evenBgColor
    if ((x%2==0 && y%2!=0) || (x%2!=0 && y%2==0)) color = this.evenBgColor;
    return color;
}