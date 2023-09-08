# simple-image-label

Simple image label use in JavaScript , support YOLO label point for object detection or deep-learning.

## Preview

![preview](preview.png)

## Use in your project

### Install simple-image-label
```bash
# npm
npm install simple-image-label -S
# yarn
yarn add simple-image-label
# pnpm
pnpm add simple-image-label
```
### Usage

```html
<div id="YourElementId"></div>
```

```js
// use require
const SimpleImageLabel = require('../libs/simpleImageLabel').default
// use es6 import
import SimpleImageLabel from '../libs/simpleImageLabel'
// use simple image label in your html element, must use id selector
const simpleImageLabel = new SimpleImageLabe({
    el: 'YourElementId', 
    imageUrl: 'yourImageUrl', 
    labels: [],
    contextmenu: (e) => {
        // mouse right click event
    },
    labelClick: (label) => {
        // label click event
    },
    error: (err) => {
        // error event
        console.log(err);
    }
});
```

## Develop & Install & Run demo

Install
```bash
# npm
npm install
# yarn
yarn
# pnpm
pnpm install
```

Run
```bash
# npm
npm run start
# yarn
yarn start
# pnpm
pnpm run start
```

Build
```bash
# npm
npm run build
# yarn
yarn build
# pnpm
pnpm run build
```

## API

### `SimpleImageLabel options`
| Property      | Type       | Description       |
| ------------- | ---------- | ----------------- |
| `el`          | `string`   | Html element id   |
| `imageUrl`    | `string`   | Image path        |
| `labels`      | `array`    | default labels    |
| `contextmenu` | `function` | right click event |
| `labelClick`  | `function` | left click event  |
| `error`       | `function` | error event       |


### `SimpleImageLabel function`
| function                         | params       | Description                     |
| -------------------------------- | ------------ | ------------------------------- |
| `getLabels()`                    | -            | Get all labels                  |
| `activeLabel()`                  | -            | Get active label                |
| `setImage(imageUrl)`             | `imageUrl`   | Set image                       |
| `setLabels(labels)`              | `labels`     | Set labels                      |
| `getImageInfo()`                 | -            | Get image width and height      |
| `getCoordinate(label)`           | `label`      | Get label coordinate            |
| `getLabelsCoordinate()`          | -            | Get all labels coordinate       |
| `convertToYoloCoordinate(label)` | `label`      | Get label YOLO coordinate       |
| `getLabelsYoloCoordinate()`      | -            | Get all labels YOLO coordinate  |
| `setLabelActive(uuid)`           | `uuid`       | Set label active status by uuid |
| `clearAllLabelActive()`          | -            | Clear active status             |
| `removeAllLabels()`              | -            | Remove all labels               |
| `removeLabelByUuid(uuid)`        | `uuid`       | Remove a label by uuid          |
| `setLabelByUuid(uuid, attr)`     | `uuid, attr` | Set label attr by uuid          |
| `getLabelByUuid(uuid)`           | `uuid`       | Get label by uuid               |