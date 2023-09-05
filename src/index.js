import SimpleImageLabel from "./simpleImageLabel"

import img from '../static/1.jpeg'
import img2 from '../static/2.jpg'

const imageLabelContent = new SimpleImageLabel({
  el: 'imageLabelArea',
  imageUrl: img,
  labels: [{
    color: "red",
    height: 0.239185,
    name: "房子",
    width: 0.200318,
    x: 0.0333863,
    y: 0.498728
  }],
  contextmenu: (e) => { console.log(e) },
  error: (err) => { console.log(err); },
  labelClick: (label) => { console.log(label) },
})

setTimeout(() => {
  // 重设图片
  imageLabelContent.setImage(img2, (err) => {
    console.log(err)
  })
  imageLabelContent.setLabels([{
    "x": 0.0184805,
    "y": 0.358896,
    "width": 0.22381900000000002,
    "height": 0.239264,
    "name": "图片",
    "color": "blue"
  }, {
    "x": 0.283368,
    "y": 0.7208589999999999,
    "width": 0.441478,
    "height": 0.116564,
    "name": "分页",
    "color": "red"
  }])
}, 10000)

console.log(imageLabelContent);