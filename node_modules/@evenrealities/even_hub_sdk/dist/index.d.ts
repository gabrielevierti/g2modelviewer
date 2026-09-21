/**
 * Even App 方法枚举
 *
 * 用于定义 Web 页面可以调用的 Even App 方法
 * 使用枚举可以避免硬编码字符串，提高代码可维护性
 */
declare enum EvenAppMethod {
    /** 获取用户信息 */
    GetUserInfo = "getUserInfo",
    /** 获取眼镜/设备信息 */
    GetGlassesInfo = "getGlassesInfo",
    /** 设置本地存储 */
    SetLocalStorage = "setLocalStorage",
    /** 获取本地存储 */
    GetLocalStorage = "getLocalStorage",
    /** 获取 App 当前位置 */
    GetAppLocation = "getAppLocation",
    /** 开始监听 App 位置更新 */
    StartAppLocationUpdates = "startAppLocationUpdates",
    /** 停止监听 App 位置更新 */
    StopAppLocationUpdates = "stopAppLocationUpdates",
    /** 从 App 相册选择图片 */
    PickImageFromAlbum = "pickImageFromAlbum",
    /** 从 App 相机拍摄图片 */
    CaptureImageFromCamera = "captureImageFromCamera",
    /** EvenHub - 创建启动页容器 */
    CreateStartUpPageContainer = "createStartUpPageContainer",
    /** EvenHub - 重建页面容器 */
    RebuildPageContainer = "rebuildPageContainer",
    /** EvenHub - 更新图片原始数据 */
    UpdateImageRawData = "updateImageRawData",
    /** EvenHub - 文本容器升级 */
    TextContainerUpgrade = "textContainerUpgrade",
    /** EvenHub - MIC 控制（音频控制） */
    AudioControl = "audioControl",
    /** EvenHub - IMU 控制 */
    ImuControl = "imuControl",
    /** EvenHub - 关闭页面容器 */
    ShutDownPageContainer = "shutDownPageContainer"
}
/**
 * Even App 消息类型枚举
 *
 * 用于定义 Even App 和 WebView 之间传递的消息类型
 */
declare enum EvenAppMessageType {
    /** Web 页面调用 Even App 方法 */
    CallEvenAppMethod = "call_even_app_method",
    /** Web 页面监听 Even App 通知 */
    ListenEvenAppNotify = "listen_even_app_data"
}
/**
 * Bridge 事件枚举
 *
 * 用于定义 Bridge 触发的自定义事件名称
 * 使用枚举可以避免硬编码字符串，方便事件名称的管理和查找
 */
declare enum BridgeEvent {
    /** 桥接就绪事件 - 当桥接初始化完成时触发 */
    BridgeReady = "evenAppBridgeReady",
    /** 设备状态变化事件 - 当设备状态（连接状态、电量等）发生变化时触发 */
    DeviceStatusChanged = "deviceStatusChanged",
    /** EvenHub 事件 - 当 EvenHub (PB) 推送事件发生时触发 */
    EvenHubEvent = "evenHubEvent",
    /** 启动来源 - 页面就绪后由 SDK 推送一次（仅一次，reload 不会再次触发） */
    LaunchSource = "evenAppLaunchSource",
    /** App 位置变化事件 */
    AppLocationChanged = "appLocationChanged"
}

/**
 * 启动来源（Launch Source）
 *
 * 由 WebView 在 loading 完成后通过 Bridge 推送，表示本次页面在 APP 内是通过何种入口打开的。
 * 仅支持两种固定类型：appMenu、glassesMenu。
 */
type LaunchSource = 'appMenu' | 'glassesMenu';
/** 支持的启动来源取值 */
declare const LAUNCH_SOURCE_APP_MENU: LaunchSource;
declare const LAUNCH_SOURCE_GLASSES_MENU: LaunchSource;

/**
 * 用户信息类
 *
 * 用于描述 Even App 中的用户信息。
 */
declare class UserInfo {
    /** 用户 ID */
    uid: number;
    /** 用户名 */
    name: string;
    /** 用户头像 URL */
    avatar: string;
    /** 用户国家 */
    country: string;
    constructor(params: {
        uid: number;
        name: string;
        avatar: string;
        country: string;
    });
    /** 转换为 JSON 对象 */
    toJson(): Record<string, any>;
    /** 从 JSON 对象创建 UserInfo */
    static fromJson(json: any): UserInfo;
    /** 创建默认的 UserInfo 对象 */
    static createDefault(): UserInfo;
}

/**
 * 设备连接状态枚举
 *
 * 用于描述设备（眼镜/戒指等）的连接状态。
 * 注意：虽然当前多数场景来自 BLE，但这里不强绑定 BLE，因此命名为 DeviceConnectType。
 */
declare enum DeviceConnectType {
    /** 缺省状态，未初始化 */
    None = "none",
    /** 正在连接 */
    Connecting = "connecting",
    /** 连接成功 */
    Connected = "connected",
    /** 断开连接 */
    Disconnected = "disconnected",
    /** 连接失败 */
    ConnectionFailed = "connectionFailed"
}
declare namespace DeviceConnectType {
    /**
     * 从字符串值获取 DeviceConnectType 枚举
     *
     * @param value 字符串值
     * @returns 对应的 DeviceConnectType 枚举值，如果无法匹配则返回 None
     */
    function fromString(value: string): DeviceConnectType;
}

/**
 * 设备状态类
 *
 * 用于描述 Even 设备的实时状态信息。
 */
declare class DeviceStatus {
    /** 设备 SN（只读） */
    readonly sn: string;
    /** 连接状态 */
    connectType: DeviceConnectType;
    /** 是否佩戴中 */
    isWearing?: boolean;
    /** 电池电量 (0-100) */
    batteryLevel?: number;
    /** 是否正在充电 */
    isCharging?: boolean;
    /** 是否在充电盒中 */
    isInCase?: boolean;
    constructor(params: {
        sn: string;
        connectType?: DeviceConnectType;
        isWearing?: boolean;
        batteryLevel?: number;
        isCharging?: boolean;
        isInCase?: boolean;
    });
    /** 转换为 JSON 对象 */
    toJson(): Record<string, any>;
    /** 是否未初始化 */
    isNone(): boolean;
    /** 是否已连接 */
    isConnected(): boolean;
    /** 是否正在连接 */
    isConnecting(): boolean;
    /** 是否已断开 */
    isDisconnected(): boolean;
    /** 是否连接失败 */
    isConnectionFailed(): boolean;
    /** 从 JSON 对象创建 DeviceStatus */
    static fromJson(json: any): DeviceStatus;
    /** 创建默认的 DeviceStatus 对象 */
    static createDefault(sn?: string): DeviceStatus;
}

/**
 * 设备型号枚举
 *
 * 用于描述 Even 设备的具体型号
 */
declare enum DeviceModel {
    /** G1 眼镜 */
    G1 = "g1",
    /** G2 眼镜 */
    G2 = "g2",
    /** Ring1 戒指 */
    Ring1 = "ring1"
}
declare namespace DeviceModel {
    /**
     * 从字符串值获取 DeviceModel 枚举
     *
     * @param value 字符串值
     * @returns 对应的 DeviceModel 枚举值，如果无法匹配则返回 G1
     */
    function fromString(value: string): DeviceModel;
    /**
     * 检查设备型号是否是眼镜
     *
     * @param model 设备型号
     * @returns 是否是眼镜类型
     */
    function isGlasses(model: DeviceModel): boolean;
    /**
     * 检查设备型号是否是戒指
     *
     * @param model 设备型号
     * @returns 是否是戒指类型
     */
    function isRing(model: DeviceModel): boolean;
}

/**
 * 设备信息类
 *
 * 用于描述 Even 设备（眼镜/戒指）的基本信息。
 * - `model` / `sn` 创建后不可修改
 * - `status` 可更新，但要求 `status.sn === sn`
 */
declare class DeviceInfo {
    /** 设备型号（只读） */
    readonly model: DeviceModel;
    /** 设备序列号（只读） */
    readonly sn: string;
    /** 设备状态 */
    status: DeviceStatus;
    constructor(params: {
        model: DeviceModel;
        sn: string;
        status?: DeviceStatus;
    });
    /** 从 JSON 创建 DeviceInfo */
    static fromJson(json: any): DeviceInfo;
    /**
     * 更新设备状态（对齐 Dart `EhDeviceInfo.updateStatus` 的行为）。
     *
     * 说明：
     * - **原地更新** `this.status`
     * - 仅当 `status.sn === this.sn` 时才会更新
     * - 不一致时直接忽略（不修改）
     */
    updateStatus(status: DeviceStatus): void;
    /** 是否是眼镜 */
    isGlasses(): boolean;
    /** 是否是戒指 */
    isRing(): boolean;
    /** 转换为 JSON */
    toJson(): Record<string, any>;
}

declare enum AudioInputSource {
    Glasses = "glasses",
    Phone = "phone"
}
declare enum AppLocationAccuracy {
    Low = "low",
    Medium = "medium",
    High = "high"
}
interface AppLocation {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    timestamp?: number;
}
interface AppLocationOptions {
    accuracy?: AppLocationAccuracy;
    timeoutMs?: number;
    distanceFilter?: number;
    intervalMs?: number;
}
interface AppImageAsset {
    path: string;
    name: string;
    mimeType: string;
    size: number;
    base64: string;
}
declare function normalizeAudioInputSource(raw: any): AudioInputSource;
declare function appLocationFromJson(input: any): AppLocation | null;
declare function appImageAssetFromJson(input: any): AppImageAsset | null;

/**
 * EvenHub 错误码/结果码
 *
 * 对齐宿主 PB：EvenHub_ErrorCode_List（见 EvenHub.pbenum.dart）
 * 注意：宿主（Flutter）侧可能返回枚举的 name（string）或 value（number）。
 */
/** EvenHub 错误码名称（与 PB enum 的名字保持一致） */
declare enum EvenHubErrorCodeName {
    APP_REQUEST_CREATE_PAGE_SUCCESS = "APP_REQUEST_CREATE_PAGE_SUCCESS",
    APP_REQUEST_CREATE_INVAILD_CONTAINER = "APP_REQUEST_CREATE_INVAILD_CONTAINER",
    APP_REQUEST_CREATE_OVERSIZE_RESPONSE_CONTAINER = "APP_REQUEST_CREATE_OVERSIZE_RESPONSE_CONTAINER",
    APP_REQUEST_CREATE_OUTOFMEMORY_CONTAINER = "APP_REQUEST_CREATE_OUTOFMEMORY_CONTAINER",
    APP_REQUEST_UPGRADE_IMAGE_RAW_DATA_SUCCESS = "APP_REQUEST_UPGRADE_IMAGE_RAW_DATA_SUCCESS",
    APP_REQUEST_UPGRADE_IMAGE_RAW_DATA_FAILED = "APP_REQUEST_UPGRADE_IMAGE_RAW_DATA_FAILED",
    APP_REQUEST_REBUILD_PAGE_SUCCESS = "APP_REQUEST_REBUILD_PAGE_SUCCESS",
    APP_REQUEST_REBUILD_PAGE_FAILD = "APP_REQUEST_REBUILD_PAGE_FAILD",
    APP_REQUEST_UPGRADE_TEXT_DATA_SUCCESS = "APP_REQUEST_UPGRADE_TEXT_DATA_SUCCESS",
    APP_REQUEST_UPGRADE_TEXT_DATA_FAILED = "APP_REQUEST_UPGRADE_TEXT_DATA_FAILED",
    APP_REQUEST_UPGRADE_SHUTDOWN_SUCCESS = "APP_REQUEST_UPGRADE_SHUTDOWN_SUCCESS",
    APP_REQUEST_UPGRADE_SHUTDOWN_FAILED = "APP_REQUEST_UPGRADE_SHUTDOWN_FAILED",
    APP_REQUEST_UPGRADE_HEARTBEAT_PACKET_SUCCESS = "APP_REQUEST_UPGRADE_HEARTBEAT_PACKET_SUCCESS",
    APP_REQUEST_AUDIO_CTR_SUCCESS = "APP_REQUEST_AUDIO_CTR_SUCCESS",
    APP_REQUEST_AUDIO_CTR_FAILED = "APP_REQUEST_AUDIO_CTR_FAILED"
}
/** 兼容宿主返回 string 或 number 两种形式 */
type EvenHubErrorCode = EvenHubErrorCodeName | number | string;

/**
 * IMU 上报快慢档位，与设备/协议约定一致（wire 上为 100、200、…、1000 的整型编码）。
 */
declare enum ImuReportPace {
    P100 = 100,
    P200 = 200,
    P300 = 300,
    P400 = 400,
    P500 = 500,
    P600 = 600,
    P700 = 700,
    P800 = 800,
    P900 = 900,
    P1000 = 1000
}

/**
 * EvenHub container property models
 *
 * 仅做“字段模型 + JSON 字段映射”，不做任何 protobuf 编解码。
 * 字段名优先使用 JS 侧常见 camelCase，同时兼容宿主可能透出的 protoName（如 Container_ID / List_Object）。
 */
/**
 * ListItemContainerProperty
 *
 * 对齐 PB：`List_ItemContainerProperty`
 */
declare class ListItemContainerProperty {
    /** 对应 PB：Item_Count */
    itemCount?: number;
    /** 对应 PB：Item_Width */
    itemWidth?: number;
    /** 对应 PB：Is_Item_Select_Border_En（0/1） */
    isItemSelectBorderEn?: number;
    /** 对应 PB：Item_Name */
    itemName?: string[];
    constructor(data?: Partial<ListItemContainerProperty>);
    /**
     * 将宿主下发的 JSON 转成 `ListItemContainerProperty`
     * - 自动兼容 key：camelCase / protoName
     */
    static fromJson(json: any): ListItemContainerProperty;
    static toJson(model?: ListItemContainerProperty | Record<string, any>): Record<string, any>;
    toJson(): Record<string, any>;
}
/**
 * ListContainerProperty
 *
 * 对齐 PB：`ListContainerProperty`
 */
declare class ListContainerProperty {
    /** 对应 PB：X_Position */
    xPosition?: number;
    /** 对应 PB：Y_Position */
    yPosition?: number;
    /** 对应 PB：Width */
    width?: number;
    /** 对应 PB：Height */
    height?: number;
    /** 对应 PB：Border_Width */
    borderWidth?: number;
    /** 对应 PB：Border_Color */
    borderColor?: number;
    /** 对应 PB：Border_Radius */
    borderRadius?: number;
    /** 对应 PB：Padding_Length */
    paddingLength?: number;
    /** 对应 PB：Container_ID */
    containerID?: number;
    /** 对应 PB：Container_Name */
    containerName?: string;
    /** 对应 PB：Item_Container */
    itemContainer?: ListItemContainerProperty;
    /** 对应 PB：Is_event_capture（0/1） */
    isEventCapture?: number;
    /** 对应 PB：z_order_index，用于控制多个容器的前后叠放顺序。 */
    zOrderIndex?: number;
    constructor(data?: Partial<ListContainerProperty>);
    /**
     * 将宿主下发的 JSON 转成 `ListContainerProperty`
     * - 自动兼容 key：camelCase / protoName
     */
    static fromJson(json: any): ListContainerProperty;
    static toJson(model?: ListContainerProperty | Record<string, any>): Record<string, any>;
    toJson(): Record<string, any>;
}
/**
 * TextContainerProperty
 *
 * 对齐 PB：`TextContainerProperty`
 */
declare class TextContainerProperty {
    xPosition?: number;
    yPosition?: number;
    width?: number;
    height?: number;
    borderWidth?: number;
    borderColor?: number;
    borderRadius?: number;
    paddingLength?: number;
    containerID?: number;
    containerName?: string;
    isEventCapture?: number;
    /** 对应 PB：z_order_index，用于控制多个容器的前后叠放顺序。 */
    zOrderIndex?: number;
    /** 对应 PB：Content */
    content?: string;
    /**
     * 文本亮度（0~4）；创建或重建时省略该字段使用设备默认亮度 4。
     */
    textColor?: number;
    constructor(data?: Partial<TextContainerProperty>);
    /**
     * 将宿主下发的 JSON 转成 `TextContainerProperty`
     * - 自动兼容 key：camelCase / protoName
     */
    static fromJson(json: any): TextContainerProperty;
    static toJson(model?: TextContainerProperty | Record<string, any>): Record<string, any>;
    toJson(): Record<string, any>;
}
/**
 * ImageContainerProperty
 *
 * 对齐 PB：`ImageContainerProperty`
 */
declare class ImageContainerProperty {
    xPosition?: number;
    yPosition?: number;
    /** PB：Width，范围 20~288 */
    width?: number;
    /** PB：Height，范围 20~144 */
    height?: number;
    containerID?: number;
    containerName?: string;
    /** 对应 PB：z_order_index，用于控制多个容器的前后叠放顺序。 */
    zOrderIndex?: number;
    constructor(data?: Partial<ImageContainerProperty>);
    /**
     * 将宿主下发的 JSON 转成 `ImageContainerProperty`
     * - 自动兼容 key：camelCase / protoName
     */
    static fromJson(json: any): ImageContainerProperty;
    static toJson(model?: ImageContainerProperty | Record<string, any>): Record<string, any>;
    toJson(): Record<string, any>;
}
/**
 * ImageRawDataUpdateFields （暂时用不到，保留）
 *
 * 对齐 PB：`ImageRawDataUpdate`
 *
 * 注意 `mapRawData`：
 * - 推荐你在 JS 侧传 **number[]**（宿主 `List<int>` 最好接）
 * - 也允许传 base64 string（由宿主自行处理）
 */
declare class ImageRawDataUpdateFields {
    containerID?: number;
    containerName?: string;
    mapSessionId?: number;
    mapTotalSize?: number;
    mapFragmentIndex?: number;
    mapFragmentPacketSize?: number;
    /** bytes：建议传 number[]（List<int>）或 base64 string */
    mapRawData?: number[] | string | Uint8Array | ArrayBuffer;
    constructor(data?: Partial<ImageRawDataUpdateFields>);
    /** 从 JSON 中读取 ImageRawDataUpdateFields（兼容 key：camelCase / protoName） */
    static fromJson(json: any): ImageRawDataUpdateFields;
    /**
     * 转成宿主可接收的 JSON：
     * - `mapRawData` 如果是 Uint8Array/ArrayBuffer，会被转换为 number[]
     */
    static toJson(model?: ImageRawDataUpdateFields | Record<string, any>): Record<string, any>;
    toJson(): Record<string, any>;
}
/**
 * ImageUpdateRawData
 *
 * 对应宿主 Dart：`EvenHubImageContainer`
 *
 * 说明：
 * - 这里只做字段模型 + JSON 映射，不做 protobuf bytes 编解码
 * - `imageData` 建议传 **number[]**（宿主 `List<int>` 最好接）
 * - 若传 Uint8Array/ArrayBuffer，会在 `toJson` 时转换为 number[]
 */
declare class ImageRawDataUpdate {
    containerID?: number;
    containerName?: string;
    imageData?: number[] | string | Uint8Array | ArrayBuffer;
    constructor(data?: Partial<ImageRawDataUpdate>);
    /** 从宿主 JSON 生成 `EvenHubImageContainer`（兼容 key：camelCase / protoName） */
    static fromJson(json: any): ImageRawDataUpdate;
    static toJson(model?: ImageRawDataUpdate | Record<string, any>): Record<string, any>;
    static normalizeImageData(raw: any): number[] | string | undefined;
    toJson(): Record<string, any>;
}

/** PB model: a first-level contextual-menu action item. */
declare class MenuItemProperty {
    /** Label rendered by the glasses OS; limited to 32 UTF-8 bytes. */
    itemName?: string;
    /** Non-zero protobuf uint32 identifier, unique in the top-level menu. */
    itemID?: number;
    /** Build a public model; protocol constraints are checked by page validation. */
    constructor(data?: Partial<MenuItemProperty>);
    /** Normalize camelCase and protobuf-style keys into the public first-level item. */
    static fromJson(input: any): MenuItemProperty;
    /** Serialize an instance or plain object for the host mapper. */
    static toJson(model?: MenuItemProperty | Record<string, any>): Record<string, any>;
    /** Return only the supported first-level fields to avoid exposing unimplemented menu shapes. */
    toJson(): Record<string, any>;
}
/** PB model: MenuContainerProperty, attached to create/rebuild as `menuObject`. */
declare class MenuContainerProperty {
    /** Top-level contextual-menu entries in payload order; firmware accepts at most 10. */
    menuItems?: MenuItemProperty[];
    /** Build a menu container; item-count and identifier checks run before bridge calls. */
    constructor(data?: Partial<MenuContainerProperty>);
    /** Normalize the menu container and recursively parse all top-level entries. */
    static fromJson(input: any): MenuContainerProperty;
    /** Serialize an instance or plain object and recursively normalize menu entries. */
    static toJson(model?: MenuContainerProperty | Record<string, any>): Record<string, any>;
    /** Return the contextual-menu payload consumed by create/rebuild host mapping. */
    toJson(): Record<string, any>;
}
/** OS -> APP action item click event. */
declare class MenuItemClickEvent {
    /** Identifier of the top-level action item selected on the glasses. */
    itemID?: number;
    /** Build an event model from already-normalized application data. */
    constructor(data?: Partial<MenuItemClickEvent>);
    /** Parse the stable click event while accepting protobuf-style identifier keys. */
    static fromJson(input: any): MenuItemClickEvent;
    /** Convert a parsed event or plain object into a replayable event payload. */
    static toJson(model?: MenuItemClickEvent | Record<string, any>): Record<string, any>;
    /** Preserve the parsed event as a plain camelCase object. */
    toJson(): Record<string, any>;
}
/** Count protocol bytes, retaining a fallback for runtimes without `TextEncoder`. */
declare function utf8ByteLength(value: string): number;
/** Missing labels remain parser-compatible; present labels must fit firmware storage. */
declare function isMenuNameWithinLimit(value?: string): boolean;
/** All menu identifiers are protobuf uint32 values and zero is reserved. */
declare function isValidMenuItemID(value?: number): value is number;

/**
 * EvenHub JSON utils
 *
 * 说明：
 * - 这里只做“JSON 字段取值/简单类型转换”，**不做 protobuf 编解码**
 * - 主要用于兼容宿主侧可能下发的不同 key 命名：camelCase / protoName（如 Container_ID）
 */
type JsonRecord = Record<string, any>;
/**
 * 判断是否是 plain object（非数组）。
 *
 * - `null` / `undefined` -> false
 * - `[]` -> false
 * - `{}` -> true
 */
declare function isObjectRecord(v: any): v is JsonRecord;
/**
 * 从对象中按优先级读取第一个存在的 key。
 *
 * @example
 * pick(json, 'containerID', 'ContainerID', 'Container_ID')
 */
declare function pick<T = any>(obj: any, ...keys: string[]): T | undefined;
/**
 * 将 key 归一化（用于宽松匹配）：
 * - 去掉 `_`
 * - 转小写
 *
 * 例如：
 * - `Container_ID` -> `containerid`
 * - `CurrentSelect_ItemIndex` -> `currentselectitemindex`
 */
declare function normalizeLooseKey(key: string): string;
/**
 * 宽松读取字段：优先精确匹配 keys，其次做 “去下划线+忽略大小写” 匹配。
 *
 * 用于兼容：
 * - `containerID`
 * - `ContainerID`
 * - `Container_ID`
 */
declare function pickLoose<T = any>(obj: any, ...keys: string[]): T | undefined;
/**
 * 将任意值尽量转换为 number（无法转换则返回 undefined）。
 *
 * 说明：
 * - 兼容宿主侧可能把数字以 string 形式下发（例如 `"12"`）
 */
declare function toNumber(v: any): number | undefined;
/**
 * 将任意值尽量转换为 string（无法转换则返回 undefined）。
 *
 * 说明：
 * - number/bool 会被 String(...) 转为 `"1"` / `"true"` 等
 */
declare function toString(v: any): string | undefined;
/**
 * 从对象里读取 number：
 * - 支持宽松 key 匹配（camelCase / protoName）
 * - 支持 string->number
 */
declare function readNumber(obj: any, ...keys: string[]): number | undefined;
/**
 * 从对象里读取 string：
 * - 支持宽松 key 匹配（camelCase / protoName）
 * - 会把 number/bool 转成 string
 */
declare function readString(obj: any, ...keys: string[]): string | undefined;
/**
 * 将任意值转换为 Record（非对象/数组则返回 `{}`）。
 *
 * 常用于：
 * - `payload` / `data` 不是 object 时，避免解析函数抛错
 */
declare function toObjectRecord(v: any): JsonRecord;
/**
 * 将 bytes-like 数据转换为 JSON-friendly 的 payload：
 * - **string**：原样返回（通常是 base64）
 * - **Uint8Array / ArrayBuffer**：转为 number[]（便于宿主按 `List<int>` 接收）
 * - **number[]**：归一化到 0-255
 *
 * 注意：这不是 protobuf bytes 的编码/解码，只是为了让 JSON.stringify 可用。
 */
declare function bytesToJson(v: any): number[] | string | undefined;

type EvenHubPageContainerLike = {
    listObject?: Array<ListContainerProperty | Record<string, any>>;
    textObject?: Array<TextContainerProperty | Record<string, any>>;
    imageObject?: Array<ImageContainerProperty | Record<string, any>>;
    /** Custom contextual menu; omission is significant for rebuild because it clears the menu. */
    menuObject?: MenuContainerProperty | Record<string, any>;
};
type EvenHubContainerKind = 'listObject' | 'textObject' | 'imageObject';
type EvenHubContainerRef = {
    kind: EvenHubContainerKind;
    index: number;
    zOrderIndex?: unknown;
};
declare enum EvenHubPageContainerValidationErrorCode {
    MissingZOrderIndex = "MISSING_Z_ORDER_INDEX",
    InvalidZOrderIndex = "INVALID_Z_ORDER_INDEX",
    DuplicateZOrderIndex = "DUPLICATE_Z_ORDER_INDEX",
    /** The page declares more top-level entries than firmware can render. */
    TooManyMenuItems = "TOO_MANY_MENU_ITEMS",
    /** A menu identifier is zero, non-integral, negative, or outside uint32. */
    InvalidMenuItemID = "INVALID_MENU_ITEM_ID",
    /** An identifier is reused in the top-level menu. */
    DuplicateMenuItemID = "DUPLICATE_MENU_ITEM_ID",
    /** A displayed menu label exceeds the 32-byte UTF-8 protocol limit. */
    InvalidMenuItemName = "INVALID_MENU_ITEM_NAME",
    /** A text container declares a brightness outside the firmware range 0..4. */
    InvalidTextBrightness = "INVALID_TEXT_BRIGHTNESS"
}
type EvenHubPageContainerValidationResult = {
    valid: true;
} | {
    valid: false;
    code: EvenHubPageContainerValidationErrorCode;
    message: string;
    container?: EvenHubContainerRef;
    duplicateOf?: EvenHubContainerRef;
};
/** Validate optional text brightness without erasing the meaningful omitted state. */
declare function validateEvenHubPageContainerTextBrightness(container: EvenHubPageContainerLike): EvenHubPageContainerValidationResult;
/**
 * Validate same-page z-order rules before the payload reaches the native bridge.
 * Omitting zOrderIndex everywhere remains valid for older SDK/app pages.
 */
declare function validateEvenHubPageContainerZOrder(container: EvenHubPageContainerLike): EvenHubPageContainerValidationResult;
/**
 * Validate OS contextual menu limits before create/rebuild reaches native.
 * An omitted menuObject is valid and, for rebuild, means clearing the custom menu.
 */
declare function validateEvenHubPageContainerMenu(container: EvenHubPageContainerLike): EvenHubPageContainerValidationResult;
/** Validate every SDK-side page container rule that can reject a native call. */
declare function validateEvenHubPageContainer(container: EvenHubPageContainerLike): EvenHubPageContainerValidationResult;
declare function formatEvenHubPageContainerValidationError(result: Exclude<EvenHubPageContainerValidationResult, {
    valid: true;
}>): string;

/**
 * Start-up page container create result (host -> Web)
 *
 * Align with host (Dart) `EhStartUpPageCreateResult`:
 * - 0 = success
 * - 1 = invalid
 * - 2 = oversize
 * - 3 = outOfMemory
 */
declare enum StartUpPageCreateResult {
    /** 成功 = 0 */
    success = 0,
    /** 无效 = 1 */
    invalid = 1,
    /** 超限 = 2 */
    oversize = 2,
    /** 内存不足 = 3 */
    outOfMemory = 3
}
declare namespace StartUpPageCreateResult {
    /**
     * Convert host int to `StartUpPageCreateResult`.
     *
     * Notes:
     * - Out of range -> `invalid` (safe default)
     */
    function fromInt(value: number): StartUpPageCreateResult;
    /**
     * Best-effort normalization for host return value.
     *
     * Host recommended return type is `int`, but we keep it tolerant:
     * - number: 0~3
     * - numeric string: "0"~"3"
     */
    function normalize(raw: any): StartUpPageCreateResult;
}

/**
 * Send image result (host -> Web)
 *
 * Align with host (Dart) `BleEhSendImageResult`:
 * - 0 = success
 * - 1 = imageException
 * - 2 = imageSizeInvalid / imageToGray4Failed
 * - 3 = sendFailed
 */
declare enum ImageRawDataUpdateResult {
    /** 成功 */
    success = "success",
    /** 图片异常 */
    imageException = "imageException",
    /** 图片尺寸不合规 */
    imageSizeInvalid = "imageSizeInvalid",
    /** 图片转黑白图失败 */
    imageToGray4Failed = "imageToGray4Failed",
    /** 发送失败 */
    sendFailed = "sendFailed"
}
declare namespace ImageRawDataUpdateResult {
    /** Convert enum to host int code. */
    function valueCode(value: ImageRawDataUpdateResult): number;
    /**
     * Convert host int to `BleEhSendImageResult`.
     *
     * Notes:
     * - 2 -> `imageSizeInvalid` (host may also mean `imageToGray4Failed`)
     */
    function fromInt(value: number): ImageRawDataUpdateResult;
    /**
     * Best-effort normalization for host return value.
     *
     * Host recommended return type is `int`, but we keep it tolerant:
     * - number: 0~3
     * - numeric string: "0"~"3"
     * - enum string: "BleEhSendImageResult.success" / "success"
     */
    function normalize(raw: any): ImageRawDataUpdateResult;
    /** 是否成功 */
    function isSuccess(value: ImageRawDataUpdateResult): boolean;
    /** 是否图片异常 */
    function isImageException(value: ImageRawDataUpdateResult): boolean;
    /** 是否图片尺寸不合规 */
    function isImageSizeInvalid(value: ImageRawDataUpdateResult): boolean;
    /** 是否图片转黑白图失败 */
    function isImageToGray4Failed(value: ImageRawDataUpdateResult): boolean;
    /** 是否发送失败 */
    function isSendFailed(value: ImageRawDataUpdateResult): boolean;
}

/**
 * CreateStartUpPageContainer
 *
 * 对应宿主 PB：CreateStartUpPageContainer
 *
 * 约束（与 PB 一致）：
 * - `containerTotalNum`：1~12
 * - `textObject`：最多 8 项
 * - `imageObject`：最多 4 项
 *
 * 这里只定义模型字段，不做 protobuf 编解码。
 */

declare class CreateStartUpPageContainer {
    /** 对应 PB：ContainerTotalNum（1~12） */
    containerTotalNum?: number;
    /** 对应 PB：List_Object */
    listObject?: ListContainerProperty[];
    /** 对应 PB：Text_Object（max_count 8） */
    textObject?: TextContainerProperty[];
    /** 对应 PB：Image_Object（max_count 4） */
    imageObject?: ImageContainerProperty[];
    /** 对应 PB：Menu_Object；存在且合法时为当前页面注册自定义上下文菜单。 */
    menuObject?: MenuContainerProperty;
    /** 对应 PB：widgetId；通常由 bridge 自动注入，无需手动传。 */
    widgetId?: number;
    constructor(data?: Partial<CreateStartUpPageContainer>);
    /**
     * 从宿主 JSON 生成 `CreateStartUpPageContainer`
     * - 自动兼容 key：camelCase / protoName（如 List_Object）
     */
    static fromJson(json: any): CreateStartUpPageContainer;
    /**
     * 转为宿主可消费的 JSON（不会做 protobuf 编码，只是字段透传/规范化）
     */
    static toJson(model?: CreateStartUpPageContainer | Record<string, any>): Record<string, any>;
    toJson(): Record<string, any>;
}

/**
 * RebuildPageContainer
 *
 * 对应宿主 PB：RebuildPageContainer
 *
 * 约束（与 PB 一致）：
 * - `containerTotalNum`：1~12
 * - `textObject`：最多 8 项
 * - `imageObject`：最多 4 项
 */

declare class RebuildPageContainer {
    /** 对应 PB：ContainerTotalNum（1~12） */
    containerTotalNum?: number;
    /** 对应 PB：List_Object */
    listObject?: ListContainerProperty[];
    /** 对应 PB：Text_Object（max_count 8） */
    textObject?: TextContainerProperty[];
    /** 对应 PB：Image_Object（max_count 4） */
    imageObject?: ImageContainerProperty[];
    /** 对应 PB：Menu_Object；传入时替换菜单，省略时清除旧自定义菜单并恢复默认注册。 */
    menuObject?: MenuContainerProperty;
    constructor(data?: Partial<RebuildPageContainer>);
    /**
     * 从宿主 JSON 生成 `RebuildPageContainer`
     * - 自动兼容 key：camelCase / protoName（如 List_Object）
     */
    static fromJson(json: any): RebuildPageContainer;
    /**
     * 转为宿主可消费的 JSON（不会做 protobuf 编码，只是字段透传/规范化）
     */
    static toJson(model?: RebuildPageContainer | Record<string, any>): Record<string, any>;
    toJson(): Record<string, any>;
}

/**
 * PB aligned enum: OsEventTypeList (basic)
 *
 * Keep it minimal: only enum values + best-effort normalization.
 */
declare enum OsEventTypeList {
    CLICK_EVENT = 0,
    SCROLL_TOP_EVENT = 1,
    SCROLL_BOTTOM_EVENT = 2,
    DOUBLE_CLICK_EVENT = 3,
    FOREGROUND_ENTER_EVENT = 4,
    FOREGROUND_EXIT_EVENT = 5,
    ABNORMAL_EXIT_EVENT = 6,
    SYSTEM_EXIT_EVENT = 7,
    IMU_DATA_REPORT = 8,
    /** User starts a sustained press on the glasses input surface. */
    LONG_PRESS_EVENT = 9,
    /** User releases the sustained press; kept separate from the start event. */
    LONG_PRESS_RELEASE_EVENT = 10
}
declare namespace OsEventTypeList {
    /**
     * 将宿主下发的 eventType 归一化为 `OsEventTypeList`。
     *
     * 兼容：
     * - number：0~10（PB enum ordinal）
     * - string：`CLICK_EVENT` / `SCROLL_TOP_EVENT` 等
     * - string 简写：`CLICK` / `SCROLL_TOP` 等
     */
    function fromJson(raw: any): OsEventTypeList | undefined;
}

/**
 * PB aligned enum: EventSourceType（EvenHub.pbenum.dart）
 */
declare enum EventSourceType {
    TOUCH_EVENT_FORM_DUMMY_NULL = 0,
    TOUCH_EVENT_FROM_GLASSES_R = 1,
    TOUCH_EVENT_FROM_RING = 2,
    TOUCH_EVENT_FROM_GLASSES_L = 3
}
declare namespace EventSourceType {
    function fromJson(raw: any): EventSourceType | undefined;
}

/**
 * PB model: List_ItemEvent（基础字段）
 *
 * 典型场景：
 * - OS 列表组件发生点击/滚动等事件，上报当前选中项信息
 */
declare class List_ItemEvent {
    /** 对应 PB: Container_ID */
    containerID?: number;
    /** 对应 PB: Container_Name */
    containerName?: string;
    /** 对应 PB: CurrentSelect_ItemName */
    currentSelectItemName?: string;
    /** 对应 PB: CurrentSelect_ItemIndex */
    currentSelectItemIndex?: number;
    /** 对应 PB: Event_Type（OsEventTypeList） */
    eventType?: OsEventTypeList;
    constructor(data?: Partial<List_ItemEvent>);
    /**
     * 从 JSON 解析 `List_ItemEvent`。
     *
     * 兼容 key 命名：
     * - camelCase：`containerID`
     * - protoName：`Container_ID`
     *
     * 兼容 value 形态：
     * - 数字可能是 string（通过 `readNumber` 处理）
     */
    static fromJson(input: any): List_ItemEvent;
    static toJson(model?: List_ItemEvent | Record<string, any>): Record<string, any>;
    toJson(): Record<string, any>;
}

/**
 * PB model: Text_ItemEvent（基础字段）
 *
 * 典型场景：
 * - OS 文本组件发生点击/进入前台/离开前台等事件
 */
declare class Text_ItemEvent {
    /** 对应 PB: Container_ID */
    containerID?: number;
    /** 对应 PB: Container_Name */
    containerName?: string;
    /** 对应 PB: Event_Type（OsEventTypeList） */
    eventType?: OsEventTypeList;
    constructor(data?: Partial<Text_ItemEvent>);
    /**
     * 从 JSON 解析 `Text_ItemEvent`（兼容 camelCase / protoName key）。
     */
    static fromJson(input: any): Text_ItemEvent;
    static toJson(model?: Text_ItemEvent | Record<string, any>): Record<string, any>;
    toJson(): Record<string, any>;
}

/**
 * PB model: IMU_Report_Data（EvenHub.pb.dart：x / y / z，`double` on wire）
 */
declare class IMU_Report_Data {
    x?: number;
    y?: number;
    z?: number;
    constructor(data?: Partial<IMU_Report_Data>);
    static fromJson(input: any): IMU_Report_Data;
    static toJson(model?: IMU_Report_Data | Record<string, any>): Record<string, any>;
    toJson(): Record<string, any>;
}

/**
 * PB model: Sys_ItemEvent（基础字段）
 *
 * 典型场景：
 * - OS 系统级事件（比如进入前台、退出前台等）
 * - IMU 数据上报（Event_Type = IMU_DATA_REPORT，携带 IMU_Data）
 */
declare class Sys_ItemEvent {
    /** 对应 PB: Event_Type（OsEventTypeList） */
    eventType?: OsEventTypeList;
    /**
     * 对应 PB: EventSource（EventSourceType）。
     * CLICK / DOUBLE_CLICK / LONG_PRESS / LONG_PRESS_RELEASE 都通过该字段标识
     * 右镜腿、戒指或左镜腿来源；解析长按事件时不得只保留 eventType。
     */
    eventSource?: EventSourceType;
    /** 对应 PB: IMU_Data（IMU_Report_Data） */
    imuData?: IMU_Report_Data;
    /** 对应 PB: systemExitReasonCode */
    systemExitReasonCode?: number;
    constructor(data?: Partial<Sys_ItemEvent>);
    /**
     * 从 JSON 解析 `Sys_ItemEvent`（兼容 camelCase / protoName key）。
     */
    static fromJson(input: any): Sys_ItemEvent;
    static toJson(model?: Sys_ItemEvent | Record<string, any>): Record<string, any>;
    toJson(): Record<string, any>;
}

/** App-side speaker classification for the processed PCM frame. */
declare enum AudioSpeakerRole {
    Self = "self",
    Other = "other",
    Unknown = "unknown"
}
declare class AudioEvent {
    audioPcm: Uint8Array;
    source: AudioInputSource;
    /** Raw glasses direction tag for this PCM frame, or null when unavailable. */
    direction: number | null;
    /** App algorithm result; this is not a firmware identity assertion. */
    speakerRole: AudioSpeakerRole;
    constructor(params: {
        audioPcm: Uint8Array;
        source?: AudioInputSource;
        direction?: number | null;
        speakerRole?: AudioSpeakerRole;
    });
    static fromJson(input: any): AudioEvent;
    static tryFromJson(input: any): AudioEvent | undefined;
}

/**
 * EvenHub Event models (Flutter -> Web)
 *
 * This is aligned with:
 * - even_connect: BleEvenHubEvent / BleEvenHubEventType
 * - even_hub: EvenAppInterface.evenHubEvent (type string + map payload)
 *
 * We keep parsing flexible because different host apps may send:
 * - { type: 'listEvent', jsonData: {...} }
 * - { type: 'list_event', data: {...} }
 * - [ 'list_event', {...} ]
 */

declare enum EvenHubEventType {
    listEvent = "listEvent",
    textEvent = "textEvent",
    sysEvent = "sysEvent",
    audioEvent = "audioEvent",
    /** Stable string label for a top-level action-item click; never mapped to a legacy ordinal. */
    menuItemClickEvent = "menuItemClickEvent",
    notSet = "notSet"
}
/**
 * 音频事件 payload：宿主推送的处理后 PCM 及同帧来源元数据。
 * - audioPcm: Uint8Array（宿主侧 Uint8List 经 JSON 后多为 number[] 或 base64 字符串）
 * - direction: 眼镜方向标签；手机 MIC 或旧宿主为 null
 * - speakerRole: App 算法说话人角色；未知值安全降级为 unknown
 */
type AudioEventPayload = AudioEvent;
/**
 * EvenHub 事件 payload（强类型）：
 *
 * - listEvent  -> List_ItemEvent
 * - textEvent  -> Text_ItemEvent
 * - sysEvent   -> Sys_ItemEvent（含 EventSource、IMU_Data 等 PB 新字段）
 * - audioEvent -> AudioEventPayload
 * - imgEvent   -> ImageReflashEvent
 *
 * 注意：为了兼容宿主侧“直接透传 json map”的场景，兜底会是 `Record<string, any>`。
 */
type EvenHubEventPayload = List_ItemEvent | Text_ItemEvent | Sys_ItemEvent | AudioEventPayload | MenuItemClickEvent | Record<string, any>;
/**
 * EvenHub 事件（Flutter -> Web 推送后的统一结构）。
 *
 * 开发者只需要判断哪个属性不为空，就可以直接使用对应的事件对象：
 * ```typescript
 * if (event.listEvent) {
 *   // 处理 listEvent
 * } else if (event.textEvent) {
 *   // 处理 textEvent
 * } else if (event.sysEvent) {
 *   // 处理 sysEvent
 * }
 * ```
 *
 * - `listEvent`: 列表事件（如果存在）
 * - `textEvent`: 文本事件（如果存在）
 * - `sysEvent`: 系统事件（如果存在）
 * - `audioEvent`: 音频事件（处理后 PCM、来源、方向和说话人角色，如果存在）
 * - `menuItemClickEvent`: 一级动作菜单点击（如果存在）
 * - `jsonData`: 原始 JSON（可选，便于调试/回放）
 */
type EvenHubEvent = {
    listEvent?: List_ItemEvent;
    textEvent?: Text_ItemEvent;
    sysEvent?: Sys_ItemEvent;
    audioEvent?: AudioEventPayload;
    /** Present only when the glasses selected a top-level action menu item. */
    menuItemClickEvent?: MenuItemClickEvent;
    jsonData?: Record<string, any>;
};
/** 默认空事件（用于 bridge 初始化时的缓存值）。 */
declare function createDefaultEvenHubEvent(): EvenHubEvent;
/**
 * 从宿主下发的 evenHubEvent JSON 中解析出 `EvenHubEvent`。
 *
 * 兼容多种输入形态：
 * - `{ type: 'listEvent', jsonData: {...} }`
 * - `{ type: 'list_event', data: {...} }`
 * - `[ 'list_event', {...} ]`
 *
 * 解析策略：
 * - 先归一化 `type`
 * - 把数据字段归一到 `jsonData: Record<string, any>`
 * - 再按 type 解析得到对应的事件对象（listEvent/textEvent/sysEvent）
 */
declare function evenHubEventFromJson(input: any): EvenHubEvent;

/**
 * TextContainerUpgrade
 *
 * 对应宿主 PB：TextContainerUpgrade
 */
/** Firmware-supported text brightness range, including the fully dim level. */
declare const MIN_TEXT_BRIGHTNESS = 0;
declare const MAX_TEXT_BRIGHTNESS = 4;
/** Keep invalid brightness values from reaching the native bridge. */
declare function isValidTextBrightness(value: unknown): value is number;
declare class TextContainerUpgrade {
    /** 对应 PB：Container_ID */
    containerID?: number;
    /** 对应 PB：Container_Name */
    containerName?: string;
    /** 对应 PB：ContentOffset */
    contentOffset?: number;
    /** 对应 PB：ContentLength */
    contentLength?: number;
    /** 对应 PB：Content */
    content?: string;
    /**
     * 文本亮度（0~4）；省略表示保持容器当前亮度。
     */
    textColor?: number;
    constructor(data?: Partial<TextContainerUpgrade>);
    /**
     * 从宿主 JSON 生成 `TextContainerUpgrade`
     * - 自动兼容 key：camelCase / protoName（如 Container_ID）
     */
    static fromJson(json: any): TextContainerUpgrade;
    /** 转为宿主可消费的 JSON（字段透传） */
    static toJson(model?: TextContainerUpgrade | Record<string, any>): Record<string, any>;
    toJson(): Record<string, any>;
}

/**
 * ShutDownContaniner
 *
 * 对应宿主 PB：ShutDownContaniner
 * Dart 侧只用到了 exitMode：
 * - 0: Exit immediately
 * - 1: pop up the foreground layer program and wait for the user's operation to decide whether to exit.
 */
declare class ShutDownContaniner {
    exitMode: number;
    [key: string]: any;
    constructor(data?: Partial<ShutDownContaniner>);
    static fromJson(json: any): ShutDownContaniner;
    static toJson(model?: ShutDownContaniner | Record<string, any>): Record<string, any>;
    toJson(): Record<string, any>;
}

/**
 * PB model: IMU_CtrlCmd（EvenHub.pb.dart）
 *
 * 用于构造与 PB 一致的 JSON（如后续桥接增加 `imuControl` 时可直接 toJson）。
 */
declare class ImuCtrlCmd {
    /** PB: IMU_ReportEn */
    iMUReportEn?: number;
    /** PB: reportFrq（wire 上为无符号整型） */
    reportFrq?: number;
    constructor(data?: Partial<ImuCtrlCmd>);
    static fromJson(input: any): ImuCtrlCmd;
    static toJson(model?: ImuCtrlCmd | Record<string, any>): Record<string, any>;
    toJson(): Record<string, any>;
}
/**
 * PB model: IMU_CtrlCmd_Response
 */
declare class ImuCtrlCmdResponse {
    /** PB: IMU_ReportEn_Status */
    iMUReportEnStatus?: number;
    constructor(data?: Partial<ImuCtrlCmdResponse>);
    static fromJson(input: any): ImuCtrlCmdResponse;
    static toJson(model?: ImuCtrlCmdResponse | Record<string, any>): Record<string, any>;
    toJson(): Record<string, any>;
}

/**
 * EvenHub Bridge
 *
 * 用于在 WebView 中桥接 Even App 和 TypeScript SDK 之间的通信
 *
 * 主要功能：
 * 1. Web 页面可以通过桥接调用 Even App 的原生功能（如设置用户信息、设备信息、网络请求等）
 * 2. Web 页面可以监听 Even App 主动推送的通知（如设备状态变化）
 */

/**
 * Even App Bridge 类
 *
 * 提供 Even App 与 WebView 之间的双向通信能力
 *
 * 使用单例模式，确保整个应用中只有一个桥接实例
 *
 * 主要职责：
 * - 管理 Even App 和 WebView 之间的消息传递
 * - 提供就绪状态检查，确保桥接已初始化完成
 */
declare class EvenAppBridge {
    /** 单例实例 */
    private static instance;
    /**
     * 桥接是否已就绪
     * true: 桥接已初始化完成，可以正常使用
     * false: 桥接还在初始化中
     */
    _ready: boolean;
    /**
     * 私有构造函数
     * 使用单例模式，只能通过 getInstance() 方法获取实例
     */
    private constructor();
    /**
     * 获取单例实例
     *
     * @returns EvenAppBridge 的单例实例
     *
     * 如果实例不存在，则创建一个新实例
     * 如果实例已存在，则返回现有实例
     */
    static getInstance(): EvenAppBridge;
    /**
     * 初始化桥接
     *
     * 在浏览器环境中执行以下操作：
     * 1. 将桥接实例暴露到 window.EvenAppBridge，供 Web 页面使用
     * 2. 监听 DOM 加载状态，在 DOM 加载完成后标记为就绪
     * 3. 暴露消息处理函数到 window._listenEvenAppMessage，供宿主调用推送消息
     */
    private init;
    /**
     * 触发就绪事件
     *
     * 当桥接初始化完成时，触发 BridgeEvent.BridgeReady 事件
     * Web 页面可以监听这个事件，知道桥接已经可以使用了
     */
    private dispatchReadyEvent;
    /**
     * 检查桥接是否就绪
     *
     * @returns true 表示桥接已就绪，可以使用；false 表示还在初始化中
     */
    get ready(): boolean;
    /**
     * 发送消息到 Even APP
     *
     * @param message 要发送的消息对象
     * @returns Promise，resolve 为 Even App 方法执行结果
     *
     * 通过 flutter_inappwebview 的 callHandler 将消息发送到 Even APP 端。
     * Even APP 端需要注册名为 'evenAppMessage' 的 JavaScriptHandler，并在 handler 中 return 结果（或 throw 错误），
     * 这样 Web 侧即可直接 await 调用结果，不需要额外的 response 消息回传。
     */
    private postMessage;
    /**
     * 处理页面启动来源
     *
     * WebView 在 loading 完成后推送一次；从 data 中取出 launchSource 并规范为 appMenu | glassesMenu，再派发事件。
     */
    private handleLaunchSource;
    /**
     * 处理眼镜/设备状态变化
     *
     * @param data 包含设备状态的数据对象
     *
     * 当 Even App 端的设备状态发生变化时，会主动推送这个消息
     * 桥接会更新内部状态，并触发 'deviceStatusChanged' 事件，供 Web 页面监听
     *
     * 状态信息包括：
     * - connectType: 连接状态（none/connecting/connected/disconnected/connectionFailed）
     * - isWearing: 是否佩戴中
     * - batteryLevel: 电池电量
     * - isCharging: 是否正在充电
     * - isInCase: 是否在充电盒中
     */
    private handleGlassesStatusChanged;
    /**
     * 处理 EvenHub 事件变化（Flutter -> Web 推送）
     *
     * @param data 事件数据（兼容多种形态：{type,jsonData} / {type,data} / [type, jsonData]）
     */
    private handleEvenHubEventChanged;
    /**
     * 处理 App 位置变化推送。
     *
     * 只派发成功解析的位置，避免把无效坐标传播给业务侧。
     */
    private handleAppLocationChanged;
    /**
     * 调用 Even App 方法（从 Web 页面调用）- 通用方法
     *
     * @param method 要调用的 Even App 方法名称
     * @param params 方法参数（可选）
     * @returns Promise，成功时返回 Even App 方法的执行结果，失败时抛出错误
     *
     * 这是 Web 页面调用 Even App 原生功能的主要入口
     */
    callEvenApp(method: EvenAppMethod | string, params?: any): Promise<any>;
    /**
     * 获取用户信息
     *
     * @returns Promise<UserInfo> 返回用户信息
     *
     * 使用示例：
     * ```typescript
     * const bridge = EvenAppBridge.getInstance();
     * const userInfo = await bridge.getUserInfo();
     * console.log('User:', userInfo.userName);
     * ```
     */
    getUserInfo(): Promise<UserInfo>;
    /**
     * 获取设备信息（眼镜/戒指信息）
     *
     * @returns Promise<DeviceInfo> 返回设备信息
     *
     * 使用示例：
     * ```typescript
     * const bridge = EvenAppBridge.getInstance();
     * const deviceInfo = await bridge.getDeviceInfo();
     * console.log('Device Model:', deviceInfo?.model);
     * ```
     */
    getDeviceInfo(): Promise<DeviceInfo | null>;
    /**
     * 设置本地存储
     *
     * @param key 存储键名
     * @param value 存储值
     * @returns Promise<void>
     *
     * 使用示例：
     * ```typescript
     * const bridge = EvenAppBridge.getInstance();
     * await bridge.setLocalStorage('theme', 'dark');
     * ```
     */
    setLocalStorage(key: string, value: string): Promise<boolean>;
    /**
     * 获取本地存储
     *
     * @param key 存储键名
     * @returns Promise<string> 返回存储的值
     *
     * 使用示例：
     * ```typescript
     * const bridge = EvenAppBridge.getInstance();
     * const theme = await bridge.getLocalStorage('theme');
     * ```
     */
    getLocalStorage(key: string): Promise<string>;
    /**
     * 获取 App 当前位置。
     *
     * @param options 位置精度和超时配置
     * @returns 成功时返回 AppLocation，宿主无结果或坐标无效时返回 null
     */
    getAppLocation(options?: AppLocationOptions): Promise<AppLocation | null>;
    /**
     * 开始监听 App 位置更新。
     *
     * 宿主后续会通过 appLocationChanged 推送位置。
     */
    startAppLocationUpdates(options?: AppLocationOptions): Promise<boolean>;
    /** 停止监听 App 位置更新 */
    stopAppLocationUpdates(): Promise<boolean>;
    /** 从 App 相册选择图片 */
    pickImageFromAlbum(): Promise<AppImageAsset | null>;
    /** 从 App 相机拍摄图片 */
    captureImageFromCamera(): Promise<AppImageAsset | null>;
    /**
     * 发送创建启动页容器指令（启动自定义APP时必须调用，后续用 rebuildPageContainer 重建页面）
     *
     * SDK 会在调用宿主前校验同页层级和上下文菜单约束，避免整页被固件拒绝。
     *
     * 宿主侧返回 `int`（对齐 EhStartUpPageCreateResult）：
     * - 0 = success
     * - 1 = invalid
     * - 2 = oversize
     * - 3 = outOfMemory
     */
    createStartUpPageContainer(container: CreateStartUpPageContainer): Promise<StartUpPageCreateResult>;
    /**
     * 发送重建页面容器指令。
     *
     * SDK 会先校验层级与菜单协议约束；省略 `menuObject` 会让宿主清除当前自定义菜单。
     */
    rebuildPageContainer(container: RebuildPageContainer): Promise<boolean>;
    /** 发送更新图片原始数据指令 */
    updateImageRawData(data: ImageRawDataUpdate): Promise<ImageRawDataUpdateResult>;
    /** 发送文本容器升级指令，并在本地拦截超出 0~4 的亮度值。 */
    textContainerUpgrade(container: TextContainerUpgrade): Promise<boolean>;
    /**
     * EvenHub - MIC 控制（音频控制）
     *
     * @param isOpen `true` 打开麦克风，`false` 关闭麦克风
     * @param source 音频来源，使用 `AudioInputSource.Glasses` 或 `AudioInputSource.Phone`
     * @returns `true` 表示成功，`false` 表示失败
     *
     * 使用示例：
     * ```typescript
     * const bridge = EvenAppBridge.getInstance();
     * await bridge.audioControl(true, AudioInputSource.Glasses); // 打开眼镜麦克风
     * await bridge.audioControl(true, AudioInputSource.Phone);    // 打开手机麦克风
     * await bridge.audioControl(false);                           // 关闭麦克风
     * ```
     */
    audioControl(isOpen: boolean, source?: AudioInputSource): Promise<boolean>;
    /**
     * EvenHub - IMU 上报开关与快慢档位（对齐 PB `IMU_CtrlCmd.reportFrq` / 宿主 `imuControl`）
     *
     * @param isOpen `true` 开启 IMU 上报，`false` 关闭
     * @param reportFrq PB 字段 `reportFrq`，仅允许 `ImuReportPace`（100～1000，步进 100）中的取值，默认 `ImuReportPace.P100`
     * @returns `true` 表示宿主侧调用成功
     */
    imuControl(isOpen: boolean, reportFrq?: ImuReportPace): Promise<boolean>;
    /**
     * 发送关闭页面容器指令
     *
     * - exitMode: 0 立即退出；1 弹出前台交互层，由用户操作决定是否退出
     */
    shutDownPageContainer(exitMode?: number): Promise<boolean>;
    /**
     * 监听页面启动来源
     *
     * @param callback 启动来源变化时的回调函数，参数为启动来源
     * @returns 取消监听的函数
     *
     * 使用示例：
     * ```typescript
     * const bridge = EvenAppBridge.getInstance();
     *
     * const unsubscribe = bridge.onLaunchSource((source) => {
     *   console.log('Launch source:', source);
     * });
     *
     * // 取消监听
     * unsubscribe();
     * ```
     */
    onLaunchSource(callback: (source: LaunchSource) => void): () => void;
    /**
     * 监听设备状态变化
     *
     * @param callback 状态变化时的回调函数，参数为完整的设备状态
     * @returns 取消监听的函数
     *
     * 使用示例：
     * ```typescript
     * const bridge = EvenAppBridge.getInstance();
     *
     * const unsubscribe = bridge.onDeviceStatusChanged((status) => {
     *   console.log('Device status:', status);
     *   if (status.connectType === DeviceConnectType.Connected) {
     *     console.log('Device connected!');
     *   }
     * });
     *
     * // 取消监听
     * unsubscribe();
     * ```
     */
    onDeviceStatusChanged(callback: (status: DeviceStatus) => void): () => void;
    /**
     * 监听 EvenHub 事件推送
     *
     * 使用示例：
     * ```typescript
     * const bridge = EvenAppBridge.getInstance();
     *
     * const unsubscribe = bridge.onEvenHubEvent((event) => {
     *   if (event.listEvent) {
     *     console.log('List event:', event.listEvent);
     *   } else if (event.textEvent) {
     *     console.log('Text event:', event.textEvent);
     *   } else if (event.sysEvent) {
     *     console.log('Sys event:', event.sysEvent);
     *   } else if (event.audioEvent) {
     *     console.log('Audio PCM length:', event.audioEvent.audioPcm.length);
     *   }
     * });
     *
     * // 取消监听
     * unsubscribe();
     * ```
     */
    onEvenHubEvent(callback: (event: EvenHubEvent) => void): () => void;
    /** 监听 App 位置变化 */
    onAppLocationChanged(callback: (location: AppLocation) => void): () => void;
}
/**
 * 等待桥接就绪的辅助函数
 *
 * 在 web 页面中使用，确保桥接已初始化完成后再使用
 *
 * @returns Promise<EvenAppBridge> 返回已就绪的桥接实例
 *
 * 使用示例：
 * ```typescript
 * // 等待桥接就绪
 * const bridge = await waitForEvenAppBridge();
 *
 * // 现在可以安全地使用桥接
 * const userInfo = await bridge.getUserInfo();
 * console.log('User Info:', userInfo);
 * ```
 *
 * 工作原理：
 * 1. 首先检查桥接是否已存在且已就绪，如果是则直接返回
 * 2. 如果未就绪，监听 'evenAppBridgeReady' 事件
 * 3. 如果桥接已存在但未标记为就绪，等待 100ms 后再次检查（容错处理）
 */
declare function waitForEvenAppBridge(): Promise<EvenAppBridge>;

export { type AppImageAsset, type AppLocation, AppLocationAccuracy, type AppLocationOptions, AudioEvent, type AudioEventPayload, AudioInputSource, AudioSpeakerRole, BridgeEvent, CreateStartUpPageContainer, DeviceConnectType, DeviceInfo, DeviceModel, DeviceStatus, EvenAppBridge, EvenAppMessageType, EvenAppMethod, type EvenHubContainerKind, type EvenHubContainerRef, type EvenHubErrorCode, EvenHubErrorCodeName, type EvenHubEvent, type EvenHubEventPayload, EvenHubEventType, type EvenHubPageContainerLike, EvenHubPageContainerValidationErrorCode, type EvenHubPageContainerValidationResult, EventSourceType, IMU_Report_Data, ImageContainerProperty, ImageRawDataUpdate, ImageRawDataUpdateFields, ImageRawDataUpdateResult, ImuCtrlCmd, ImuCtrlCmdResponse, ImuReportPace, type JsonRecord, LAUNCH_SOURCE_APP_MENU, LAUNCH_SOURCE_GLASSES_MENU, type LaunchSource, ListContainerProperty, ListItemContainerProperty, List_ItemEvent, MAX_TEXT_BRIGHTNESS, MIN_TEXT_BRIGHTNESS, MenuContainerProperty, MenuItemClickEvent, MenuItemProperty, OsEventTypeList, RebuildPageContainer, ShutDownContaniner, StartUpPageCreateResult, Sys_ItemEvent, TextContainerProperty, TextContainerUpgrade, Text_ItemEvent, UserInfo, appImageAssetFromJson, appLocationFromJson, bytesToJson, createDefaultEvenHubEvent, evenHubEventFromJson, formatEvenHubPageContainerValidationError, isMenuNameWithinLimit, isObjectRecord, isValidMenuItemID, isValidTextBrightness, normalizeAudioInputSource, normalizeLooseKey, pick, pickLoose, readNumber, readString, toNumber, toObjectRecord, toString, utf8ByteLength, validateEvenHubPageContainer, validateEvenHubPageContainerMenu, validateEvenHubPageContainerTextBrightness, validateEvenHubPageContainerZOrder, waitForEvenAppBridge };
