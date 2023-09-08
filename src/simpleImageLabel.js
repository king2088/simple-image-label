'use strict'
import {
  deepClone,
  uuidGenerate,
  isEqual,
  percentOrPixelToDecimal,
  decimalToPercent,
  getImageInfo
} from './utils';

import './style.less'

class SimpleImageLabel {
  constructor(options) {
    // 默认图片标注区域
    this.imageLabelAreaEl = document.getElementById(options.el || 'imageLabelArea');
    // 图片路径
    this.imageUrl = options.imageUrl;
    // 标签集合
    this.labels = options.labels || [];
    // label被左键点击的回调
    this.labelClick = options.labelClick;
    // label右键点击回调
    this.contextmenu = options.contextmenu;
    // 发生错误的回调
    this.error = options.error;
    // 鼠标按下时
    this.isMouseDown = false;
    // labels容器，即id为labelsContainer的div
    this.labelsContainer = null;
    this.defaultZIndex = 0;
    // labelsContainer的真实宽高
    this.$w = 0;
    this.$h = 0;
    // 8个缩放点
    this.resizeDotClasses = ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se']; // 上，下，左，右，左上，右上，左下， 右下
    this.resizeDotName = null; // 当前被点击的点名称
    // 新建的label
    this.labelItem = null;
    this.labelItemTemp = null;
    // 开始及结束点
    this.startPoint = null;
    this.startPointTemp = null;
    this.endPoint = null;
    // 当前label相对于labelsContainer左上顶点的位置
    this.labelRelativePointContainer = {
      x: null,
      y: null
    };
    // 当前被激活的label的uuid
    this.activeUuid = null;
    // 图片详情 {width} {height}
    this.imageInfo = null;

    this.init();
  }

  init() {
    this.imageInfo = null;
    if (!this.labelsContainer) {
      // 初始化创建DOM元素
      this.imageLabelAreaEl.innerHTML = `
            <div class="__simple-image-label__">
                <div class="s-image-content">
                    <img id="label-bg_img" src="${this.imageUrl}">
                    <div id="labelsContainer" class="label-content"></div>
                </div>
            </div>
        `;
    }
    const img = document.getElementById('label-bg_img');
    if (img.src !== this.imageUrl) {
      img.src = this.imageUrl;
    }
    img.onload = () => {
      this.labelAreaEvent();
      this.resizeImage();
    }
    img.onerror = (err) => {
      if (this.error && typeof this.error === 'function') {
        this.error(err);
      }
    }
    this.labelsContainer = document.getElementById('labelsContainer');
    this.initLabelElement();
  }

  // 根据图片进行缩放宽度，如果图片宽度小于当前可视区域则__simple-image-label__宽度就 = 图片宽度，否则为100%
  resizeImage() {
    const setImg = () => {
      const {
        width
      } = this.imageInfo;
      const imageContent = this.imageLabelAreaEl.querySelector('.__simple-image-label__');
      if (this.imageLabelAreaEl.clientWidth >= width) {
        imageContent.style.width = decimalToPercent(width / this.imageLabelAreaEl.clientWidth);
      } else {
        imageContent.style.width = '100%';
      }
      this.$w = this.labelsContainer.clientWidth;
      this.$h = this.labelsContainer.clientHeight;
    }
    if (this.imageInfo) {
      setImg();
      return;
    }
    // 获取图片原始宽高
    getImageInfo(this.imageUrl).then(res => {
      this.imageInfo = res;
      setImg();
    })
  }

  initLabelElement() {
    // 如果有传入labels
    this.labels.forEach(label => {
      // 初始化uuid
      if (!label.uuid) {
        label.uuid = uuidGenerate();
      }
      this.createLabelElement(label);
    })
  }

  // 事件
  labelAreaEvent() {
    this.$w = this.labelsContainer.clientWidth;
    this.$h = this.labelsContainer.clientHeight;
    this.startPoint = {
      x: 0,
      y: 0
    };
    this.endPoint = {
      x: 0,
      y: 0
    };
    this.labelItem = {
      uuid: '',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      name: '',
      color: ''
    };
    this.labelsContainer.onmousedown = (e) => this.mousedown(e);
    // 鼠标移动事件
    this.labelsContainer.onmousemove = (e) => this.mousemove(e);
    // 鼠标抬起事件
    this.labelsContainer.onmouseup = (e) => this.mouseup(e);
    // 右键点击
    this.labelsContainer.oncontextmenu = (e) => {
      e.preventDefault();
      if (this.contextmenu && typeof this.contextmenu === 'function') {
        this.contextmenu(e)
      }
    };
    // 监听浏览器缩放,改变label的宽高
    window.addEventListener('resize', (e) => {
      this.$w = this.labelsContainer.clientWidth;
      this.$h = this.labelsContainer.clientHeight;
      this.resizeImage();
    })
  }

  mousedown(e) {
    if (e.button !== 0) return; // 不是左键点击则不操作
    this.isMouseDown = true;
    const isLabelText = e.target.className.includes('label-text');
    const isLabelItem = e.target.className.includes('label-item');
    const isResizeDot = e.target.className.includes('resize-dot');
    const uuid = isLabelItem ? e.target.id : e.target.parentNode.id;
    // 点击了边框上的点
    if (isResizeDot) {
      this.labelItem = this.getLabelByUuid(e.target.parentNode.id);
      this.labelItemTemp = deepClone(this.labelItem);
      this.endPoint = {
        x: this.labelItemTemp.x + this.labelItemTemp.width,
        y: this.labelItemTemp.y + this.labelItemTemp.height
      };
      this.resizeDotName = this.getLabelDot(e);
      this.dragListen(uuid, isLabelText);
      this.removeDragListen();
      return;
    } else {
      // 点击整个label时，设置激活状态
      if (isLabelItem || isLabelText) {
        this.clearAllLabelActive();
        this.setLabelActive(uuid);
        this.dragListen(uuid, isLabelText);
        return;
      }
    }
    const clientLeft = e.clientX - this.getLabelsContainerRelativePoints().x;
    const clientTop = e.clientY - this.getLabelsContainerRelativePoints().y;
    let x = clientLeft / this.$w; // 转换为百分比
    let y = clientTop / this.$h;
    this.startPoint = {
      x,
      y
    };
    if (!this.startPointTemp) {
      this.startPointTemp = deepClone(this.startPoint);
    }
    // 设置labelItem
    this.labelItem.uuid = uuidGenerate();
    this.labelItem.x = x;
    this.labelItem.y = y;
    this.labelItem.width = 0;
    this.labelItem.height = 0;
    this.createLabelElement(this.labelItem);
  }

  mousemove(e) {
    const isLabelText = e.target.className.includes('label-text');
    const isLabelItem = e.target.className.includes('label-item');
    const isResizeDot = e.target.className.includes('resize-dot');
    const uuid = isLabelItem ? e.target.id : e.target.parentNode.id;
    if (!isResizeDot) {
      if (isLabelItem || isLabelText) {
        if (this.isMouseDown) {
          this.dragListen(uuid, isLabelText);
        } else {
          this.mouseEnterLabel(uuid);
          this.dragListen(uuid, isLabelText);
        }
      }
    } else {
      this.removeDragListen(uuid, isLabelText);
    }
    const clientLeft = e.clientX - this.getLabelsContainerRelativePoints().x;
    const clientTop = e.clientY - this.getLabelsContainerRelativePoints().y;
    let x = clientLeft / this.$w;
    let y = clientTop / this.$h;
    this.endPoint = {
      x,
      y
    };
    if (this.labelItem.uuid) {
      this.calc(this.labelItem, this.startPoint, this.endPoint);
    }
  }

  mouseup(e) {
    const clientLeft = e.clientX - this.getLabelsContainerRelativePoints().x;
    const clientTop = e.clientY - this.getLabelsContainerRelativePoints().y;
    let x = clientLeft / this.$w;
    let y = clientTop / this.$h;
    this.endPoint = {
      x,
      y
    };
    this.calc(this.labelItem, this.startPoint, this.endPoint);
    // 如果开始点与结束点一样，则删除当前dom元素
    if (isEqual(this.startPoint, this.endPoint) || (this.labelItem.width === 0 && this.labelItem.height === 0)) {
      this.removeLabelByUuid(this.labelItem.uuid);
    }
    // 重置
    this.labelItem = {};
    this.isMouseDown = false;
    this.resizeDotName = null;
    this.labelItemTemp = null;
  }

  // 根据clientX及clientY获取labelsContainer相对于body的左侧x,y点的位置
  getLabelsContainerRelativePoints() {
    const labelExternalEl = document.querySelector('.__simple-image-label__');
    return {
      // body的宽高 - 当前labelsContainer容器的宽高 = labelsContainer容器外的宽高，labelsContainer容器外的宽高 / 2 = labelsContainer容器与浏览器最左侧的距离
      x: labelExternalEl.getBoundingClientRect().x,
      y: labelExternalEl.getBoundingClientRect().y
    };
  }

  createLabelElement(labelItem) {
    const {
      x,
      y,
      width,
      height,
      uuid,
      color,
      name
    } = labelItem
    this.clearAllLabelActive();
    // 创建label元素
    const labelElement = document.createElement('div');
    labelElement.className = 'label-item';
    labelElement.id = uuid;
    labelElement.style.left = decimalToPercent(x);
    labelElement.style.top = decimalToPercent(y);
    labelElement.style.width = decimalToPercent(width);
    labelElement.style.height = decimalToPercent(height);
    labelElement.style.position = 'absolute';
    labelElement.style.border = '1px solid rgb(58,238,121)';
    labelElement.style.backgroundColor = 'rgba(191,191,191,.5)';
    labelElement.style.zIndex = this.labels.length;
    if (color) {
      labelElement.style.borderColor = color;
    }
    // 设置data-uuid,可以通过e.target.uuid获取uuid的值
    // labelElement.setAttribute('data-uuid', uuid)
    // 创建可以拖动的点
    this.resizeDotClasses.forEach(resizeDotClass => {
      const labelDragElement = document.createElement('div');
      labelDragElement.className = `resize-dot resize-dot-${resizeDotClass}`;
      labelElement.appendChild(labelDragElement);
    })
    // 设置文字
    const labelText = document.createElement('div');
    labelText.className = 'label-text';
    labelText.innerText = name;
    if (name) {
      labelText.style.display = 'block';
      if (color) {
        labelText.style.color = color;
      }
    }
    labelElement.appendChild(labelText);
    this.labelsContainer.appendChild(labelElement);
  }

  // 计算两点的宽高
  calc(labelItem, startPoint, endPoint) {
    // 如果开始与结束的点一样，则不进行任何操作
    if (!isEqual(startPoint, endPoint)) {
      labelItem.width = endPoint.x - startPoint.x;
      labelItem.height = endPoint.y - startPoint.y;
      if (labelItem.uuid && !this.getLabelByUuid(labelItem.uuid)) {
        // 添加到labels
        this.labels.push(labelItem);
      } else {
        this.changeLabelSize(labelItem, endPoint);
      }
    }
  }

  // 动态改变label的宽高
  changeLabelSize(labelItem, endPoint) {
    const label = document.getElementById(labelItem.uuid);
    if (!label) {
      return;
    }
    const {
      x,
      y,
      width,
      height,
      uuid
    } = labelItem;

    if (!this.resizeDotName) {
      const w = Math.abs(width);
      const h = Math.abs(height);
      label.style.width = decimalToPercent(width <= 0 ? 0 : w);
      label.style.height = decimalToPercent(height <= 0 ? 0 : h);
      label.style.left = decimalToPercent(x);
      label.style.top = decimalToPercent(y);
    } else {
      // 原底部Y轴的距离
      const oldBottomY = this.labelItemTemp.y + this.labelItemTemp.height;
      if (this.resizeDotName.includes('n')) {
        const _y = this.labelItemTemp.y - endPoint.y;
        const _h = _y > 0 ? this.labelItemTemp.height + Math.abs(_y) : this.labelItemTemp.height - Math.abs(_y);
        // 新旧label底部y距离顶部的距离
        const top = endPoint.y >= oldBottomY ? oldBottomY : endPoint.y;
        label.style.top = decimalToPercent(top);
        label.style.height = decimalToPercent(_h < 0 ? 0 : _h);
      }
      if (this.resizeDotName.includes('s')) {
        const _h = endPoint.y - y;
        label.style.height = decimalToPercent(_h <= 0 ? 0 : _h);
      }
      if (this.resizeDotName.includes('w')) {
        const _l = (this.labelItemTemp.x + this.labelItemTemp.width) - endPoint.x <= 0 ? this.labelItemTemp.x + this.labelItemTemp.width : endPoint.x;
        label.style.left = decimalToPercent(_l);
        const _w = this.labelItemTemp.x - endPoint.x < 0 ? this.labelItemTemp.width - Math.abs(this.labelItemTemp.x - endPoint.x) : this.labelItemTemp.width + Math.abs(this.labelItemTemp.x - endPoint.x);
        label.style.width = decimalToPercent(_w <= 0 ? 0 : _w);
      }
      if (this.resizeDotName.includes('e')) {
        label.style.width = decimalToPercent(x <= 0 ? endPoint.x : endPoint.x - x);
      }
    }
    const attr = {
      x: percentOrPixelToDecimal(label.style.left),
      y: percentOrPixelToDecimal(label.style.top),
      height: percentOrPixelToDecimal(label.style.height),
      width: percentOrPixelToDecimal(label.style.width),
    };
    this.setLabelByUuid(uuid, attr);
  }

  // 根据uuid查询label
  getLabelByUuid(uuid) {
    const item = this.labels.find(item => item.uuid === uuid);
    return item;
  }

  setLabelByUuid(uuid, attr = {}) {
    const label = document.getElementById(uuid);
    if (!label) {
      return;
    }
    const keys = Object.keys(attr);
    this.labels.forEach(item => {
      if (item.uuid === uuid) {
        keys.forEach(key => {
          if (Object.hasOwn(item, key)) {
            item[key] = attr[key];
            if (item.name) {
              const labelName = label.querySelector('.label-text');
              labelName.style.display = 'block';
            }
            if (item.color) {
              label.style.borderColor = item.color;
            }
          }
        })
      }
    })
  }

  // 根据uuid删除label
  removeLabelByUuid(uuid) {
    const label = document.getElementById(uuid);
    this.labels = Object.assign([], this.labels.filter(item => item.uuid !== uuid));
    if (label) {
      label.parentNode.removeChild(label);
    }
  }

  // 删除所有label
  removeAllLabels() {
    const labels = document.querySelectorAll('.label-item');
    labels.forEach(item => {
      item.parentNode.removeChild(item);
    })
    this.labels = [];
  }

  // 清除所有标签的激活状态
  clearAllLabelActive() {
    // 获取所有labels元素
    const labelElements = document.querySelectorAll('.label-item');
    // 如果存在labelElements，则移除className为label-active
    if (labelElements.length) {
      labelElements.forEach(item => {
        item.classList.remove('label-item-active');
      })
    }
  }

  // 设置当前label的激活状态
  setLabelActive(uuid) {
    const label = document.getElementById(uuid);
    if (!label) {
      return;
    }
    // 设置当前label的激活状态
    label.classList.add('label-item-active');
    if (this.labelClick && typeof this.labelClick === 'function') {
      this.labelClick(this.getLabelByUuid(uuid));
    }
  }

  // 根据dot获取label
  getLabelDot(e) {
    const dotType = e.target.className.replace('resize-dot resize-dot-', '');
    this.clearAllLabelActive();
    this.setLabelActive(e.target.parentNode.id);
    return dotType;
  }

  // 鼠标移入label
  mouseEnterLabel(uuid) {
    const label = document.getElementById(uuid);
    if (!label) {
      return;
    }
    label.style.cursor = 'default';
  }

  // 拖动事件
  dragListen(uuid, isText = false) {
    const label = document.getElementById(uuid);
    if (!label) {
      return;
    }
    let textEl = isText ? label.querySelector('.label-text') : null;
    if (isText) {
      textEl.onmousedown = (e) => this.dragStart(e);
      textEl.onmousemove = (e) => this.dragLabel(e);
      textEl.onmouseup = (e) => this.dragEnd(e);
      return;
    }
    label.onmousedown = (e) => this.dragStart(e);
    label.onmousemove = (e) => this.dragLabel(e);
    label.onmouseup = (e) => this.dragEnd(e);
  }

  removeDragListen(uuid, isText = false) {
    const label = document.getElementById(uuid);
    if (!label) {
      return;
    }
    let textEl = isText ? label.querySelector('.label-text') : null;
    label.onmousedown = null;
    label.onmousemove = null;
    label.onmouseup = null;
    if (isText) {
      textEl.onmousedown = null;
      textEl.onmousemove = null;
      textEl.onmouseup = null;
    }
  }

  // 监听拖拽事件
  dragStart(e) {
    const label = document.getElementById(e.target.id || e.target.parentNode.id);
    if (!label) {
      return;
    }
    label.style.cursor = 'move';
    this.labelRelativePointContainer.x = e.pageX - label.offsetLeft;
    this.labelRelativePointContainer.y = e.pageY - label.offsetTop;
    this.defaultZIndex = label.style.zIndex;
    // 将选中的label的z-index设置为最高
    label.style.zIndex = 100;
  }

  // 拖拽label
  dragLabel(e) {
    e.preventDefault()
    if (!this.labelRelativePointContainer.x || !this.labelRelativePointContainer.y) {
      return;
    }
    const label = document.getElementById(e.target.id || e.target.parentNode.id);
    // 拖拽事件获取拖拽最终的坐标
    if (!label) {
      return;
    }
    if (label.style.cursor === 'default') {
      return;
    }
    const currentLabelWidth = label.style.width ? percentOrPixelToDecimal(label.style.width) : 0;
    const currentLabelHeight = label.style.height ? percentOrPixelToDecimal(label.style.height) : 0;

    const leftPointPercent = 1 - currentLabelWidth; // 原label div 左侧的点与x轴0点的距离
    const topPointPercent = 1 - currentLabelHeight; // 原label div 顶部的点与y轴0点的距离
    const leftDistance = e.pageX - this.labelRelativePointContainer.x; // 根据移动，计算当前label div的左侧距离x轴0点的距离
    const topDistance = e.pageY - this.labelRelativePointContainer.y; // 根据移动，计算当前label div的顶部的距离y轴0点的距离
    label.style.left = leftDistance / this.$w <= 0 ?
      0 :
      leftDistance / this.$w >= leftPointPercent ?
      decimalToPercent(leftPointPercent) :
      decimalToPercent(leftDistance / this.$w);
    label.style.top = topDistance / this.$h <= 0 ?
      0 :
      topDistance / this.$h >= topPointPercent ?
      decimalToPercent(topPointPercent) :
      decimalToPercent(topDistance / this.$h);
  }

  // 监听拖拽结束事件
  dragEnd(e) {
    const label = document.getElementById(e.target.id || e.target.parentNode.id);
    if (!label) {
      return;
    }
    label.style.cursor = 'default';
    this.labels.forEach(item => {
      if (item.uuid === e.target.id) {
        item.x = percentOrPixelToDecimal(label.style.left);
        item.y = percentOrPixelToDecimal(label.style.top);
      }
    })
    this.labelRelativePointContainer.x = null;
    this.labelRelativePointContainer.y = null;
    // 恢复label的z-index
    label.style.zIndex = this.defaultZIndex;
  }

  // 获取所有label
  getLabels() {
    return this.labels;
  }

  // 获取激活的label
  activeLabel() {
    const uuid = document.querySelector('.label-item-active').id;
    return this.labels.find(item => item.uuid === uuid);
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

  // 获取默认坐标{x: 左上顶点的x轴，y:左上顶点的y轴，x1:右下顶点的x轴，y1:右下顶点的y轴}
  getCoordinate(label) {
    const { height, width } = this.imageInfo;
    return {
      x: label.x * width,
      y: label.y * height,
      x1: (label.x + label.width) * width,
      y1: (label.y + label.height) * height
    }
  }

  // 获取所有的默认坐标
  getLabelsCoordinate() {
    return this.labels.map(label => this.getCoordinate(label));
  }

  // 转换为YOLO坐标[label中心x轴 / 图像总宽度，label中心y轴 / 图像总宽度，label宽百分比（相对于图片宽），label高百分比（相对于图片的高）]
  convertToYoloCoordinate(label) {
    const coordinate = this.getCoordinate(label)
    const { height, width } = this.imageInfo;
    const labelCenterX = (coordinate.x + coordinate.x1) / 2;
    const labelCenterY = (coordinate.y + coordinate.y1) / 2;
    return [labelCenterX / width, labelCenterY / height, label.width, label.height]
  }

  // 获取所有labels的YOLO坐标集合
  getLabelsYoloCoordinate() {
    return this.labels.map(label => this.convertToYoloCoordinate(label));
  }

}

export default SimpleImageLabel;