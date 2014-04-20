'use strict';
console && console.clear && console.clear();

//var rowTemplate = $(".row.template");
//var rowHeight = rowTemplate.outerHeight();
//console.log(rowHeight);
//var scrollview = $(".scrollview");
//var viewport = $(".viewport");
var Il;
(function (Il) {
    var LongList = (function () {
        function LongList(settings) {
            var _this = this;
            this.nope = function () {
            };
            this.updateRows = function () {
                _this.settings.scrollview.style.height = _this.settings.data.length * _this.rowHeight + "px";
                for (var i = 0; i < _this.rows.length; i++) {
                    var row = _this.rows[i];
                    var dataItem = _this.settings.data[i + _this.currentFirstRowIndex];
                    if (dataItem == undefined) {
                        UiUtility.addClass(row, "ll-hidden");
                        _this.rowsBinders[i].dataSource = null;
                    } else {
                        UiUtility.removeClass(row, "ll-hidden");
                        _this.rowsBinders[i].dataSource = dataItem;
                    }
                }
            };
            this.initialize = function () {
                _this.rows = [];
                _this.rowsBinders = [];
                var viewportHeight = UiUtility.getHeight(_this.settings.viewport);
                var scrollview = _this.settings.scrollview;
                while (scrollview.firstChild) {
                    scrollview.removeChild(scrollview.firstChild);
                }
                _this.settings.viewport.scrollTop = 0;

                for (var i = 0; i < _this.settings.data.length; i++) {
                    var row = _this.settings.rowTemplate.cloneNode(true);
                    UiUtility.removeClass(row, "template");
                    row.removeAttribute("id");
                    row.style.height = _this.rowHeight + "px";
                    var dataItem = _this.settings.data[i];
                    var binder = new Il.ElementBinder(row);
                    binder.dataSource = dataItem;
                    _this.rowsBinders.push(binder);
                    _this.rows.push(row);
                    scrollview.appendChild(row);
                    if (i * _this.rowHeight > viewportHeight) {
                        break;
                    }
                }
                var updateView = function () {
                    _this.updateRows();
                    var binders = _this.rowsBinders;
                    for (var ii = 0; ii < binders.length; ii++) {
                        binders[ii].dataSourceUpdated();
                    }
                    window.setTimeout(updateView, 100);
                };
                updateView();
            };
            this.settings = settings;
            this.currentFirstRowIndex = 0;
            var rowTemplate = settings.rowTemplate;
            this.rowHeight = UiUtility.getHeight(rowTemplate, true);

            settings.viewport.addEventListener("scroll", function () {
                var scrollTop = settings.viewport.scrollTop;
                var from = Math.floor((scrollTop) / _this.rowHeight);
                console.log("scroll", scrollTop, from, _this.currentFirstRowIndex);
                if (_this.currentFirstRowIndex == from) {
                    console.log("scroll ignore");
                    return;
                }

                _this.currentFirstRowIndex = from;
                _this.rows[0].style.marginTop = (scrollTop - scrollTop % _this.rowHeight) + "px";
                _this.updateRows();
            });
        }
        Object.defineProperty(LongList.prototype, "test", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        return LongList;
    })();
    Il.LongList = LongList;

    var UiUtility = (function () {
        function UiUtility() {
        }
        UiUtility.getHeight = function (target, outer) {
            if (typeof outer === "undefined") { outer = false; }
            // window
            if (target.window === window) {
                return target.document.documentElement.clientHeight;
            }

            // document
            if (target.nodeType === 9) {
                var document = target;
                var documentElement = document.documentElement;

                return Math.max(document.body.scrollHeight, documentElement.scrollHeight, document.body.offsetHeight, documentElement.offsetHeight, documentElement.clientHeight);
            }
            var element = target;
            var restorePosition = function () {
            };
            if (element.parentNode == null) {
                var position = element.style.position;
                restorePosition = function () {
                    element.style.position = position;
                    element.parentNode.removeChild(element);
                };
                element.style.position = "absolute";
                element.ownerDocument.body.appendChild(element);
            }
            var computedStyle = element.ownerDocument.defaultView.getComputedStyle(element, null);
            var restoreStyle = function () {
            };
            if (computedStyle.display == "none") {
                var display = element.style.display;
                element.style.display = "block";
                restoreStyle = function () {
                    element.style.display = display;
                };
            }
            var height = parseFloat(computedStyle.height);
            var marginTop;
            var marginBottom;
            var borderBottomWidth;
            var borderTopWidth;
            var paddingTop;
            var paddingBottom;
            if (outer) {
                marginTop = parseFloat(computedStyle.marginTop);
                marginBottom = parseFloat(computedStyle.marginBottom);
                borderBottomWidth = parseFloat(computedStyle.borderBottomWidth);
                borderTopWidth = parseFloat(computedStyle.borderTopWidth);
                paddingTop = parseFloat(computedStyle.paddingTop);
                paddingBottom = parseFloat(computedStyle.paddingBottom);
            } else {
                marginTop = 0;
                marginBottom = 0;
                borderBottomWidth = 0;
                borderTopWidth = 0;
                paddingTop = 0;
                paddingBottom = 0;
            }
            restorePosition();
            restoreStyle();
            return height + marginTop + marginBottom + borderBottomWidth + borderTopWidth + paddingTop + paddingBottom;
        };
        UiUtility.addClass = function (target, className) {
            if (target.nodeType != 1) {
                return;
            }
            UiUtility.removeClass(target, className);
            var element = target;
            var elementClassName = element.className;
            if (elementClassName.length == 0) {
                element.className = className;
            } else {
                element.className += " " + className;
            }
        };
        UiUtility.removeClass = function (target, className) {
            if (target.nodeType != 1) {
                return;
            }
            var element = target;
            var elementClassName = element.className;
            if (elementClassName.indexOf(className) < 0) {
                return;
            }
            while (elementClassName.indexOf(className) >= 0) {
                elementClassName = elementClassName.replace(className, "");
            }
            elementClassName = elementClassName.replace(/(^\s+)|(\s+$)/gi, "").replace(/\s+/gi, " ");
            element.className = elementClassName;
        };
        return UiUtility;
    })();
})(Il || (Il = {}));

var Il;
(function (Il) {
    var ElementBinder = (function () {
        function ElementBinder(targetElement) {
            var _this = this;
            this.dataSourceUpdated = function () {
                var source = _this.source;
                for (var dataPropertyPath in _this.bindingMap) {
                    var targetValue;
                    var info = _this.dataInfo[dataPropertyPath];
                    if (dataPropertyPath.length == 0 || dataPropertyPath == ".") {
                        targetValue = source;
                    } else if (source && source.hasOwnProperty(info.segments[0])) {
                        targetValue = source[info.segments[0]];
                        for (var i = 1; targetValue && i < info.segments.length; i++) {
                            if (targetValue.hasOwnProperty(info.segments[i])) {
                                targetValue = targetValue[info.segments[i]];
                            } else {
                                break;
                            }
                        }
                    } else {
                        targetValue = "";
                    }
                    if (targetValue != info.value) {
                        info.value = targetValue;
                        var actions = _this.bindingMap[dataPropertyPath];
                        for (var ii = 0; ii < actions.length; ii++) {
                            actions[ii](targetValue);
                        }
                    }
                }
            };
            this.createBindingMap = function (targetElement) {
                var map = {};
                var attributes = targetElement.attributes;
                for (var i = 0; i < attributes.length; i++) {
                    var attribute = attributes[i];
                    var dataBindingPrefix = "data-binding-";
                    var attributeName = attribute.name;
                    if (attributeName.substring(0, dataBindingPrefix.length) == dataBindingPrefix) {
                        var elementPropertyName = attributeName.substring(dataBindingPrefix.length);
                        var dataPropertyPath = attribute.value;
                        map[dataPropertyPath] = map[dataPropertyPath] || [];
                        map[dataPropertyPath].push(function (value) {
                            switch (elementPropertyName.toLowerCase()) {
                                case "html": {
                                    targetElement.innerHTML = value;
                                    break;
                                }
                                case "text": {
                                    targetElement.innerText = value;
                                    break;
                                }
                                case "class": {
                                    targetElement.className = value;
                                    break;
                                }
                                default: {
                                    targetElement[elementPropertyName] = value;
                                    break;
                                }
                            }
                        });
                    }

                    var children = targetElement.children;
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        var childMap = _this.createBindingMap(child);
                        for (var key in childMap) {
                            map[key] = map[key] || [];
                            var parentActions = map[key];
                            var childActions = childMap[key];
                            for (var ii = 0; ii < childActions.length; ii++) {
                                parentActions.push(childActions[ii]);
                            }
                        }
                    }
                }

                return map;
            };
            this.targetElement = targetElement;
            this.bindingMap = this.createBindingMap(targetElement);
            var bindingMap = this.bindingMap;
            this.dataInfo = {};
            for (var dataPropertyPath in bindingMap) {
                this.dataInfo[dataPropertyPath] = {
                    segments: dataPropertyPath.split("."),
                    value: null
                };
            }
        }
        Object.defineProperty(ElementBinder.prototype, "dataSource", {
            set: function (value) {
                if (this.source === value) {
                    return;
                }
                this.source = value;
                this.dataSourceUpdated();
            },
            enumerable: true,
            configurable: true
        });
        return ElementBinder;
    })();
    Il.ElementBinder = ElementBinder;
})(Il || (Il = {}));

window.data = [
    { name1: "n1" },
    { name1: "n2" },
    { name1: "n3" },
    { name1: "n4" },
    { name1: "n5" },
    { name1: "n6" },
    { name1: "n7" },
    { name1: "n8" },
    { name1: "n9" }
];
window.setInterval(function () {
    window.data[1].value2 = new Date();
}, 1000);
window.ll = new Il.LongList({
    viewport: document.getElementById("vp"),
    scrollview: document.getElementById("sv"),
    rowTemplate: document.getElementById("t1"),
    data: window.data
});
window.ll.initialize();
//# sourceMappingURL=app.js.map
