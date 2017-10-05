var Parser = require('prescribe');

module.exports = function (h, html, wrap) {
    if (typeof wrap === 'undefined') wrap = true;
    var parser = new Parser(html.trim());
    var nodes = [];
    var current;

    parser.readTokens({
        chars: function (tok) {
            if (current) {
                current.children.push(tok.text);
            } else {
                nodes.children.push(tok.text);
            }
        },
        startTag: function (tok){
            if (tok.unary || tok.html5Unary || tok.tagName === 'input') {
                //NOTE this is how we will handle unary elements. Prescribe's unary element detection isn't perfect, so in the case of input elements, for example, we need to check for those explicity.
                var node = h(tok.tagName, {attributes: Object.assign({}, tok.attrs, tok.booleanAttrs)});
                if (current) {
                    current.children.push(node);
                } else {
                    nodes.push(node);
                }
            } else {
                current = {tok: tok, parent: current, children:[]};
            }
        },
        endTag: function (tok){
            //TODO add support for SVG
            var props = {attributes: Object.assign({}, current.tok.attrs, current.tok.booleanAttrs)};

            if (current.children.every(child => typeof child === 'string')) {
                props.innerHTML = current.children.reduce((final,child) => final + child, '');
                current.children = [];
            }

            var node = h(current.tok.tagName, props, current.children);
            current = current.parent;
            if (!current) {
                nodes.push(node);
            } else {
                current.children.push(node);
            }
        }
    });
    // debugger;
    return nodes.length > 1 ? wrap ? h('div', nodes) : nodes : wrap ? nodes[0] : nodes;
}
