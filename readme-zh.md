# simple-image-label

[View English readme](README.md) | [查看中文版readme](README-zh.md)  
simple-image-label 采用JavaScript+html开发 , 支持YOLO坐标及VOC坐标，生成的坐标可用于目标检测及深度学习等。

## 预览图

![preview](preview.png)

## 在你的项目中使用simple-image-label

### 安装 simple-image-label
```bash
# npm
npm install simple-image-label -S
# yarn
yarn add simple-image-label
# pnpm
pnpm add simple-image-label
```
#### 在JavaScript项目中使用

```html
<div id="YourElementId"></div>
```

```js
// 采用 require （ES5）
const SimpleImageLabel = require('../libs/simpleImageLabel').default
// 采用 es6 
import SimpleImageLabel from '../libs/simpleImageLabel'
// `el`必须使用id选择器
const simpleImageLabel = new SimpleImageLabe({
    el: 'YourElementId', 
    imageUrl: 'yourImageUrl', 
    labels: [],
    contextmenu: (e) => {
        // 鼠标右键点击事件，可用于自定义右键菜单
    },
    labelClick: (label) => {
        // 鼠标左键点击事件
    },
    error: (err) => {
        // 错误回调
        console.log(err);
    }
});
```

#### 在vue3中使用simple-image-label

```html
<template>
    <div id="YourElementId"></div>
</template>
<script setup>
import SimpleImageLabel from 'simple-image-label'
import { ref, onMounted } from 'vue';
const simpleImageLabel = ref(null);
onMounted(() => {
    simpleImageLabel.value = new SimpleImageLabel({
        el: 'YourElementId'
        imageUrl: props.imageUrl,
        labels: props.labels,
        contextmenu: (e) => {
            emit('contextmenu', e)
        },
        labelClick: (label) => {
            emit('labelClick', label)
        },
        error: (e) => {
            emit('error', e)
        }
    });
})
</script>
```

#### 在React中使用simple-image-label
```jsx
import SimpleImageLabel from 'simple-image-label';
import img from './x.png'
import { useEffect } from 'react';
const ImageLabelComponent = () => {
    let simpleImageLabel = null
    useEffect(() => {
        initSimpleDom()
    }, [])
    function initSimpleDom() {
        simpleImageLabel = new SimpleImageLabel({
            el: 'YourElementId',
            imageUrl: img,
            labels: [],
            contextmenu: (e) => {
                console.log(e);
            },
            labelClick: (label) => {
                console.log(label);
            },
            error: (e) => {
                console.log(e);
            }
        })
    }
    function getAllLabels() {
        const labels = simpleImageLabel.getLabels()
        console.log('labels', labels);
    }
    return (
        <div>
            <div id="YourElementId"></div>
            <button onClick={getAllLabels}>Get all labels</button>
        </div>
    );
}
export default ImageLabelComponent;
```


## 对本项目进行 开发 & 安装 & 运行 demo

安装依赖
```bash
# npm
npm install
# yarn
yarn
# pnpm
pnpm install
```

运行
```bash
# npm
npm run start
# yarn
yarn start
# pnpm
pnpm run start
```

打包
```bash
# npm
npm run build
# yarn
yarn build
# pnpm
pnpm run build
```

## API

### `SimpleImageLabel 选项`
| 属性          | 类型       | 描述              |
| ------------- | ---------- | ----------------- |
| `el`          | `string`   | Html 元素的 id    |
| `imageUrl`    | `string`   | 图片路径          |
| `labels`      | `array`    | 默认的标签        |
| `readOnly`    | `boolean`  | 开启/关闭只读模式 |
| `contextmenu` | `function` | 鼠标右键点击事件  |
| `labelClick`  | `function` | 鼠标左键点击事件  |
| `error`       | `function` | 错误事件          |


### `SimpleImageLabel 方法`
| 方法                             | 参数         | 描述                                        |
| -------------------------------- | ------------ | ------------------------------------------- |
| `getLabels()`                    | -            | 获取所有标注                                |
| `activeLabel()`                  | -            | 获取当前激活的标注                          |
| `setImage(imageUrl)`             | `imageUrl`   | 设置图片                                    |
| `setLabels(labels)`              | `labels`     | 设置标注                                    |
| `getImageInfo()`                 | -            | 获取图片信息（当前图片真实宽高）            |
| `getCoordinate(label)`           | `label`      | 获取标注坐标                                |
| `getLabelsCoordinate()`          | -            | 获取所有标注的坐标                          |
| `convertToYoloCoordinate(label)` | `label`      | 获取标注的YOLO坐标                          |
| `getLabelsYoloCoordinate()`      | -            | 获取所有标注的YOLO坐标                      |
| `setLabelActive(uuid)`           | `uuid`       | 根据uuid设置标注的激活状态                  |
| `clearAllLabelActive()`          | -            | 清除所有标注的激活状态                      |
| `removeAllLabels()`              | -            | 移除所有标注                                |
| `removeLabelByUuid(uuid)`        | `uuid`       | 根据uuid移除一个标注                        |
| `setLabelByUuid(uuid, attr)`     | `uuid, attr` | 根据uuid设置label信息. `attr`类型是`object` |
| `getLabelByUuid(uuid)`           | `uuid`       | 根据uuid获取标注                            |
| `setReadOnly(readOnly)`          | `readOnly`   | 设置只读模式.`readOnly`类型是`boolean`      |