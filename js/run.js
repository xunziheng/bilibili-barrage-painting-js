/**
 * 初始化一个执行类
 * @param {*} canvas 
 * @param {*} obj 
 * @returns 
 */
function run(layer, obj) {
    obj = obj || {}
    this.layer = layer
    this.oddBgColor = obj.oddBgColor || "#ffffff" // 奇数
    this.evenBgColor = obj.evenBgColor || "#c8c8c8" // 偶数
    this.boxSize = obj.boxSize || 30
    this.bgWidth = obj.bgWidth || 0
    this.bgHeight = obj.bgHeight || 0
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
    this.bgWidthLength = parseInt(this.bgWidth / this.boxSize)
    this.bgHeightLength = parseInt(this.bgHeight / this.boxSize)
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
    let rect = new Konva.Rect({
        x: x,
        y: y,
        width: this.boxSize,
        height: this.boxSize,
        fill: color
    })
    this.layer.add(rect)
}
run.prototype.toggleLocation = function (x, y, color, name) {
    let o = {}
    o.x = parseInt(x - 1)
    o.y = parseInt(y - 1)
    o.name = name;
    this.toggleClick(o, color)
    this.handleClick(o, color)
}
run.prototype.handleClick = function (o, color) {
    const {x, y, name} = o;
    // 操作反馈
    const y_top = y*this.boxSize-this.boxSize, y_bottom = y*this.boxSize+this.boxSize
    let tip = new Konva.Text({
        x: x * this.boxSize,
        y: y_top<0 ? y_bottom : y_top,
        text: name,
        fontSize: 30,
        fontFamily: 'pixel',
        fill: color,
        align: 'center'
    });
    this.layer.add(tip);
    // 特效动画展示后移除
    tip.to({
        y: (y_top-30)<0 ? y_bottom+30 : y_top-30,
        duration: .5,
        onFinish: function () {
            tip.remove();
        }
    })
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