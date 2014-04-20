'use strict';
console && console.clear && console.clear();
//var rowTemplate = $(".row.template");
//var rowHeight = rowTemplate.outerHeight();
//console.log(rowHeight);
//var scrollview = $(".scrollview");
//var viewport = $(".viewport");
module Il {
    export interface INotifyPropertyChanged {
        onpropertychanged: (propertyName: string) => void;
        value: string
    }

    export interface ISettings {
        viewport: HTMLElement;
        scrollview: HTMLElement;
        rowTemplate: HTMLElement;
        data: INotifyPropertyChanged[];
    }

    export class LongList {
        private settings: ISettings;
        private currentFirstRowIndex: number;
        private rows: HTMLElement[];
        private rowsBinders: ElementBinder[];
        private nope = () => { };
        private rowHeight: number;

        get test(): number {
            return 0;
        }

        constructor(settings: ISettings) {
            this.settings = settings;
            this.currentFirstRowIndex = 0;
            var rowTemplate = settings.rowTemplate;
            this.rowHeight = UiUtility.getHeight(rowTemplate, true);
            
            settings.viewport.addEventListener("scroll", () => {
                var scrollTop = settings.viewport.scrollTop;
                var from = Math.floor((scrollTop) / this.rowHeight);
                console.log("scroll", scrollTop, from, this.currentFirstRowIndex);
                if (this.currentFirstRowIndex == from) {
                    console.log("scroll ignore");
                    return;
                }

                this.currentFirstRowIndex = from;
                this.rows[0].style.marginTop = (scrollTop - scrollTop % this.rowHeight) + "px";
                this.updateRows();

            });
        }

        updateRows = () => {
            this.settings.scrollview.style.height = this.settings.data.length * this.rowHeight + "px";
            for (var i = 0; i < this.rows.length; i++) {
                var row = this.rows[i];
                var dataItem = this.settings.data[i + this.currentFirstRowIndex];
                if (dataItem == undefined) {
                    UiUtility.addClass(row, "ll-hidden");
                    this.rowsBinders[i].dataSource = null;
                } else {
                    UiUtility.removeClass(row, "ll-hidden");
                    this.rowsBinders[i].dataSource = dataItem;
                }
            }
        }

        initialize = () => {
            this.rows = [];
            this.rowsBinders = [];
            var viewportHeight = UiUtility.getHeight(this.settings.viewport);
            var scrollview = this.settings.scrollview;
            while (scrollview.firstChild) {
                scrollview.removeChild(scrollview.firstChild);
            }
            this.settings.viewport.scrollTop = 0;

            for (var i = 0; i < this.settings.data.length; i++) {
                var row = <HTMLElement>this.settings.rowTemplate.cloneNode(true);
                UiUtility.removeClass(row, "template");
                row.removeAttribute("id");
                row.style.height = this.rowHeight + "px";
                var dataItem = this.settings.data[i];
                var binder = new ElementBinder(row);
                binder.dataSource = dataItem;
                this.rowsBinders.push(binder);
                this.rows.push(row);
                scrollview.appendChild(row);
                if (i * this.rowHeight > viewportHeight) {
                    break;
                }
            }
            var updateView = () => {
                this.updateRows();
                var binders = this.rowsBinders;
                for (var ii = 0; ii < binders.length; ii++) {
                    binders[ii].dataSourceUpdated();
                }
                window.setTimeout(updateView, 100);
            };
            updateView();
        }


    }

    class UiUtility {
        static getHeight = (target: EventTarget, outer: boolean = false): number => {
            // window
            if ((<Window>target).window === window) {
                return (<Window>target).document.documentElement.clientHeight;
            }
            // document
            if ((<Node>target).nodeType === 9) {
                var document = (<HTMLDocument>target);
                var documentElement = document.documentElement;

                return Math.max(
                    document.body.scrollHeight,
                    documentElement.scrollHeight,
                    document.body.offsetHeight,
                    documentElement.offsetHeight,
                    documentElement.clientHeight);
            }
            var element = (<HTMLElement>target);
            var restorePosition = () => { };
            if (element.parentNode == null) {
                var position = element.style.position;
                restorePosition = () => {
                    element.style.position = position;
                    element.parentNode.removeChild(element);
                };
                element.style.position = "absolute";
                element.ownerDocument.body.appendChild(element);
            }
            var computedStyle = element.ownerDocument.defaultView.getComputedStyle(element, null);
            var restoreStyle = () => { };
            if (computedStyle.display == "none") {
                var display = element.style.display;
                element.style.display = "block";
                restoreStyle = () => {
                    element.style.display = display;
                }
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
            return height +
                marginTop +
                marginBottom +
                borderBottomWidth +
                borderTopWidth +
                paddingTop +
                paddingBottom;
        }
        static addClass = (target: Node, className: string) => {
            if (target.nodeType != 1) {
                return;
            }
            UiUtility.removeClass(target, className);
            var element = <HTMLElement>target;
            var elementClassName = element.className;
            if (elementClassName.length == 0) {
                element.className = className;
            } else {
                element.className += " " + className;
            }
        }
        static removeClass = (target: Node, className: string) => {
            if (target.nodeType != 1) {
                return;
            }
            var element = <HTMLElement>target;
            var elementClassName = element.className;
            if (elementClassName.indexOf(className) < 0) {
                return;
            }
            while (elementClassName.indexOf(className) >= 0) {
                elementClassName = elementClassName.replace(className, "");
            }
            elementClassName = elementClassName.replace(/(^\s+)|(\s+$)/gi, "").replace(/\s+/gi, " ");
            element.className = elementClassName;
        }

    }
}

module Il {
    export class ElementBinder {
        private targetElement: HTMLElement;
        private source: any;
        private bindingMap: { [dataPropertyPath: string]: Array<(value: string) => void> };
        private dataInfo: { [dataPropertyPath: string]: { segments: Array<string>; value: any } };

        constructor(targetElement: HTMLElement) {
            this.targetElement = targetElement;
            this.bindingMap = this.createBindingMap(targetElement);
            var bindingMap = this.bindingMap;
            this.dataInfo = {};
            for (var dataPropertyPath in bindingMap) {
                this.dataInfo[dataPropertyPath] = {
                    segments: dataPropertyPath.split("."),
                    value: null
                }
            }
        }

        public set dataSource(value: any) {
            if (this.source === value) {
                return;
            }
            this.source = value;
            this.dataSourceUpdated();
        }

        public dataSourceUpdated = () => {
            var source = this.source;
            for (var dataPropertyPath in this.bindingMap) {
                var targetValue;
                var info = this.dataInfo[dataPropertyPath];
                if (dataPropertyPath.length == 0 || dataPropertyPath == ".") {
                    targetValue = source;
                }
                else if (source && source.hasOwnProperty(info.segments[0])) {
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
                    var actions = this.bindingMap[dataPropertyPath];
                    for (var ii = 0; ii < actions.length; ii++) {
                        actions[ii](targetValue);
                    }
                }
            }
        }

        private createBindingMap = (targetElement: HTMLElement): { [dataPropertyPath: string]: Array<(value: string) => void> } => {
            var map: { [dataPropertyPath: string]: Array<(value: string) => void> } = {};
            var attributes = targetElement.attributes;
            for (var i = 0; i < attributes.length; i++) {
                var attribute = attributes[i];
                var dataBindingPrefix = "data-binding-";
                var attributeName = attribute.name;
                if (attributeName.substring(0, dataBindingPrefix.length) == dataBindingPrefix) {
                    var elementPropertyName = attributeName.substring(dataBindingPrefix.length);
                    var dataPropertyPath = attribute.value;
                    map[dataPropertyPath] = map[dataPropertyPath] || [];
                    map[dataPropertyPath].push((value: string) => {

                        switch (elementPropertyName.toLowerCase()) {
                            case "html":
                                {
                                    targetElement.innerHTML = value;
                                    break;
                                }
                            case "text":
                                {
                                    targetElement.innerText = value;
                                    break;
                                }
                            case "class":
                                {
                                    targetElement.className = value;
                                    break;
                                }
                            default:
                                {
                                    targetElement[elementPropertyName] = value;
                                    break;
                                }
                        }
                    });
                }

                var children = targetElement.children;
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    var childMap = this.createBindingMap(<HTMLElement>child);
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
        }
    }
}

interface Window {
    data: Array<any>;
    ll: Il.LongList;
}

declare var window: Window;

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
window.setInterval(() => {
    window.data[1].value2 = new Date();
}, 1000);
window.ll = new Il.LongList({
    viewport: document.getElementById("vp"),
    scrollview: document.getElementById("sv"),
    rowTemplate: document.getElementById("t1"),
    data: window.data
});
window.ll.initialize();