import SimpleImageLabel from "./simpleImageLabel"

import img from '../static/1.jpg'
import img2 from '../static/2.jpg'

const preBtn = document.getElementById('pre-btn')
const nextBtn = document.getElementById('next-btn')
const deleteBtn = document.getElementById('delete-btn')
const setNameBtn = document.getElementById('set-name-btn')
const setColorBtn = document.getElementById('set-color-btn')

const initLabels = [{
  "color": "red",
  "height": 0.251473,
  "name": "House",
  "width": 0.200318,
  "x": 0.0309278,
  "y": 0.532417,
}, {
  "x": 0.588202,
  "y": 0.42436100000000004,
  "width": 0.37571599999999994,
  "height": 0.453832,
  "name": "Tree",
  "color": "yellow"
}]

const nextLabels = [{
  "x": 0.46949199999999996,
  "y": 0.128668,
  "width": 0.191526,
  "height": 0.202032,
  "name": "Grass Mud Horse",
  "color": "blue"
}, {
  "x": 0.7186440000000001,
  "y": 0.241535,
  "width": 0.15762700000000002,
  "height": 0.177201,
  "name": "Grass Mud Horse",
  "color": "blue",
}, {
  "x": 0.7406780000000001,
  "y": 0.536117,
  "width": 0.130508,
  "height": 0.173815,
  "name": "Duck",
  "color": "red"
}, {
  "x": 0.874576,
  "y": 0.481941,
  "width": 0.115254,
  "height": 0.148984,
  "name": "Duck",
  "color": "red"
}, {
  "x": 0.0338983,
  "y": 0.574492,
  "width": 0.111864,
  "height": 0.13544,
  "name": "Duck",
  "color": "red"
}]
let currentLabel = null
const imageLabelContent = new SimpleImageLabel({
  el: 'imageLabelArea',
  imageUrl: img,
  labels: initLabels,
  contextmenu: (e) => {

  },
  error: (err) => {
    console.log(err);
  },
  labelClick: (label) => {
    currentLabel = label
    const defaultCoordEl = document.getElementById('default-coord')
    const yoloCoordEl = document.getElementById('yolo-coord')
    if(!label) {
      deleteBtn.disabled = true
      setNameBtn.disabled = true
      setColorBtn.disabled = true
      defaultCoordEl.innerText = ''
      yoloCoordEl.innerText = ''
      return
    }

    console.log('Current clicked label : ', label);
    const coord = imageLabelContent.getLabelsCoordinate()
    console.log('All labels coord : ', coord)
    const yoloCoord = imageLabelContent.getLabelsYoloCoordinate()
    console.log('All YOLO coord : ', yoloCoord);
    
    const currentLabelCoord = imageLabelContent.getCoordinate(label)
    const currentYoloCoord = imageLabelContent.convertToYoloCoordinate(label)
    defaultCoordEl.innerText = '默认坐标：' + JSON.stringify(currentLabelCoord)
    yoloCoordEl.innerText = 'YOLO坐标：' + JSON.stringify(currentYoloCoord)
    deleteBtn.disabled = false
    setNameBtn.disabled = false
    setColorBtn.disabled = false
  },
})


deleteBtn.disabled = true
setNameBtn.disabled = true
setColorBtn.disabled = true

preBtn.style.display = 'none'

nextBtn.onclick = () => {
  setImageAndLabels(img2, nextLabels)
  preBtn.style.display = 'block'
  nextBtn.style.display = 'none'
}

preBtn.onclick = () => {
  setImageAndLabels(img, initLabels)
  nextBtn.style.display = 'block'
  preBtn.style.display = 'none'
}

deleteBtn.onclick = () => {
  if (currentLabel) {
    imageLabelContent.removeLabelByUuid(currentLabel.uuid)
  }
}

setNameBtn.onclick = () => {
  const name = window.prompt("设置当前label名称")
  if (name) {
    imageLabelContent.setLabelByUuid(currentLabel.uuid, {name})
  }
}

setColorBtn.onclick = () => {
  const color = window.prompt("设置当前label颜色")
  if (color) {
    imageLabelContent.setLabelByUuid(currentLabel.uuid, {color})
  }
}

function setImageAndLabels(image, labels) {
  // 重设图片
  imageLabelContent.setImage(image, (err) => {
    console.log(err)
  })
  imageLabelContent.setLabels(labels)
}