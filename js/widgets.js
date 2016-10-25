/**
 * Created by damien on 23-Oct-16.
 */

var settings = {
    width: '600px',
    background: '#000000',
    text: '#ffffff',
    link: '#abcdef',
    textfont: 'helvetica',
    titlefont: 'georgia',
    firstparstyle: 'margin-top: 0;',
    book_cover_width: '200px',
    book_font_size: '14px',
    book_font_color: '#ccc',
    book_hr_color: '#cbe8ff'
};

var global_render = function() {}

function render_image(alt, url) {

}

function render_link(text, url, img='', img_pos='') {
    return `<a target="_blank" style="color: ${settings.link}; font: ${settings.textfont}" href="${url}">${text}</a>`;
}

function render_text(text) {
    return text.trim().replace(/"([^"]*)"\[([^\]]*)\]/g, (m, t, u) => render_link(t, u));
}

function render_paragraphs(text) {
    var with_links = render_text(text);
    return `<p style="${settings.firstparstyle}">` + with_links.replace(/ *[\r\n]+/g, '</p><p>') + '</p>';
}

function add_editor(w, x) {
    var that = w;
    var el;
    if (x.type == 'textarea') {
        el = $(`<textarea name="${x.name}" placeholder="${x.placeholder}"></textarea>`);
    } else if (x.type == 'select') {
        el = $(`<select name="${x.name}"></select>`);
        console.log(x);
        $.each(x.options, function (i, o) {
            console.log(i, o);
            if (o.name == x.selected) {
                el.append($(`<option value="${o.value}" selected>${o.name}</option>`));
            } else {
                el.append($(`<option value="${o.value}">${o.name}</option>`));
            }
        });
    } else {
        el = $(`<input type="${x.type}" name="${x.name}" placeholder="${x.placeholder}" />`);
    }
    var l = $(`<label for="${x.name}">${x.placeholder}</label>`);
    that.contents.append(l);
    if (x.type == 'textarea') {
        l.addClass('textarea');
    }
    that.contents.append(el);
    var thatel = $(that.element);
    el.change(function() { global_render(); });
};



$.widget('nle.base', {
    options: {
        change: null,
        destroyable: true
    },
    editors: [],
    editor_name: '[abstract editor]',
    class: 'base',

    _create: function() {
        var that = this;
        this.element.data('nl-class', this.class);
        this.header = $(`<h3 class="nl-editor-header">${this.editor_name}</h3>`);
        if (this.options.destroyable) {
            var destroy = $('<button class="nl-editor-destroy">X</button>');
            destroy.click(function () {
                that._destroy();
            });
            this.header.append(destroy);
            destroy.css('float: right;');
            this.header.css('position: relative;');
        }
        this.contents = $('<div class="nl-editor-contents"></div>');
        $.each(this.editors, function(i, x) {
            add_editor(that, x);
        });
        this.header.click(function() {
            that.element.toggleClass('folded');
        });
        this.element.addClass('nl-editor');
        this.element.append(this.header);
        this.element.append(this.contents);
    },

    _refresh: function() {
        this._trigger('change');
    },

    _destroy: function() { this.element.remove(); this.contents.remove(); },

    _setOptions: function() {
        this._superApply(arguments);
        this._refresh();
    },

    _setOption: function() {
        this._superApply(arguments);
        this._refresh();
    },

    get_values: function() {
        var ret = {};
        var el = this.contents;
        /*
        $.each(this.contents.children(), function(i, e) {
            e = $(e);
            ret[e.attr('name')] = e.val();
        });
        /*/
        $.each(this.editors, function(i, e) {
            ret[e.name] = el.find(`> [name=${e.name}]`).val();
        });
        //*/
        //console.log("get_values", this.class, ret);
        return ret;
    },

    render: function() {
        return '[this abstract editor has nothing to render]';
    }
});

$.widget('nle.nlimage', $.nle.base, {
    options: {},
    editors: [
        {type: 'text', placeholder: 'Full URL', name: 'url'},
        {type: 'text', placeholder: 'Alternate text', name: 'alt'}
    ],
    editor_name: 'Image',
    class: 'nlimage',

    _create: function() { this._superApply(arguments); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },

    render: function() {
        var values = this.get_values();
        return `<img src="${values.url}" alt="${values.alt}" />`;
    }
});

$.widget('nle.nltitle', $.nle.base, {
    options: {},
    editors: [
        {type: 'text', placeholder: 'Contents...', name: 'text'},
        {
            type: 'select',
            name: 'size',
            options: [
                {name: 'h1', value: 'h1'},
                {name: 'h2', value: 'h2'},
                {name: 'h3', value: 'h3'},
                {name: 'h4', value: 'h4'},
                {name: 'h5', value: 'h5'}
            ],
            selected: 'h3',
            placeholder: 'Title size'
        }],
    editor_name: 'Title',
    class: 'nltitle',

    _create: function() { this._superApply(arguments); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },

    render: function() {
        var values = this.get_values();
        return `<${values.size}>${render_text(values.text)}</${values.size}>`;
    }
});

$.widget('nle.nltext', $.nle.base, {
    options: {},
    editors: [{type: 'textarea', placeholder: 'Contents...', name: 'text'}],
    editor_name: 'Text',
    class: 'nltext',

    _create: function() { this._superApply(arguments); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },

    render: function() {
        return render_paragraphs(this.get_values().text);
    }
});

$.widget('nle.nllink', $.nle.base, {
    options: {},
    editors: [
        {type: 'text', placeholder: 'Full URL', name: 'url'},
        {type: 'text', placeholder: 'Link text', name: 'text'}
    ],
    editor_name: 'Link',
    class: 'nllink',

    _create: function() { this._superApply(arguments); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },

    render: function() {
        var values = this.get_values();
        return render_link(values.text, values.url);
    }
});

$.widget('nle.nlbook', $.nle.base, {
    options: {},
    editors: [
        {name: 'cover', type: 'text', placeholder: 'Book cover URL'},
        {name: 'descr', type: 'textarea', placeholder: 'Blurb'},
        {name: 'seller_name', type: 'text', placeholder: 'Shop'},
        {name: 'seller_url', type: 'text', placeholder: 'Shop URL'}
    ],
    editor_name: 'Book promo',
    class: 'nlbook',

    _create: function() {
        this._superApply(arguments);
        this.adder = $('<button>Add a shop</button>');
        this.element.append(this.adder);
        var that = this;
        this.adder.click(function() {
            var e = {name: 'seller_name', type: 'text', placeholder: 'Shop'};
            that.editors.push(e);
            add_editor(that, e);
            e = {name: 'seller_url', type: 'text', placeholder: 'Shop URL'};
            that.editors.push(e);
            add_editor(that, e);
            //that.contents.append(that.adder);
        });
    },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },

    render: function() {
        var values = this.get_values();
        console.log(values);
        var cover = this.element.find('[name=cover]').val();
        var descr = render_paragraphs(this.element.find('[name=descr]').val());
        var names = this.element.find('[name=seller_name]').val();
        var urls = this.element.find('[name=seller_url]').val();
        var links = '';

        for (var i = 0; i < 4; ++i) {
            var name = $(names[i]).val();
            var url = $(urls[i]).val();
            if (name != '') {
                links += `<td>[${render_link(name, url)}]</td>`;
            }
        }
        return `<table style="color: #ccc; width: 100%; font-family: ${settings.font}; font-size: 14px; margin-bottom: 1em;" cellpadding="0" cellspacing="0">` +
            '<tr>' +
            '<td style="width: 200px; vertical-align: top;">' +
            `<img alt="" src="${cover}"/>` +
            '</td>' +
            '<td style="padding: 0 .5em 0 .5em; vertical-align: top;">' +
            `${descr}` +
            '<hr size="1" style="color: #cbe8ff; width: 250px; margin: .5em auto .25em auto;"/>' +
            '<table style="width: 100%; color: #ccc; text-align: center;">' +
            `<tr>${links}` +
            '</tr>' +
            '</table>' +
            '</td>' +
            '</tr>' +
            '</table>';
    }
});

$.widget('nle.nlline', $.nle.base, {
    options: {},
    editors: [],
    editor_name: 'Horizontal separator',
    class: 'nlline',

    _create: function() { this._superApply(arguments); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },

    render: function() {
        return '<hr/>';
    }
});

$.widget('nle.genList', $.nle.base, {
    options: {},
    prefix: '',
    suffix: '',

    editor_name: '[generic list]',

    adders: [
        {'name': 'Title', cls: 'nltitle'},
        {'name': 'Text', cls: 'nltext'},
        {'name': 'Link', cls: 'nllink'},
        {'name': 'Image', cls: 'nlimage'},
        {'name': 'Book', cls: 'nlbook'},
        {'name': 'Line', cls: 'nlline'},
        {'name': 'Table', cls: 'nltable'},
        {'name': 'Section', cls: 'nldiv'},
    ],

    class: 'genList',

    _create: function() {
        this._superApply(arguments);
        var wrapper = this.contents;
        this.contents = $('<div class="nl-editor-list-contents"></div>');
        this.adder_header = $('<h3 class="nl-editor-list-adder-header">Add...</h3>');
        this.adder_contents = $('<div class="nl-editor-list-adder-contents"></div>');
        var that = this;
        $.each(this.adders, function(i, a) {
            (function (name, cls) {
                var el = $(`<button class="nl-editor-list-adder-link" name="add-${name}">${name}</button>`);
                that.adder_contents.append(el);
                el.click(function() {
                    var e = that.add_el(); e[cls]();
                    e[cls]('option', 'change', that.changed);
                    that._trigger('change');
                    console.log('new editor', e[cls]('option', 'change'));
                });
            })(a.name, a.cls);
        });
        wrapper.append(this.contents);
        wrapper.append(this.adder_header);
        wrapper.append(this.adder_contents);
        this.contents.sortable({
            handle: '.nl-editor-header',
            items: '> div',
            containment: 'parent',
            axis: 'y',
            change: function() { console.log('changed order!'); that._trigger('change'); }
        });
        this.element.addClass('nl-editor-list');
        wrapper.addClass('nl-editor-contents');
    },

    changed: function() {
        this._refresh();
        this._trigger('change');
    },

    add_el: function() {
        var el = $('<div></div>');
        this.contents.append(el);
        this.contents.sortable('refresh');
        return el;
    },

    _trigger: function() { this._superApply(arguments); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },

    changed: function() {
        this._trigger('change');
    },

    render: function() {
        var ret = [];
        var editors = this.contents.find('> .nl-editor');
        console.log(editors);
        var pfx = this.prefix;
        var sfx = this.suffix;
        console.log("rendering list");
        $.each(editors, function(i, ed) {
            var cls = $(ed).data('nl-class');
            var ren = $(ed)[cls]('render');
            console.log(pfx, ren, sfx);
            //console.log(cls, $(ed)[cls]('get_values'), ren);
            ret.push(ren);
        });
        console.log(ret);
        return pfx + ret.join(sfx + pfx) + sfx;
    }
});

$.widget('nle.nltd', $.nle.genList, {
    editor_name: 'Cell',
    class: 'nltd',
    _create: function() { this._superApply(arguments); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },
    render: function() { return this._superApply(arguments); }
});

$.widget('nle.nltr', $.nle.genList, {
    editor_name: 'Row',
    prefix: '<td>',
    suffix: '</td>',
    adders: [
        {'name': 'Cell', cls: 'nltd'},
    ],
    class: 'nltr',
    _create: function() { this._superApply(arguments); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },
    render: function() { return this._superApply(arguments); }
});

$.widget('nle.nltable', $.nle.genList, {
    editor_name: 'Table',
    prefix: '<tr>',
    suffix: '</tr>',
    adders: [
        {'name': 'Row', cls: 'nltr'},
    ],
    class: 'nltable',
    render: function() {
        return '<table><tbody>' + this._superApply(arguments) + '</tbody></table>';
    },
    _create: function() { this._superApply(arguments); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },
    render: function() { return '<table><tbody>' + this._superApply(arguments) + '</tbody></table>'; }
});

$.widget('nle.nldiv', $.nle.genList, {
    editor_name: 'Section',
    class: 'nldiv',
    render: function() {
        return '<div>' + this._superApply(arguments) + '</div>';
    },
    _create: function() { this._superApply(arguments); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },
    render: function() { return this._superApply(arguments); }
});

$.widget('nle.settings', $.nle.base, {
    options: {
        change: null,
        destroyable: false,
    },

    editors: [
        {name: 'width', type: 'text', placeholder: 'Email width'},
        {name: 'background', type: 'color', placeholder: 'Background color'},
        {name: 'text', type: 'color', placeholder: 'Text color'},
        {name: 'link', type: 'color', placeholder: 'Link color'},
        {name: 'textfont', type: 'text', placeholder: 'Text font'},
        {name: 'titlefont', type: 'text', placeholder: 'Title font'},
        {name: 'firstparstyle', type: 'text', placeholder: 'Style for first paragraph'}
    ],

    editor_name: 'Settings',

    class: 'settings',

    _create: function() {
        this._superApply(arguments);
        this.element.find('[name=width]').val(settings.width);
        this.element.find('[name=background]').val(settings.background);
        this.element.find('[name=text]').val(settings.text);
        this.element.find('[name=link]').val(settings.link);
        this.element.find('[name=textfont]').val(settings.textfont);
        this.element.find('[name=titlefont]').val(settings.titlefont);
        this.element.find('[name=firstparstyle]').val(settings.firstparstyle);
        this.element.addClass('nl-editor-list');
    },

    _refresh: function() {
        this._superApply(arguments);
        var values = this.get_values();
        settings.background = values.background;
        settings.link = values.link;
        settings.text = values.text;
        settings.width = values.width;
        settings.textfont = values.textfont;
        settings.titlefont = values.titlefont;
        settings.firstparstyle = values.firstparstyle;
        this._trigger('change');
    }
});

$.widget('nle.NLGen', {
    options: {},

    _create: function() {

    },

    _refresh: function() {

    },

    _destroy: function() {

    },

    _setOptions: function() {
        this._superApply(arguments);
        this._refresh();
    },

    _setOption: function() {
        this._superApply(arguments);
        this._refresh();
    }
});
