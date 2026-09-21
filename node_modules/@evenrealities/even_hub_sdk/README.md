# @evenrealities/even_hub_sdk

TypeScript SDK for Even App WebView pages.

[![npm version](https://img.shields.io/npm/v/@evenrealities/even_hub_sdk.svg)](https://www.npmjs.com/package/@evenrealities/even_hub_sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)

**English** | [中文](README.zh-CN.md)

## ⚡️ Quick Start

```bash
npm install @evenrealities/even_hub_sdk
```

```ts
import { waitForEvenAppBridge } from '@evenrealities/even_hub_sdk';

const bridge = await waitForEvenAppBridge();

const user = await bridge.getUserInfo();
const device = await bridge.getDeviceInfo();

await bridge.setLocalStorage('theme', 'dark');
const theme = await bridge.getLocalStorage('theme');

console.log(user.name, device?.model, theme);
```

Use this SDK when your page runs inside Even App WebView and needs:

- App bridge calls: user, device, storage.
- App capabilities: location, album, camera.
- Glasses UI: startup containers, rebuild, contextual menus, text/image updates.
- Sensors and events: MIC, IMU, launch source, device status.

## 📦 Install

```bash
npm install @evenrealities/even_hub_sdk
# or
pnpm add @evenrealities/even_hub_sdk
# or
yarn add @evenrealities/even_hub_sdk
```

Requirements:

- SDK version: `0.0.15`
- Even App: `2.2.10` or later
- Node.js: `^20.0.0 || >=22.0.0`
- Runtime: Even App WebView with `window.flutter_inappwebview.callHandler`

## 🔧 Common Usage

### Launch Source

The host pushes launch source once after WebView loading completes.

```ts
const bridge = await waitForEvenAppBridge();

const unsubscribe = bridge.onLaunchSource((source) => {
  if (source === 'glassesMenu') {
    console.log('Opened from glasses menu');
  }
});

// unsubscribe();
```

Values:

- `appMenu`
- `glassesMenu`

### Device Status

```ts
import {
  DeviceConnectType,
  waitForEvenAppBridge,
} from '@evenrealities/even_hub_sdk';

const bridge = await waitForEvenAppBridge();

const unsubscribe = bridge.onDeviceStatusChanged((status) => {
  if (status.connectType === DeviceConnectType.Connected) {
    console.log('Battery:', status.batteryLevel);
  }
});

// unsubscribe();
```

### App Location

```ts
import {
  AppLocationAccuracy,
  waitForEvenAppBridge,
} from '@evenrealities/even_hub_sdk';

const bridge = await waitForEvenAppBridge();

const location = await bridge.getAppLocation({
  accuracy: AppLocationAccuracy.High,
  timeoutMs: 5000,
});

if (location) {
  console.log(location.latitude, location.longitude);
}
```

Continuous updates:

```ts
await bridge.startAppLocationUpdates({
  accuracy: AppLocationAccuracy.Medium,
  intervalMs: 1000,
  distanceFilter: 5,
});

const unsubscribeLocation = bridge.onAppLocationChanged((location) => {
  console.log('Location:', location.latitude, location.longitude);
});

// await bridge.stopAppLocationUpdates();
// unsubscribeLocation();
```

### Album and Camera

Album selection is single-select only.

```ts
const albumImage = await bridge.pickImageFromAlbum();
if (albumImage) {
  console.log(albumImage.name, albumImage.mimeType, albumImage.size);
  // Use albumImage.base64 in the Web page.
}

const cameraImage = await bridge.captureImageFromCamera();
if (cameraImage) {
  console.log('Captured:', cameraImage.name);
}
```

`AppImageAsset`:

```ts
type AppImageAsset = {
  path: string;
  name: string;
  mimeType: string;
  size: number;
  base64: string;
};
```

### MIC Source

Choose glasses MIC or phone MIC.

```ts
import {
  AudioInputSource,
  AudioSpeakerRole,
  waitForEvenAppBridge,
} from '@evenrealities/even_hub_sdk';

const bridge = await waitForEvenAppBridge();

await bridge.audioControl(true, AudioInputSource.Glasses);
// await bridge.audioControl(true, AudioInputSource.Phone);

const unsubscribeAudio = bridge.onEvenHubEvent((event) => {
  const audio = event.audioEvent;
  if (!audio) return;

  console.log(audio.source); // AudioInputSource.Glasses | AudioInputSource.Phone
  console.log(audio.audioPcm.length); // Uint8Array
  console.log(audio.direction); // signed int16 or null
  console.log(audio.speakerRole); // AudioSpeakerRole.Self | Other | Unknown

  if (audio.speakerRole === AudioSpeakerRole.Self) {
    console.log('The App algorithm classified this frame as self speech');
  }
});

// await bridge.audioControl(false);
// unsubscribeAudio();
```

Notes:

- Default source: `AudioInputSource.Glasses`.
- Audio data arrives through `onEvenHubEvent`.
- For glasses MIC, create the startup page first.
- Glasses `direction` is the raw signed int16 direction tag for the same processed PCM frame; the SDK does not convert its unit or range.
- `speakerRole` is the App audio algorithm result, not a firmware identity assertion.
- Phone MIC and older Host payloads use `direction: null` and `AudioSpeakerRole.Unknown`.

### IMU

```ts
import {
  ImuReportPace,
  OsEventTypeList,
  waitForEvenAppBridge,
} from '@evenrealities/even_hub_sdk';

const bridge = await waitForEvenAppBridge();

await bridge.imuControl(true, ImuReportPace.P500);

const unsubscribeImu = bridge.onEvenHubEvent((event) => {
  const sys = event.sysEvent;
  if (sys?.eventType !== OsEventTypeList.IMU_DATA_REPORT) return;
  if (!sys.imuData) return;

  console.log(sys.imuData.x, sys.imuData.y, sys.imuData.z);
});

// await bridge.imuControl(false);
// unsubscribeImu();
```

`ImuReportPace` values are protocol pacing codes: `P100` through `P1000`.

## 🕶️ Glasses UI

Call `createStartUpPageContainer` before other glasses UI operations.

```ts
import {
  ImageContainerProperty,
  ImageRawDataUpdateResult,
  ListContainerProperty,
  MenuContainerProperty,
  StartUpPageCreateResult,
  TextContainerProperty,
  waitForEvenAppBridge,
} from '@evenrealities/even_hub_sdk';

const bridge = await waitForEvenAppBridge();

const listObject: ListContainerProperty[] = [{
  xPosition: 100,
  yPosition: 50,
  width: 200,
  height: 150,
  containerID: 1,
  containerName: 'list-1',
  zOrderIndex: 1,
  itemContainer: {
    itemCount: 3,
    itemName: ['Item 1', 'Item 2', 'Item 3'],
  },
  isEventCapture: 1,
}];

const textObject: TextContainerProperty[] = [{
  xPosition: 100,
  yPosition: 220,
  width: 200,
  height: 50,
  containerID: 2,
  containerName: 'text-1',
  zOrderIndex: 2,
  content: 'Hello',
  textColor: 4,
  isEventCapture: 0,
}];

const imageObject: ImageContainerProperty[] = [{
  xPosition: 320,
  yPosition: 50,
  width: 100,
  height: 80,
  containerID: 3,
  containerName: 'image-1',
  zOrderIndex: 3,
}];

const menuObject: MenuContainerProperty = {
  menuItems: [{
    itemName: 'Pause',
    itemID: 1,
  }, {
    itemName: 'Resume',
    itemID: 2,
  }],
};

const result = await bridge.createStartUpPageContainer({
  containerTotalNum: 3,
  listObject,
  textObject,
  imageObject,
  menuObject,
});

if (result === StartUpPageCreateResult.success) {
  await bridge.textContainerUpgrade({
    containerID: 2,
    containerName: 'text-1',
    content: 'Updated',
    textColor: 2,
  });
}
```

`textColor` is optional and accepts integer brightness levels from `0` to `4`. Omit it when creating/rebuilding to use the device default level `4`; omit it from `textContainerUpgrade` to keep the current brightness. The SDK rejects values outside `0..4` before calling the host.

Update image content:

Image raw data is compressed with LZ4 internally to reduce transfer size while keeping decoding fast on-device.

```ts
const imageResult = await bridge.updateImageRawData({
  containerID: 3,
  containerName: 'image-1',
  imageData: [/* grayscale bytes */],
});

if (imageResult !== ImageRawDataUpdateResult.success) {
  console.warn('Image update failed:', imageResult);
}
```

Rebuild the page:

```ts
await bridge.rebuildPageContainer({
  containerTotalNum: 1,
  textObject: [{
    xPosition: 100,
    yPosition: 80,
    width: 240,
    height: 60,
    containerID: 4,
    containerName: 'status-text',
    content: 'Ready',
    isEventCapture: 1,
  }],
});
```

Clear the custom menu during rebuild by omitting `menuObject`:

```ts
await bridge.rebuildPageContainer({
  containerTotalNum: 1,
  textObject: [/* ... */],
});
```

Handle contextual menu events:

```ts
const unsubscribeMenu = bridge.onEvenHubEvent((event) => {
  if (event.menuItemClickEvent) {
    console.log('Action item:', event.menuItemClickEvent.itemID);
  }
});

// unsubscribeMenu();
```

Handle long press and release:

```ts
const unsubscribePress = bridge.onEvenHubEvent((event) => {
  const pressEvent = event.sysEvent;
  if (!pressEvent) return;

  if (pressEvent.eventType === OsEventTypeList.LONG_PRESS_EVENT) {
    console.log('Long press started from', pressEvent.eventSource);
  } else if (pressEvent.eventType === OsEventTypeList.LONG_PRESS_RELEASE_EVENT) {
    console.log('Long press released from', pressEvent.eventSource);
  }
});

// unsubscribePress();
```

`LONG_PRESS_EVENT` has PB value `9`; `LONG_PRESS_RELEASE_EVENT` has PB value `10`. Current source-aware pushes are delivered as `sysEvent`, whose `eventSource` preserves the PB `EventSourceType` (`GLASSES_R`, `RING`, or `GLASSES_L`) rather than dropping the input origin.

Listen for list, text, and system events:

```ts
const unsubscribeHub = bridge.onEvenHubEvent((event) => {
  if (event.listEvent) {
    console.log('Selected:', event.listEvent.currentSelectItemName);
  }
  if (event.textEvent) {
    console.log('Text event:', event.textEvent.containerName);
  }
  if (event.sysEvent) {
    console.log('System event:', event.sysEvent.eventType);
  }
});

// unsubscribeHub();
```

Close the glasses page:

```ts
await bridge.shutDownPageContainer(0);
// await bridge.shutDownPageContainer(1); // ask foreground layer to decide
```

Rules:

- Coordinate origin: top-left.
- `containerTotalNum`: `1` to `12`.
- `textObject`: max `8`.
- Exactly one container should use `isEventCapture: 1`.
- Image containers need `updateImageRawData` after creation.
- `zOrderIndex` is optional only when every container on the same page omits it, which keeps old SDK pages compatible.
- If any container on the same page sets `zOrderIndex`, every list/text/image container on that page must set it.
- `zOrderIndex` values must be unique on the same page; larger values are rendered closer to the front.
- When these `zOrderIndex` rules are violated, the SDK logs an `EvenHubPageContainerValidationErrorCode` error before calling native. `createStartUpPageContainer` returns `StartUpPageCreateResult.invalid`; `rebuildPageContainer` returns `false`.
- `menuObject.menuItems`: max `10`; each top-level `itemID` must be non-zero and unique.
- Menu `itemName`: max `32` UTF-8 bytes.
- Invalid menu count, ID, or name is rejected before calling native. Rebuild without `menuObject` clears the custom menu and restores default registration.
- Long press and release remain regular list/text/sys events and are exposed as `OsEventTypeList.LONG_PRESS_EVENT` and `OsEventTypeList.LONG_PRESS_RELEASE_EVENT`.

## 📚 API Map

### Bridge

| API | Returns |
| --- | --- |
| `waitForEvenAppBridge()` | `Promise<EvenAppBridge>` |
| `EvenAppBridge.getInstance()` | `EvenAppBridge` |
| `callEvenApp(method, params?)` | `Promise<any>` |

### App

| API | Returns |
| --- | --- |
| `getUserInfo()` | `Promise<UserInfo>` |
| `getDeviceInfo()` | `Promise<DeviceInfo \| null>` |
| `setLocalStorage(key, value)` | `Promise<boolean>` |
| `getLocalStorage(key)` | `Promise<string>` |
| `getAppLocation(options?)` | `Promise<AppLocation \| null>` |
| `startAppLocationUpdates(options?)` | `Promise<boolean>` |
| `stopAppLocationUpdates()` | `Promise<boolean>` |
| `pickImageFromAlbum()` | `Promise<AppImageAsset \| null>` |
| `captureImageFromCamera()` | `Promise<AppImageAsset \| null>` |

### Events

| API | Event |
| --- | --- |
| `onLaunchSource(callback)` | `appMenu` / `glassesMenu` |
| `onDeviceStatusChanged(callback)` | device status |
| `onAppLocationChanged(callback)` | App location |
| `onEvenHubEvent(callback)` | list / text / sys / audio / contextual menu |

`AudioEvent` exposes `audioPcm`, `source`, `direction`, and `speakerRole`.

### EvenHub

| API | Returns |
| --- | --- |
| `createStartUpPageContainer(container)` | `Promise<StartUpPageCreateResult>` |
| `rebuildPageContainer(container)` | `Promise<boolean>` |
| `updateImageRawData(data)` | `Promise<ImageRawDataUpdateResult>` |
| `textContainerUpgrade(container)` | `Promise<boolean>` |
| `audioControl(isOpen, source?: AudioInputSource)` | `Promise<boolean>` |
| `imuControl(isOpen, reportFrq?)` | `Promise<boolean>` |
| `shutDownPageContainer(exitMode?)` | `Promise<boolean>` |

## 🧯 Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Flutter handler not available` | Run inside Even App WebView. Browser-only pages cannot call native APIs. |
| No launch source received | Register `onLaunchSource` early. The host pushes it once after load. |
| Glasses MIC returns `false` | Create the startup page first, then call `audioControl(true, AudioInputSource.Glasses)`. |
| No continuous location updates | Call `startAppLocationUpdates`, then keep `onAppLocationChanged` subscribed. |
| Image is not displayed on glasses | Create/rebuild the image container, then call `updateImageRawData`. |

## 📜 Changelog

### 0.0.15

- Raised the minimum supported Even App version to `2.2.10`.
- Long-press and release `sysEvent` payloads preserve `eventSource`, allowing callers to distinguish the right temple, ring, and left temple.

### 0.0.14

- Raised the minimum supported Even App version to `2.2.9`.
- Added first-level contextual menu models on startup/rebuild containers.
- Added first-level `menuItemClickEvent` parsing through `onEvenHubEvent`.
- Added SDK-side first-level menu validation for count, ID uniqueness, and UTF-8 name length.
- Added `LONG_PRESS_EVENT(9)` and `LONG_PRESS_RELEASE_EVENT(10)` parsing for list, text, and system events.
- Added optional `textColor` support for text containers and incremental text updates, with brightness levels from `0` to `4`.
- Added processed audio `direction` and `AudioSpeakerRole`; phone MIC and older Host payloads safely fall back to `null` and `Unknown`.

### 0.0.13

- Added minimum supported Even App version metadata. The minimum supported version is `2.2.6`.

### 0.0.12

- Added `zOrderIndex` support for list, text, and image containers to control front/back stacking order across multiple page containers.
- Image raw data updates now use LZ4 compression internally, reducing transfer size while keeping encode/decode fast for lower image update latency.

### 0.0.11

- Added App location APIs: one-shot location and continuous updates.
- Added App album image picker, single-select only.
- Added App camera capture API.
- Added MIC source selection: `glasses` or `phone`.

### 0.0.10

- Enhanced WebView background keep-alive.

### 0.0.9

- Improved `EventSourceType` compatibility.
- Added default source enum fallback.
- Refined event source parsing.

### 0.0.8

- Added launch source events: `appMenu` / `glassesMenu`.
- Expanded startup containers from `4` to `12`.
- Added IMU control and IMU data events.

### 0.0.1

- Initial bridge, storage, device info, EvenHub protocol, and event APIs.

## 📄 License

[MIT](LICENSE)
