/// <reference path="Scripts/typings/node/node.d.ts" />
/// <reference path="Scripts/typings/socket.io/socket.io.d.ts" />
exports.connectionInfos = {};
exports.associatedProducts = {};
exports.desktopSockets = {};
exports.mobileSockets = {};

(function (ClientType) {
    ClientType[ClientType["Desktop"] = 0] = "Desktop";
    ClientType[ClientType["Mobile"] = 1] = "Mobile";
})(exports.ClientType || (exports.ClientType = {}));
var ClientType = exports.ClientType;

(function (Product) {
    Product[Product["M"] = 0] = "M";
    Product[Product["Y"] = 1] = "Y";
})(exports.Product || (exports.Product = {}));
var Product = exports.Product;

var ConnectionInfo = (function () {
    function ConnectionInfo(type, product, uniqueId) {
        this.type = type;
        this.product = product;
        this.uniqueId = uniqueId;
    }
    return ConnectionInfo;
})();
exports.ConnectionInfo = ConnectionInfo;

function parseProduct(s) {
    if (s == "Y")
        return 1 /* Y */;
    else if (s == "M")
        return 0 /* M */;
}
exports.parseProduct = parseProduct;
//# sourceMappingURL=connections.js.map
