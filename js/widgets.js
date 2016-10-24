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
    firstparstyle: 'margin-top: 0;'
};

function render_link(text, url) {
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
    that.contents.append($(`<label for="${x.name}">${x.placeholder}</label>`));
    that.contents.append(el);
    that._on(el, {change: '_refresh'});
};



$.widget('nle.base', {
    options: {
        change: null
    },
    editors: [],
    editor_name: '[abstract editor]',

    _create: function() {
        var that = this;
        var header = $(`<h3 class="nl-editor-header">${this.editor_name}</h3>`);
        var destroy = $('<button class="nl-editor-destroy">X</button>');
        destroy.click(function() { that._destroy(); });
        header.append(destroy);
        destroy.css('float: right;');
        header.css('position: relative;');
        this.contents = $('<div class="nl-editor-contents"></div>');
        $.each(this.editors, function(i, x) {
            add_editor(that, x);
        });
        header.click(function() {
            that.contents.toggleClass('hidden');
        });
        this.element.addClass('nl-editor');
        this.element.append(header);
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
        var el = this.element;
        $.each(this.editors, function(i, e) {
            ret[e.name] = el.find(`[name=${e.name}]`).val();
        });
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

    _create: function() { this._superApply(arguments); this.element.data('nl-class', 'nlimage'); },
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

    _create: function() { this._superApply(arguments); this.element.data('nl-class', 'nltitle'); },
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

    _create: function() { this._superApply(arguments); this.element.data('nl-class', 'nltext'); },
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

    _create: function() { this._superApply(arguments); this.element.data('nl-class', 'nllink'); },
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

    _create: function() {
        this._superApply(arguments);
        this.element.data('nl-class', 'nlbook');
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
            that.append(that.adder);
        });

    },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },

    render: function() {
        var values = this.get_values();
        console.log(values);
        return "todo";
        var cover = this.element.find('[name=cover]').val();
        var descr = render_paragraphs(this.element.find('[name=descr]'));
        var names = this.element.find('[name=seller_name]');
        var urls = this.element.find('[name=seller_url]');
        var links = '';

        for (var i = 0; i < 4; ++i) {
            var name = $(names[i]).val();
            var url = $(urls[i]).val();
            if (name != '') {
                links += `<td>[${render_link(name, url)}]</td>`;
            }
        }
        return `<table style="color: #ccc; width: 100%; font-family: helvetica; font-size: 14px; margin-bottom: 1em;" cellpadding="0" cellspacing="0">
<tr>
<td style="width: 200px; vertical-align: top;">
<img alt="" src="${cover}"/>
</td>
<td style="padding: 0 .5em 0 .5em; vertical-align: top;">
${descr}
<hr size="1" style="color: #cbe8ff; width: 250px; margin: .5em auto .25em auto;"/>
<table style="width: 100%; color: #ccc; text-align: center;">
<tr>${links}
</tr>
</table>
</td>
</tr>
</table>`;
    }
});

$.widget('nle.nlline', $.nle.base, {
    options: {},
    editors: [],
    editor_name: 'Horizontal separator',

    _create: function() { this._superApply(arguments); this.element.data('nl-class', 'nlline'); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },

    render: function() {
        return '<hr/>';
    }
});

$.widget('nle.genList', {
    options: {},

    _create: function() {
        this._superApply(arguments);
        this.contents = $('<div class="nl-editor-list-contents"></div>');
        this.adder_header = $('<h3 class="nl-editor-list-adder-header">Add...</h3>');
        this.adder_contents = $(`<div class="nl-editor-list-adder-contents">
            <button class="nl-editor-list-adder-link" id="add-title">Title</button>
            <button class="nl-editor-list-adder-link" id="add-text">Text</button>
            <button class="nl-editor-list-adder-link" id="add-link">Link</button>
            <button class="nl-editor-list-adder-link" id="add-image">Image</button>
            <button class="nl-editor-list-adder-link" id="add-book">Book</button>
            <button class="nl-editor-list-adder-link" id="add-separator">Separator</button>
        </div>`);
        this.element.append(this.contents);
        this.element.append(this.adder_header);
        this.element.append(this.adder_contents);
        this.contents.sortable({
            handle: '.nl-editor-header',
            items: '> div',
            containment: 'parent',
            axis: 'y'
        });
        var that = this;
        this.adder_contents.find('#add-title').click(function() {
            that.add_el().nltitle({change: this.changed});
        });
        this.adder_contents.find('#add-text').click(function() {
            that.add_el().nltext({change: this.changed});
        });
        this.adder_contents.find('#add-link').click(function() {
            that.add_el().nllink({change: this.changed});
        });
        this.adder_contents.find('#add-image').click(function() {
            that.add_el().nlimage({change: this.changed});
        });
        this.adder_contents.find('#add-book').click(function() {
            that.add_el().nlbook({change: this.changed});
        });
        this.adder_contents.find('#add-separator').click(function() {
            that.add_el().nlline({change: this.changed});
        });
    },

    add_el: function() {
        var el = $('<div></div>');
        this.contents.append(el);
        this.contents.sortable('refresh');
        return el;
    },

    _refresh: function() {
        this._superApply(arguments);
    },

    _destroy: function() {
        this._superApply(arguments);
    },

    _setOptions: function() {
        this._superApply(arguments);
        this._refresh();
    },

    _setOption: function() {
        this._superApply(arguments);
        this._refresh();
    },

    changed: function() {
        this._trigger('change');
    },

    render: function() {
        var ret = '';
        var editors = this.contents.find('.nl-editor');
        console.log(editors);
        $.each(editors, function(i, ed) {
            var cls = $(ed).data('nl-class');
            var ren = $(ed)[cls]('render');
            console.log(cls, $(ed)[cls]('get_values'), ren);
            ret += ren;
        });
        return ret;
    }
});

$.widget('nle.settings', $.nle.base, {
    options: {
        'change': null
    },

    editors: [
        {name: 'width', type: 'text', placeholder: 'Email width'},
        {name: 'background', type: 'color', placeholder: 'Background color'},
        {name: 'text', type: 'color', placeholder: 'Text color'},
        {name: 'link', type: 'color', placeholder: 'Link color'},
        {name: 'textfont', type: 'text', placeholder: 'Text font'},
        {name: 'titlefont', type: 'text', placeholder: 'Title font'}
    ],

    editor_name: 'Settings',

    _create: function() {
        this._superApply(arguments);
        this.element.find('[name=width]').val(settings.width);
        this.element.find('[name=background]').val(settings.background);
        this.element.find('[name=text]').val(settings.text);
        this.element.find('[name=link]').val(settings.link);
        this.element.find('[name=textfont]').val(settings.textfont);
        this.element.find('[name=titlefont]').val(settings.titlefont);
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
