require("./simpleImageLabel.css");

function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "default", () => $5bbdaa7df4002674$export$2e2bcd8739ae039);
"use strict";
function $4f8e5fb2dc7a6f8f$export$b7d58db314e0ac27(obj) {
    let objClone = Array.isArray(obj) ? [] : {};
    if (obj && typeof obj === "object") {
        for(let key in obj)if (obj.hasOwnProperty(key)) {
            obj[key] && typeof obj[key];
            objClone[key] = obj[key];
        }
    }
    return objClone;
}
function $4f8e5fb2dc7a6f8f$export$31b40729666a4ae0() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for(var i = 0; i < 36; i++)s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[8] = s[13] = s[18] = s[23] = "-";
    var uuid = s.join("");
    return uuid;
}
function $4f8e5fb2dc7a6f8f$export$248d38f6296296c5(obj1, obj2) {
    if (typeof obj1 !== "object" || typeof obj2 !== "object") return obj1 === obj2;
    for(let key in obj1)if (obj1.hasOwnProperty(key)) {
        if (obj1[key] !== obj2[key]) return false;
    }
    return true;
}
function $4f8e5fb2dc7a6f8f$export$526bad2e66ad9dff(str) {
    if (str.indexOf("%") > -1) return +(str.replace("%", "") / 100);
    if (str.indexOf("px") > -1) return +(str.replace("px", "") / 100);
}
function $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782(num) {
    return num * 100 + "%";
}
function $4f8e5fb2dc7a6f8f$export$2176b0e68c10508f(imgUrl) {
    return new Promise((resolve, reject)=>{
        const labelImage = new Image();
        labelImage.src = imgUrl;
        labelImage.onload = ()=>{
            resolve({
                width: labelImage.width,
                height: labelImage.height
            });
        };
    });
}



"use strict";
class $5bbdaa7df4002674$var$SimpleImageLabel {
    constructor(options){
        this.imageLabelAreaEl = document.getElementById(options.el || "imageLabelArea"); // 默认图片标注区域
        this.imageUrl = options.imageUrl; // 图片路径
        this.labels = options.labels || []; // 标签集合
        this.isMouseDown = false; // 鼠标按下时
        this.resizeDotClasses = [
            "n",
            "s",
            "w",
            "e",
            "nw",
            "ne",
            "sw",
            "se"
        ]; // 上，下，左，右，左上，右上，左下， 右下
        this.resizeDotName = null;
        this.labelItemTemp = null;
        this.startPointTemp = null;
        this.divLeft = null;
        this.divTop = null;
        this.labelsContainer = null;
        this.defaultZIndex = 0;
        this.$w = 0;
        this.$h = 0;
        this.activeUuid = null;
        this.error = options.error;
        this.contextmenu = options.contextmenu;
        this.imageInfo = null;
        this.labelClick = options.labelClick;
        this.init();
    }
    init() {
        this.imageInfo = null;
        if (!this.labelsContainer) // 初始化创建DOM元素
        this.imageLabelAreaEl.innerHTML = `
            <div class="__simple-image-label__">
                <div class="s-image-content">
                    <img id="label-bg_img" src="${this.imageUrl}">
                    <div id="labelsContainer" class="label-content"></div>
                </div>
            </div>
        `;
        const img = document.getElementById("label-bg_img");
        if (img.src !== this.imageUrl) img.src = this.imageUrl;
        img.onload = ()=>{
            this.labelAreaEvent();
            this.resizeImage();
        };
        img.onerror = (err)=>{
            this.error(err);
        };
        this.labelsContainer = document.getElementById("labelsContainer");
        this.initLabelElement();
    }
    resizeImage() {
        const setImg = ()=>{
            const { width: width } = this.imageInfo;
            const imageContent = this.imageLabelAreaEl.querySelector(".__simple-image-label__");
            if (this.imageLabelAreaEl.clientWidth >= width) imageContent.style.width = width / this.imageLabelAreaEl.clientWidth * 100 + "%";
            else imageContent.style.width = "100%";
            this.$w = this.labelsContainer.clientWidth;
            this.$h = this.labelsContainer.clientHeight;
        };
        if (this.imageInfo) {
            setImg();
            return;
        }
        // 获取图片原始宽高
        (0, $4f8e5fb2dc7a6f8f$export$2176b0e68c10508f)(this.imageUrl).then((res)=>{
            this.imageInfo = res;
            setImg();
        });
    }
    initLabelElement() {
        // 如果有传入labels
        this.labels.forEach((label)=>{
            // 初始化uuid
            if (!label.uuid) label.uuid = (0, $4f8e5fb2dc7a6f8f$export$31b40729666a4ae0)();
            this.createLabelElement(label);
        });
    }
    // 事件
    labelAreaEvent() {
        this.$w = this.labelsContainer.clientWidth;
        this.$h = this.labelsContainer.clientHeight;
        let startPoint = {
            x: 0,
            y: 0
        };
        let endPoint = {
            x: 0,
            y: 0
        };
        let labelItem = {
            uuid: "",
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            name: "",
            color: ""
        };
        this.labelsContainer.onmousedown = (e)=>{
            if (e.button !== 0) return; // 不是左键点击则不操作
            this.isMouseDown = true;
            // 点击整个label时，设置激活状态
            if (e.target.className.includes("label-item")) {
                this.clearAllLabelActive();
                this.setLabelActive(e.target.id);
                this.dragListen(e.target.id);
                return;
            }
            // 点击了边框上的点
            if (e.target.className.includes("resize-dot")) {
                labelItem = this.getLabelByUuid(e.target.parentNode.id);
                this.labelItemTemp = (0, $4f8e5fb2dc7a6f8f$export$b7d58db314e0ac27)(labelItem);
                endPoint = {
                    x: this.labelItemTemp.x + this.labelItemTemp.width,
                    y: this.labelItemTemp.y + this.labelItemTemp.height
                };
                this.resizeDotName = this.getLabelDot(e);
                return;
            }
            const clientLeft = e.clientX - this.getLabelsContainerRelativePoints().x;
            const clientTop = e.clientY - this.getLabelsContainerRelativePoints().y;
            let x = clientLeft / this.$w; // 转换为百分比
            let y = clientTop / this.$h;
            startPoint = {
                x: x,
                y: y
            };
            if (!this.startPointTemp) this.startPointTemp = (0, $4f8e5fb2dc7a6f8f$export$b7d58db314e0ac27)(startPoint);
            // 设置labelItem
            labelItem.uuid = (0, $4f8e5fb2dc7a6f8f$export$31b40729666a4ae0)();
            labelItem.x = x;
            labelItem.y = y;
            labelItem.width = 0;
            labelItem.height = 0;
            this.createLabelElement(labelItem);
        };
        // 鼠标移动事件
        this.labelsContainer.onmousemove = (e)=>{
            if (e.target.className.includes("label-item")) {
                const uuid = e.target.id;
                // labelItem.uuid = e.target.dataset.uuid;
                if (this.isMouseDown) this.dragListen(uuid);
                else {
                    this.mouseEnterLabel(uuid);
                    this.dragListen(uuid);
                }
            }
            const clientLeft = e.clientX - this.getLabelsContainerRelativePoints().x;
            const clientTop = e.clientY - this.getLabelsContainerRelativePoints().y;
            let x = clientLeft / this.$w;
            let y = clientTop / this.$h;
            endPoint = {
                x: x,
                y: y
            };
            if (labelItem.uuid) this.calc(labelItem, startPoint, endPoint);
        };
        // 鼠标抬起事件
        this.labelsContainer.onmouseup = (e)=>{
            const clientLeft = e.clientX - this.getLabelsContainerRelativePoints().x;
            const clientTop = e.clientY - this.getLabelsContainerRelativePoints().y;
            let x = clientLeft / this.$w;
            let y = clientTop / this.$h;
            endPoint = {
                x: x,
                y: y
            };
            this.calc(labelItem, startPoint, endPoint);
            // 如果开始点与结束点一样，则删除当前dom元素
            if ((0, $4f8e5fb2dc7a6f8f$export$248d38f6296296c5)(startPoint, endPoint)) this.removeLabelByUuid(labelItem.uuid);
            // 重置
            labelItem = {};
            this.isMouseDown = false;
            this.resizeDotName = null;
            this.labelItemTemp = null;
        };
        // 右键点击
        this.labelsContainer.oncontextmenu = (e)=>{
            e.preventDefault();
            this.contextmenu(e);
        };
        // 监听浏览器缩放,改变label的宽高
        window.addEventListener("resize", (e)=>{
            this.$w = this.labelsContainer.clientWidth;
            this.$h = this.labelsContainer.clientHeight;
            this.resizeImage();
        });
    }
    // 根据clientX及clientY获取labelsContainer相对于body的左侧x,y点的位置
    getLabelsContainerRelativePoints() {
        const bodyWidth = document.body.clientWidth;
        const bodyHeight = document.body.clientHeight;
        return {
            // body的宽高 - 当前labelsContainer容器的宽高 = labelsContainer容器外的宽高，labelsContainer容器外的宽高 / 2 = labelsContainer容器与浏览器最左侧的距离
            x: (bodyWidth - this.labelsContainer.clientWidth) / 2,
            y: (bodyHeight - this.labelsContainer.clientHeight) / 2
        };
    }
    createLabelElement(labelItem) {
        const { x: x, y: y, width: width, height: height, uuid: uuid, color: color, name: name } = labelItem;
        this.clearAllLabelActive();
        // 创建label元素
        const labelElement = document.createElement("div");
        labelElement.className = "label-item";
        labelElement.id = uuid;
        labelElement.style.left = (0, $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782)(x);
        labelElement.style.top = (0, $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782)(y);
        labelElement.style.width = (0, $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782)(width);
        labelElement.style.height = (0, $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782)(height);
        labelElement.style.position = "absolute";
        labelElement.style.border = "1px solid rgb(58,238,121)";
        labelElement.style.backgroundColor = "rgba(191,191,191,.5)";
        labelElement.style.zIndex = this.labels.length;
        if (color) labelElement.style.borderColor = color;
        // 设置data-uuid,可以通过e.target.uuid获取uuid的值
        // labelElement.setAttribute('data-uuid', uuid)
        // 创建可以拖动的点
        this.resizeDotClasses.forEach((resizeDotClass)=>{
            const labelDragElement = document.createElement("div");
            labelDragElement.className = `resize-dot resize-dot-${resizeDotClass}`;
            labelElement.appendChild(labelDragElement);
        });
        // 设置文字
        const labelText = document.createElement("div");
        labelText.className = "label-text";
        labelText.innerText = name;
        if (name) labelText.style.display = "block";
        labelElement.appendChild(labelText);
        this.labelsContainer.appendChild(labelElement);
    }
    // 计算两点的宽高
    calc(labelItem, startPoint, endPoint) {
        // 如果开始与结束的点一样，则不进行任何操作
        if (!(0, $4f8e5fb2dc7a6f8f$export$248d38f6296296c5)(startPoint, endPoint)) {
            labelItem.width = endPoint.x - startPoint.x;
            labelItem.height = endPoint.y - startPoint.y;
            if (labelItem.uuid && !this.getLabelByUuid(labelItem.uuid)) // 添加到labels
            this.labels.push(labelItem);
            else this.changeLabelSize(labelItem, endPoint);
        }
    }
    // 动态改变label的宽高
    changeLabelSize(labelItem, endPoint) {
        const label = document.getElementById(labelItem.uuid);
        if (!label) return;
        const x = labelItem.x;
        const y = labelItem.y;
        const width = labelItem.width;
        const height = labelItem.height;
        const uuid = labelItem.uuid;
        const w = Math.abs(width);
        const h = Math.abs(height);
        if (!this.resizeDotName) {
            label.style.width = (0, $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782)(width <= 0 ? 0 : w);
            label.style.height = (0, $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782)(height <= 0 ? 0 : h);
            label.style.left = (0, $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782)(x);
            label.style.top = (0, $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782)(y);
        } else {
            // 原底部Y轴的距离
            const oldBottomY = this.labelItemTemp.y + this.labelItemTemp.height;
            if (this.resizeDotName.includes("n")) {
                const _y = this.labelItemTemp.y - endPoint.y;
                const _h = _y > 0 ? this.labelItemTemp.height + Math.abs(_y) : this.labelItemTemp.height - Math.abs(_y);
                // 新旧label底部y距离顶部的距离
                const top = endPoint.y >= oldBottomY ? oldBottomY : endPoint.y;
                label.style.top = (0, $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782)(top);
                label.style.height = (0, $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782)(_h < 0 ? 0 : _h);
            }
            if (this.resizeDotName.includes("s")) {
                const _h = endPoint.y - y;
                label.style.height = (0, $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782)(_h <= 0 ? 0 : _h);
            }
            if (this.resizeDotName.includes("w")) {
                const _l = this.labelItemTemp.x + this.labelItemTemp.width - endPoint.x <= 0 ? this.labelItemTemp.x + this.labelItemTemp.width : endPoint.x;
                label.style.left = (0, $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782)(_l);
                const _w = this.labelItemTemp.x - endPoint.x < 0 ? this.labelItemTemp.width - Math.abs(this.labelItemTemp.x - endPoint.x) : this.labelItemTemp.width + Math.abs(this.labelItemTemp.x - endPoint.x);
                label.style.width = (0, $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782)(_w <= 0 ? 0 : _w);
            }
            if (this.resizeDotName.includes("e")) {
                label.style.width = (0, $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782)(x <= 0 ? endPoint.x : endPoint.x - x);
                labelItem.width = x <= 0 ? endPoint.x : endPoint.x - x;
            }
        }
        const attr = {
            x: (0, $4f8e5fb2dc7a6f8f$export$526bad2e66ad9dff)(label.style.left),
            y: (0, $4f8e5fb2dc7a6f8f$export$526bad2e66ad9dff)(label.style.top),
            height: (0, $4f8e5fb2dc7a6f8f$export$526bad2e66ad9dff)(label.style.height),
            width: (0, $4f8e5fb2dc7a6f8f$export$526bad2e66ad9dff)(label.style.width)
        };
        this.setLabelByUuid(uuid, attr);
    }
    // 根据uuid查询label
    getLabelByUuid(uuid) {
        const item = this.labels.find((item)=>item.uuid === uuid);
        return item;
    }
    setLabelByUuid(uuid, attr = {}) {
        const label = document.getElementById(uuid);
        if (!label) return;
        const keys = Object.keys(attr);
        this.labels.forEach((item)=>{
            if (item.uuid === uuid) keys.forEach((key)=>{
                if (Object.hasOwn(item, key)) {
                    item[key] = attr[key];
                    if (item.name) {
                        const labelName = label.querySelector(".label-text");
                        labelName.style.display = "block";
                    }
                    if (item.color) label.style.borderColor = item.color;
                }
            });
        });
    }
    // 根据uuid删除label
    removeLabelByUuid(uuid) {
        const label = document.getElementById(uuid);
        this.labels = Object.assign([], this.labels.filter((item)=>item.uuid !== uuid));
        if (label) label.parentNode.removeChild(label);
    }
    // 删除所有label
    removeAllLabels() {
        const labels = document.querySelectorAll(".label-item");
        labels.forEach((item)=>{
            item.parentNode.removeChild(item);
        });
        this.labels = [];
    }
    // 清除所有标签的激活状态
    clearAllLabelActive() {
        // 获取所有labels元素
        const labelElements = document.querySelectorAll(".label-item");
        // 如果存在labelElements，则移除className为label-active
        if (labelElements.length) labelElements.forEach((item)=>{
            item.classList.remove("label-item-active");
        });
    }
    // 设置当前label的激活状态
    setLabelActive(uuid) {
        const label = document.getElementById(uuid);
        if (!label) return;
        // 设置当前label的激活状态
        label.classList.add("label-item-active");
        this.labelClick(this.getLabelByUuid(uuid));
    }
    // 根据dot获取label
    getLabelDot(e) {
        const dotType = e.target.className.replace("resize-dot resize-dot-", "");
        this.clearAllLabelActive();
        this.setLabelActive(e.target.parentNode.id);
        return dotType;
    }
    // 鼠标移入label
    mouseEnterLabel(uuid) {
        const label = document.getElementById(uuid);
        if (!label) return;
        label.style.cursor = "default";
    }
    // 拖动事件
    dragListen(uuid) {
        const label = document.getElementById(uuid);
        if (!label) return;
        label.onmousedown = (e)=>this.dragStart(e);
        label.onmousemove = (e)=>this.dragLabel(e);
        label.onmouseup = (e)=>this.dragEnd(e);
    }
    // 监听拖拽事件
    dragStart(e) {
        const label = document.getElementById(e.target.id);
        if (!label) return;
        label.style.cursor = "move";
        this.divLeft = e.pageX - label.offsetLeft;
        this.divTop = e.pageY - label.offsetTop;
        this.defaultZIndex = label.style.zIndex;
        // 将选中的label的z-index设置为最高
        label.style.zIndex = 100;
    }
    // 拖拽label
    dragLabel(e) {
        e.preventDefault();
        if (!this.divLeft || !this.divTop) return;
        const label = document.getElementById(e.target.id);
        // 拖拽事件获取拖拽最终的坐标
        if (!label) return;
        if (label.style.cursor === "default") return;
        const currentLabelWidth = label.style.width ? (0, $4f8e5fb2dc7a6f8f$export$526bad2e66ad9dff)(label.style.width) : 0;
        const currentLabelHeight = label.style.height ? (0, $4f8e5fb2dc7a6f8f$export$526bad2e66ad9dff)(label.style.height) : 0;
        const leftPointPercent = 1 - currentLabelWidth; // 原label div 左侧的点与x轴0点的距离
        const topPointPercent = 1 - currentLabelHeight; // 原label div 顶部的点与y轴0点的距离
        const leftDistance = e.pageX - this.divLeft; // 根据移动，计算当前label div的左侧距离x轴0点的距离
        const topDistance = e.pageY - this.divTop; // 根据移动，计算当前label div的顶部的距离y轴0点的距离
        label.style.left = leftDistance / this.$w <= 0 ? 0 : leftDistance / this.$w >= leftPointPercent ? (0, $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782)(leftPointPercent) : (0, $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782)(leftDistance / this.$w);
        label.style.top = topDistance / this.$h <= 0 ? 0 : topDistance / this.$h >= topPointPercent ? (0, $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782)(topPointPercent) : (0, $4f8e5fb2dc7a6f8f$export$42dea53aa0f06782)(topDistance / this.$h);
    }
    // 监听拖拽结束事件
    dragEnd(e) {
        const label = document.getElementById(e.target.id);
        if (!label) return;
        label.style.cursor = "default";
        this.labels.forEach((item)=>{
            if (item.uuid === e.target.id) {
                item.x = (0, $4f8e5fb2dc7a6f8f$export$526bad2e66ad9dff)(label.style.left);
                item.y = (0, $4f8e5fb2dc7a6f8f$export$526bad2e66ad9dff)(label.style.top);
            }
        });
        this.divLeft = null;
        this.divTop = null;
        // 恢复label的z-index
        label.style.zIndex = this.defaultZIndex;
    }
    // 获取所有label
    getLabels() {
        return this.labels;
    }
    // 获取激活的label
    activeLabel() {
        const uuid = document.querySelector(".label-item-active").id;
        return this.labels.find((item)=>item.uuid === uuid);
    }
    // 重新设置图片
    setImage(imageUrl) {
        this.removeAllLabels();
        this.imageUrl = imageUrl;
        this.init();
    }
    // 重设labels
    setLabels(labels) {
        this.labels = labels;
        this.init();
    }
    // 获取图片原始大小
    getImageInfo() {
        return this.imageInfo;
    }
}
var $5bbdaa7df4002674$export$2e2bcd8739ae039 = $5bbdaa7df4002674$var$SimpleImageLabel;


