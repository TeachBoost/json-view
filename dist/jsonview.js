(function () {
  'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
    ? function (obj) {
        return typeof obj;
      }
    : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol
          ? "symbol"
          : typeof obj;
      };

  /**
   * Create html element
   * @param {String} type html element
   * @param {Object} config
   */
  function createElement(type, config) {
    var htmlElement = document.createElement(type);

    if (config === undefined) {
      return htmlElement;
    }

    if (config.className) {
      htmlElement.className = config.className;
    }

    if (config.content) {
      htmlElement.textContent = config.content;
    }

    if (config.children) {
      config.children.forEach(function (el) {
        if (el !== null) {
          htmlElement.appendChild(el);
        }
      });
    }

    return htmlElement;
  }

  /**
   * @param {Object} node
   * @return {HTMLElement}
   */
  function createExpandedElement(node) {
    var iElem = createElement('i');

    if (node.expanded) {
      iElem.className = 'fa fa-caret-down';
    } else {
      iElem.className = 'fa fa-caret-right';
    }

    var caretElem = createElement('div', {
      className: 'caret-icon',
      children: [iElem]
    });

    var handleClick = node.toggle.bind(node);
    caretElem.addEventListener('click', handleClick);

    var indexElem = createElement('div', {
      className: 'json-index',
      content: node.key
    });

    var typeElem = createElement('div', {
      className: 'json-type',
      content: node.type
    });

    var keyElem = createElement('div', {
      className: 'json-key',
      content: node.key
    });

    var sizeElem = createElement('div', {
      className: 'json-size'
    });

    if (node.type === 'array') {
      sizeElem.innerText = '[' + node.children.length + ']';
    } else if (node.type === 'object') {
      sizeElem.innerText = '{' + node.children.length + '}';
    }

    var lineChildren = void 0;
    if (node.key === null) {
      lineChildren = [caretElem, typeElem, sizeElem];
    } else if (node.parent.type === 'array') {
      lineChildren = [caretElem, indexElem, sizeElem];
    } else {
      lineChildren = [caretElem, keyElem, sizeElem];
    }

    var lineElem = createElement('div', {
      className: 'line',
      children: lineChildren
    });

    if (node.depth > 0) {
      lineElem.style = 'margin-left: ' + node.depth * 24 + 'px;';
    }

    return lineElem;
  }

  /**
   * @param {Object} node
   * @return {HTMLElement}
   */
  function createNotExpandedElement(node) {
    var caretElem = createElement('div', {
      className: 'empty-icon'
    });

    var keyElem = createElement('div', {
      className: 'json-key',
      content: node.key
    });

    var separatorElement = createElement('div', {
      className: 'json-separator',
      content: ':'
    });

    var valueType = ' json-' + _typeof(node.value);
    var valueContent = String(node.value);
    var valueElement = createElement('div', {
      className: 'json-value' + valueType,
      content: valueContent
    });

    var lineElem = createElement('div', {
      className: 'line',
      children: [caretElem, keyElem, separatorElement, valueElement]
    });

    if (node.depth > 0) {
      lineElem.style = 'margin-left: ' + node.depth * 24 + 'px;';
    }

    return lineElem;
  }

  /**
   * create tree node
   * @return {Object}
   */
  function createNode() {
    return {
      key: null,
      parent: null,
      value: null,
      expanded: false,
      type: null,
      children: null,
      elem: null,
      depth: 0,

      setCaretIconRight: function setCaretIconRight() {
        var icon = this.elem.querySelector('.fa');
        icon.classList.replace('fa-caret-down', 'fa-caret-right');
      },
      setCaretIconDown: function setCaretIconDown() {
        var icon = this.elem.querySelector('.fa');
        icon.classList.replace('fa-caret-right', 'fa-caret-down');
      },
      hideChildren: function hideChildren() {
        if (this.children !== null) {
          this.children.forEach(function (item) {
            item.elem.classList.add('hide');
            if (item.expanded) {
              item.hideChildren();
            }
          });
        }
      },
      showChildren: function showChildren() {
        if (this.children !== null) {
          this.children.forEach(function (item) {
            item.elem.classList.remove('hide');
            if (item.expanded) {
              item.showChildren();
            }
          });
        }
      },


      toggle: function toggle() {
        if (this.expanded) {
          this.expanded = false;
          this.hideChildren();
          this.setCaretIconRight();
        } else {
          this.expanded = true;
          this.showChildren();
          this.setCaretIconDown();
        }
      }
    };
  }

  /**
   * Return object length
   * @param {Object} obj
   * @return {number}
   */
  function getLength(obj) {
    var length = 0;
    for (var key in obj) {
      length += 1;
    };
    return length;
  }

  /**
   * Return variable type
   * @param {*} val
   */
  function getType(val) {
    var type = typeof val === 'undefined' ? 'undefined' : _typeof(val);
    if (Array.isArray(val)) {
      type = 'array';
    } else if (val === null) {
      type = 'null';
    }
    return type;
  }

  /**
   * Recursively traverse json object
   * @param {Object} obj parsed json object
   * @param {Object} parent of object tree
   */
  function traverseObject(obj, parent) {
    for (var key in obj) {
      var child = createNode();
      child.parent = parent;
      child.key = key;
      child.type = getType(obj[key]);
      child.depth = parent.depth + 1;
      child.expanded = false;

      if (_typeof(obj[key]) === 'object') {
        child.children = [];
        parent.children.push(child);
        traverseObject(obj[key], child);
        child.elem = createExpandedElement(child);
      } else {
        child.value = obj[key];
        child.elem = createNotExpandedElement(child);
        parent.children.push(child);
      }
    }
  }

  /**
   * Create root of a tree
   * @param {Object} obj Json object
   * @return {Object}
   */
  function createTree(obj) {
    var tree = createNode();
    tree.type = getType(obj);
    tree.children = [];
    tree.expanded = true;

    traverseObject(obj, tree);
    tree.elem = createExpandedElement(tree);

    return tree;
  }

  /**
   * Recursively traverse Tree object
   * @param {Object} node
   * @param {Callback} callback
   */
  function traverseTree(node, callback) {
    callback(node);
    if (node.children !== null) {
      node.children.forEach(function (item) {
        traverseTree(item, callback);
      });
    }
  }

  /**
   * Render Tree object
   * @param {Object} tree
   * @param {String} targetElem
   */
  function render(tree, targetElem) {
    var rootElem = void 0;
    if (targetElem) {
      rootElem = document.querySelector(targetElem);
    } else {
      rootElem = document.body;
    }

    traverseTree(tree, function (node) {
      if (!node.expanded) {
        node.hideChildren();
      }
      rootElem.appendChild(node.elem);
    });
  }

  /* Export jsonView object */
  window.jsonView = {
    /**
     * Render JSON into DOM container
     * @param {String} jsonData
     * @param {String} targetElem
     */
    format: function format(jsonData, targetElem) {
      var parsedData = jsonData;
      if (typeof jsonData === 'string' || jsonData instanceof String) parsedData = JSON.parse(jsonData);
      var tree = createTree(parsedData);
      render(tree, targetElem);
    }
  };
})();
