/// <reference path="Scripts/typings/node/node.d.ts" />
/// <reference path="Scripts/typings/socket.io/socket.io.d.ts" />

import s = require('socket.io');

export var connectionInfos: { [s: string]: ConnectionInfo; } = {};
export var associatedProducts: { [s: string]: Product; } = {};
export var desktopSockets: { [s: string]: s.Socket; } = {};
export var mobileSockets: { [s: string]: s.Socket; } = {};

export enum ClientType {
    Desktop,
    Mobile
}

export enum Product {
    M,
    Y
}

export class ConnectionInfo {
    type: ClientType;
    product: Product;
    uniqueId: string;

    constructor(type: ClientType, product: Product, uniqueId: string) {
        this.type = type;
        this.product = product;
        this.uniqueId = uniqueId;
    }
}

export function parseProduct(s: string) {
    if (s == "Y")
        return Product.Y;
    else if (s == "M")
        return Product.M;
}