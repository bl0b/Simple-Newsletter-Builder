/**
 * Created by damien on 23-Oct-16.
 */

/*
 * Base widget
 *
 * Implements all basic functionality for an editor widget.
 */

$.widget('nle.base', {
    options: {
        change: null,
        destroyable: true
    },
    editors: [],
    settings: [],
    editor_name: '[abstract editor]',
    class: 'base',

    /*
     * TODO Need a checkbox for EACH setting to disable it. Except in the root container.
     */

    _create: function() {
        var that = this;
        this.element.data('nl-class', this.class);
        this.header = $(`<h3 class="nl-editor-header ui-widget-header">${this.editor_name}</h3>`);
        this.header.hover(() => that.header.addClass('ui-state-hover'), () => that.header.removeClass('ui-state-hover'));
        if (this.options.destroyable) {
            var destroy = $('<button class="nl-editor-destroy">X</button>');
            destroy.click(function () {
                that._destroy();
            });
            this.header.append(destroy);
            destroy.css('float: right;');
            this.header.css('position: relative;');
        }
        this.contents = $('<div class="nl-editor-contents ui-widget-content"></div>');
        if (this.settings.length > 0) {
            this.header_settings = $(`<h3 class="nl-editor-settings-header ui-widget-header">Settings</h3>`);
            this.header_settings.hover(() => that.header_settings.addClass('ui-state-hover'), () => that.header_settings.removeClass('ui-state-hover'));
            this.contents_settings = $('<div class="nl-editor-settings-contents ui-widget-content"></div>');
            this.settings_div = $('<div class="nl-editor-settings ui-widget"></div>');
            this.settings_div.append(this.header_settings);
            this.settings_div.append(this.contents_settings);
            this.contents.append(this.settings_div);
            this.header_settings.click(function () {
                that.settings_div.toggleClass('folded');
            });
        }
        if (this.editors.length > 0 || this.settings.length > 0 || this.adders !== undefined) {
            $.each(this.editors, function (i, x) {
                add_editor(that.contents, that, x);
            });
            var rev = this.element.parents('.nl-editor').map(function() {
                var el = $(this);
                var stng = el[el.data('nl-class')]('get_settings');
                console.log(stng);
                return stng;
            });
            for (var i = rev.length - 1; i >= 0; --i) {
                attach_settings(rev[i]);
            }
            $.each(this.settings, function (i, x) {
                add_setting(that.contents_settings, that, x);
            });
            this.element.parents('.nl-editor').map(function() {
                detach_settings();
            });
            this.header.click(function () {
                that.element.toggleClass('folded');
            });
        } else {
            this.element.addClass('folded');
        }
        this.element.addClass('nl-editor');
        this.element.addClass('ui-widget');
        this.element.append(this.header);
        this.element.append(this.contents);
        this.element.hover(() => that._refresh(), () => that._refresh());
    },

    enable_setting: function(name) {
        this.contents_settings.find(`label[data-for=${name}] > input[type=checkbox]`).prop('checked', true);
        this.contents_settings.find(`input[name=${name}]`).prop('disabled', false);
    },

    changed: function() {
        console.log(this);
        this[this.class]('_refresh');
    },

    _refresh: function() {
        this._trigger('change');
    },

//    _trigger: function(e) { this.element.trigger(e); },
    _trigger: function(e) { this._superApply(arguments); },
    _destroy: function() {
        if (this.destroyed) {
            return;
        }
        this.destroyed = true;
        var parent = $(this.element).parents('.nl-editor').first();
        //console.log(parent);
        this.element.remove(); this.contents.remove();
        this._trigger('change');
    },

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
        $.each(this.editors, function(i, e) {
            ret[e.name] = get_input_value(el, e);
        });
        //console.log("get_values", this.class, ret);
        return ret;
    },

    get_settings: function() {
        var ret = {};
        var el = this.contents_settings;
        //console.log(this.class, "get_settings");
        $.each(this.settings, function(i, e) {
            //if (input_is_enabled(el, e.name)) {
                ret[e.name] = get_input_value(el, e);
            //}
        });
        //console.log(ret);
        return ret;
    },

    render: function() {
        attach_settings(this.get_settings());
        var ret = this.render_impl();
        if (this.element.is(':hover')) {
            ret = '<span class="live-hover">' + ret + '</span>';
        }
        detach_settings();
        return ret;
    },

    render_impl: function() {
        return '[this abstract editor has nothing to render]';
    },

    get_structure: function() {
        return {class: this.class, settings: this.get_settings(), values: this.get_values()};
    },

    set_structure: function(json) {
        var that = this;
        $.each(this.settings, function(i, e) {
            set_input_value(that.contents_settings, e, json.settings[e.name]);
        });
        $.each(json.settings, function(k, v) {
            enable_setting(that, k);
        });
        $.each(this.editors, function(i, e) {
            set_input_value(that.contents, e, json.values[e.name]);
        });
    }
});


/*
 * Image widget
 *
 * Renders an image tag with alt text
 */

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
    _trigger: function(e) { this._superApply(arguments); },
    render: function() { return this._superApply(arguments); },

    render_impl: function() {
        var values = this.get_values();
        return render_image(values.alt, values.url);
    }
});


/*
 * Title widget
 *
 * Renders a Hn tag, with n between 1 and 5
 */

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
    _trigger: function(e) { this._superApply(arguments); },

    render: function() { return this._superApply(arguments); },

    render_impl: function() {
        var values = this.get_values();
        return `<${values.size} style="font-family: ${cfg('titlefont')};">${render_text(values.text)}</${values.size}>`;
    }
});


/*
 * Text widget
 *
 * Renders text, either structured in paragraphs or raw with manual breaks
 */

$.widget('nle.nltext', $.nle.base, {
    options: {},
    editors: [{type: 'textarea', placeholder: 'Contents', name: 'text'}],
    settings: [{type: 'checkbox', placeholder: 'Paragraphs', name: 'with_paragraphs', prefill: function() { return false; }}],
    editor_name: 'Text',
    class: 'nltext',

    _create: function() { this._superApply(arguments); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },
    _trigger: function(e) { this._superApply(arguments); },

    render: function() { return this._superApply(arguments); },

    render_impl: function() {
        return render_paragraphs(this.get_values().text, cfg('with_paragraphs'), cfg('firstparstyle'), cfg('parstyle'));
    }
});


/*
 * Link widget
 *
 * Renders an A tag, with text and an image positioned on any side.
 */

$.widget('nle.nllink', $.nle.base, {
    options: {},
    editors: [
        {type: 'text', placeholder: 'Full URL', name: 'url'},
        {type: 'text', placeholder: 'Link text', name: 'text'},
        {type: 'text', placeholder: 'Image URL', name: 'img'}
    ],
    settings: [
        {type: 'select', placeholder: 'Image position', options: [
            {name: 'Top', value: 'top'},
            {name: 'Left', value: 'left'},
            {name: 'Bottom', value: 'bottom'},
            {name: 'Right', value: 'right'}
        ],
        selected: 'top',
        name: 'img_pos'}
    ],
    editor_name: 'Link',
    class: 'nllink',

    _create: function() { this._superApply(arguments); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },
    _trigger: function(e) { this._superApply(arguments); },

    render: function() { return this._superApply(arguments); },

    render_impl: function() {
        var values = this.get_values();
        return render_link(values.text, values.url, values.img, cfg('img_pos'));
    }
});


/*
 * Book widget
 *
 * Renders a book promo, with cover on side and any number of online store links
 */

$.widget('nle.nlbook', $.nle.base, {
    options: {},
    editors: [
        {name: 'cover', type: 'text', placeholder: 'Book cover URL'},
        {name: 'descr', type: 'textarea', placeholder: 'Blurb'}
    ],
    settings: [
        {type: 'select', placeholder: 'Template', options: [
            {name: 'Cover on top', value: 'top'},
            {name: 'Cover on left', value: 'left'},
            {name: 'Cover on right', value: 'right'}
        ], name: 'template', prefill: 'left'},
        {type: 'select', placeholder: 'Blurb align',
            options: [
                {name: 'Left', value: 'left'},
                {name: 'Center', value: 'center'},
                {name: 'Right', value: 'right'}
            ],
            name: 'blurbalign', prefill: () => cfg('textalign')},
        {type: 'text', placeholder: 'Cover width', name: 'bookcoverwidth', prefill: '200px'},
        {type: 'text', placeholder: 'Blurb size', name: 'bookblurbsize', prefill: () => cfg('fontsize')},
        {type: 'color', placeholder: 'Blurb color', name: 'bookblurbcolor'},
        {type: 'text', placeholder: 'Link size', name: 'booklinksize'},
        {type: 'color', placeholder: 'Link color', name: 'booklinkcolor'}
    ],
    editor_name: 'Book promo',
    class: 'nlbook',

    add_shop: function(name, url) {
        var e = {name: 'retailer_name', type: 'text', placeholder: 'Shop', prefill: name};
        add_editor(this.contents, this, e);
        e = {name: 'retailer_url', type: 'text', placeholder: 'Shop URL', prefill: url};
        add_editor(this.contents, this, e);
    },

    remove_shop: function() {
        this.contents.find('input[name="retailer_url"]:last-child').remove();
        this.contents.find('label[data-for="retailer_url"]:last-child').remove();
        this.contents.find('input[name="retailer_name"]:last-child').remove();
        this.contents.find('label[data-for="retailer_name"]:last-child').remove();
    },

    _create: function() {
        this._superApply(arguments);
        add_editor(this.contents, this, {name: 'add_shop', type: 'button', placeholder: 'Add a shop'});
        add_editor(this.contents, this, {name: 'remove_shop', type: 'button', placeholder: 'Remove a shop'});
        this.add_shop('', '');
        this.adder = this.contents.find('button[name=add_shop]');
        this.remover = this.contents.find('button[name=remove_shop]');
        var that = this;
        this.adder.click(function() {
            that.add_shop(undefined, undefined);
            that._refresh();
        });
        this.remover.click(function() {
            that.remove_shop();
            that._refresh();
        });
    },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },
    _trigger: function(e) { this._superApply(arguments); },

    render: function() { return this._superApply(arguments); },

    get_values: function() {
        return {
            cover: this.element.find('[name=cover]').val(),
            descr: this.element.find('[name=descr]').val(),
            retailer_name: $.makeArray(this.element.find('[name=retailer_name]').map((i, e) => $(e).val())),
            retailer_url: $.makeArray(this.element.find('[name=retailer_url]').map((i, e) => $(e).val()))
        };
    },

    render_impl: function() {
        //var values = this.get_values();
        //console.log(values);
        var cover = this.element.find('[name=cover]').val();
        var descr = render_paragraphs(this.element.find('[name=descr]').val(), true, cfg('firstparstyle'), cfg('parstyle'));
        var names = this.element.find('[name=retailer_name]').map((i, e) => $(e).val());
        var urls = this.element.find('[name=retailer_url]').map((i, e) => $(e).val());
        var links = [];

        for (var i = 0; i < names.length; ++i) {
            //var name = $(names[i]).val();
            //var url = $(urls[i]).val();
            links.push(`<td>[${render_link(names[i], urls[i])}]</td>`);
        }
        links = links.join('');
        //console.log("book links", names, urls, links);
        links = `<table style="width: 100%; font-size: ${cfg('booklinksize')}; font-family: ${cfg('textfont')}; color: ${cfg('booklinkcolor')}; text-align: center;"><tr>${links}</tr></table>`;
        var cover = `<td style="width: ${cfg('bookcoverwidth')}; vertical-align: top;"><img alt="" src="${cover}"/></td>`;
        var blurb = `<td style="padding: 0 .5em 0 .5em; vertical-align: top; text-align: ${cfg('blurbalign')};">${descr}` +
                    '<hr size="1" style="color: #cbe8ff; width: 250px; margin: .5em auto .25em auto;"/>' +
                    links +
                    '</td>';
        var table = `<table style="color: ${cfg('bookblurbcolor')}; width: 100%; font-family: ${cfg('textfont')}; font-size: ${cfg('bookblurbsize')}; margin-bottom: 1em;" cellpadding="0" cellspacing="0">`;
        var template = cfg('template');
        if (template == 'left') {
            return `${table}<tr>${cover}${blurb}</tr></table>`;
        } else if (template == 'right') {
            return `${table}<tr>${blurb}${cover}</tr></table>`;
        } else if (template == 'top') {
            return `${table}<tr>${cover}</tr><tr>${blurb}</tr></table>`;
        }
    },

    set_structure: function(json) {
        var that = this;
        $.each(this.settings, function(i, e) {
            set_input_value(that.contents_settings, e, json.settings[e.name]);
        });
        $.each(json.settings, function(k, v) {
            enable_setting(that, k);
        });
        var values = json.values;
        //console.log(values);
        $.each(this.editors, function(i, e) {
            set_input_value(that.contents, e, json.values[e.name]);
        });
        this.remove_shop();
        for (var i = 0; i < json.values.retailer_name.length; ++i) {
            this.add_shop(json.values.retailer_name[i], json.values.retailer_url[i]);
        }
    }

});


/*
 * Line widget
 *
 * renders an HR tag
 */

$.widget('nle.nlline', $.nle.base, {
    options: {change: null},
    settings: [{name: 'hr_style', type: 'text', placeholder: 'Style'}],
    editors: [],
    editor_name: 'Horizontal separator',
    class: 'nlline',

    _create: function() { this._superApply(arguments); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },
    _trigger: function(e) { this._superApply(arguments); },

    render: function() { return this._superApply(arguments); },

    render_impl: function() {
        var sty = cfg('hr_style');
        if (sty) {
            sty = ' style="' + sty + '"';
        } else {
            sty = '';
        }
        return `<hr${sty}/>`;
    }
});


/*
 * Generic container widget
 *
 * Implements the additional functionality to render a sequence of widgets
 */

$.widget('nle.genList', $.nle.base, {
    options: {},
    prefix: '',
    suffix: '',

    editor_name: 'Contents',

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
        this.adder_div = $('<div class="nl-editor-list-adder ui-widget"></div>');
        this.adder_header = $('<h3 class="nl-editor-list-adder-header ui-widget-header">Add...</h3>');
        this.adder_contents = $('<div class="nl-editor-list-adder-contents ui-widget-content"></div>');
        var that = this;
        $.each(this.adders, function(i, a) {
            (function (name, cls) {
                var el = $(`<button class="nl-editor-list-adder-link" name="add-${name}">${name}</button>`);
                that.adder_contents.append(el);
                el.button();
                el.click(function() {
                    var e = that.add_el(); e[cls]();
                    e[cls]('option', 'change', () => that._trigger('change'));
                });
            })(a.name, a.cls);
        });
        wrapper.append(this.contents);
        this.adder_div.append(this.adder_header);
        this.adder_div.append(this.adder_contents);
        wrapper.append(this.adder_div);
        this.contents.sortable({
            handle: '.nl-editor-header',
            items: '> div',
            containment: '.nl-editor-list-contents',
            axis: 'y',
            forcePlaceholderSize: true,
            change: function() { /*console.log('changed order!');*/ that.element._trigger('change'); }
        });
        $('.nl-editor-list-contents').sortable('option', 'connectWith', '.nl-editor-list-contents');

        this.element.addClass('nl-editor-list');
        wrapper.addClass('nl-editor-contents');
    },

    changed: function(ev) {
        //console.log(ev, ev.target);
        $(ev.target).trigger('change');
    },

    add_el: function() {
        var el = $('<div></div>');
        this.contents.append(el);
        this.contents.sortable('refresh');
        return el;
    },

    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },
    _trigger: function(e) { this._superApply(arguments); },

    render: function() {
        attach_settings(this.get_settings());
        var ret = this.render_impl();
        if (this.element.is(':hover') && this.contents.find(':hover').length == 0) {
            ret = '<span class="live-hover">' + ret + '</span>';
        }
        detach_settings();
        return ret;
    },


    render_impl: function() {
        var ret = [];
        var editors = this.contents.find('> .nl-editor');
        //console.log(editors);
        var pfx = this.prefix;
        var sfx = this.suffix;
        //console.log("rendering list");
        $.each(editors, function(i, ed) {
            var cls = $(ed).data('nl-class');
            var ren = $(ed)[cls]('render');
            //console.log(pfx, ren, sfx);
            //console.log(cls, $(ed)[cls]('get_values'), ren);
            ret.push(ren);
        });
        //console.log(ret);
        return ret.join('');
    },

    get_structure: function() {
        var contents_json = [];
        this.contents.find('> .nl-editor').each(function(i, el) {
            var cls = $(el).data('nl-class');
            contents_json.push($(el)[cls]('get_structure'));
        });
        return {class: this.class, settings: this.get_settings(), contents: contents_json};
    },

    set_structure: function(json) {
        var that = this;
        $.each(this.settings, function(i, e) {
            set_input_value(that.contents_settings, e, json.settings[e.name]);
        });
        $.each(json.settings, function(k, v) {
            enable_setting(that, k);
        });
        this.contents.empty();
        $.each(json.contents, function(i, struc) {
            var e = that.add_el(); e[struc.class]();
            e[struc.class]('set_structure', struc);
            e[struc.class]('option', 'change', () => that._trigger('change'));
        });
    }

});


/*
 * Table cell widget
 *
 * Renders a TD tag. Implemented as a sequence container.
 */

$.widget('nle.nltd', $.nle.genList, {
    editor_name: 'Cell',
    class: 'nltd',
    settings: [
        {name: 'colspan', type: 'number', placeholder: 'Column span', prefill: function() { return 0; }},
        {name: 'border', type: 'text', placeholder: 'Border', prefill: function() { return ''; }},
        {name: 'width', type: 'text', placeholder: 'Width', prefill: function() { return ''; }},
        {name: 'textalign', type: 'select', placeholder: 'Align',
            options: [
                {name: 'Left', value: 'left'},
                {name: 'Center', value: 'center'},
                {name: 'Right', value: 'right'}
            ], selected: 'left'},
        {name: 'textvertalign', type: 'select', placeholder: 'Vertical align',
            options: [
                {name: 'Top', value: 'top'},
                {name: 'Middle', value: 'middle'},
                {name: 'Bottom', value: 'bottom'}
            ], selected: 'top'}
    ],
    _create: function() { this._superApply(arguments); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },
    render: function() { return this._superApply(arguments); },
    _trigger: function(e) { this._superApply(arguments); },
    render_impl: function() {
        var style=`background:${cfg('background')};border:${cfg('border') || 0};`;
        style += `font-family:${cfg('textfont')};font-size:${cfg('fontsize')};`;
        style += `text-align:${cfg('textalign')};`;
        style += `vertical-align:${cfg('textvertalign')};`;
        var w = cfg('width');
        if (w) {
            style += `width:${w};`;
        }
        return `<td style="${style}">` + this._superApply(arguments) + '</td>';
    }
});


/*
 * Table row widget
 *
 * Renders a TR tag. Can only contain table cells.
 */

$.widget('nle.nltr', $.nle.genList, {
    editor_name: 'Row',
    adders: [
        {'name': 'Cell', cls: 'nltd'},
    ],
    class: 'nltr',
    _create: function() { this._superApply(arguments); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },
    render: function() { return this._superApply(arguments); },
    _trigger: function(e) { this._superApply(arguments); },
    render_impl: function() { return '<tr>' + this._superApply(arguments) + '</tr>'; }
});


/*
 * Table widget
 *
 * Renders a TABLE tag. Can only contain table rows.
 */

$.widget('nle.nltable', $.nle.genList, {
    editor_name: 'Table',
    adders: [
        {'name': 'Row', cls: 'nltr'},
    ],
    settings: [
        {name: 'tableborder', type: 'text', placeholder: 'Border', prefill: function() { return ''; }},
        {name: 'background', type: 'text', placeholder: 'Background', prefill: function() { return ''; }},
        {name: 'cellpadding', type: 'number', placeholder: 'Cell padding', prefill: function() { return 0; }},
        {name: 'cellspacing', type: 'number', placeholder: 'Cell spacing', prefill: function() { return 0; }},
        {name: 'textfont', type: 'text', placeholder: 'Font family', prefill: function() { return ''; }},
        {name: 'fontsize', type: 'text', placeholder: 'Font size', prefill: function() { return ''; }}
    ],
    class: 'nltable',
    _create: function() { this._superApply(arguments); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },
    render: function() { return this._superApply(arguments); },

    render_impl: function() {
        return `<table style="border: ${cfg('tableborder')}; font-family: ${cfg('textfont')}; font-size: ${cfg('fontsize')};" cellspacing="${cfg('cellspacing')}" cellpadding="${cfg('cellPadding')}"><tbody>` + this._superApply(arguments) + '</tbody></table>';
    },
    _trigger: function(e) { this._superApply(arguments); }
});

/*
 * Div widget
 *
 * Renders a DIV tag. Implemented as a sequence container.
 */

$.widget('nle.nldiv', $.nle.genList, {
    editor_name: 'Section',
    class: 'nldiv',
    settings: [
        {name: 'width', type: 'text', placeholder: 'Width', prefill: '600px'},
        {name: 'background', type: 'color', placeholder: 'Background color', prefill: '#ffffff'},
        {name: 'textcolor', type: 'color', placeholder: 'Text color', prefill: '#000000'},
        {name: 'linkcolor', type: 'color', placeholder: 'Link color', prefill: '#0000ff'},
        {name: 'textfont', type: 'text', placeholder: 'Text font', prefill: 'Helvetica'},
        {name: 'titlefont', type: 'text', placeholder: 'Title font', prefill: 'Georgia'},
        {name: 'divborder', type: 'text', placeholder: 'Border', prefill: '0'},
        {name: 'fontsize', type: 'text', placeholder: 'Font size', prefill: '12px'},
        {name: 'firstparstyle', type: 'text', placeholder: 'First paragraph style', prefill: 'margin-top: 0;'},
        {name: 'parstyle', type: 'text', placeholder: 'Paragraph style', prefill: ''},
        {name: 'textalign', type: 'select', placeholder: 'Align', prefill: 'left',
            options: [
                {name: 'Left', value: 'left'},
                {name: 'Center', value: 'center'},
                {name: 'Right', value: 'right'}
            ]}
    ],
    _create: function() { this._superApply(arguments); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },
    render: function() { return this._superApply(arguments); },
    _trigger: function(e) { this._superApply(arguments); },
    render_impl: function() {
        var style=`width:${cfg('width')};background:${cfg('background')};border:${cfg('divborder') || 0};`;
        style += `font-family:${cfg('textfont')};font-size:${cfg('fontsize')};`;
        style += `text-align:${cfg('textalign')};color:${cfg('textcolor')};`;
        return `<div style="${style}">` + this._superApply(arguments) + '</div>';
    }
});


$.widget('nle.nlcontents', $.nle.nldiv, {
    editor_name: 'Contents',
    class: 'nlcontents',
    settings: [],
    _create: function() { this._superApply(arguments); },
    _refresh: function() { this._superApply(arguments); },
    _destroy: function() { this._superApply(arguments); },
    _setOptions: function() { this._superApply(arguments); this._refresh(); },
    _setOption: function() { this._superApply(arguments); this._refresh(); },
    render: function() { return this._superApply(arguments); },
    _trigger: function(e) { this._superApply(arguments); },
    render_impl: function() { return this._superApply(arguments); }
});



/*
 * Global settings widget
 */

$.widget('nle.settings', $.nle.base, {
    options: {
        change: null,
        destroyable: false
    },

    editors: [
        /* DIV */
        {name: 'width', type: 'text', placeholder: 'Width', prefill: '600px'},
        {name: 'background', type: 'color', placeholder: 'Background color', prefill: '#ffffff'},
        {name: 'textcolor', type: 'color', placeholder: 'Text color', prefill: '#000000'},
        {name: 'linkcolor', type: 'color', placeholder: 'Link color', prefill: '#0000ff'},
        {name: 'textfont', type: 'text', placeholder: 'Text font', prefill: 'Helvetica'},
        {name: 'titlefont', type: 'text', placeholder: 'Title font', prefill: 'Georgia'},
        {name: 'fontsize', type: 'text', placeholder: 'Font size', prefill: '12px'},
        {name: 'firstparstyle', type: 'text', placeholder: 'First paragraph style', prefill: 'margin-top: 0;'},
        {name: 'parstyle', type: 'text', placeholder: 'Paragraph style', prefill: ''},
        {name: 'textalign', type: 'select', placeholder: 'Align', prefill: 'left',
            options: [
                {name: 'Left', value: 'left'},
                {name: 'Center', value: 'center'},
                {name: 'Right', value: 'right'}
            ]},
        /* BOOK */
        {type: 'select', placeholder: '[Book] Blurb align',
            options: [
                {name: 'Left', value: 'left'},
                {name: 'Center', value: 'center'},
                {name: 'Right', value: 'right'}
            ],
            name: 'blurbalign', prefill: 'left'},
        {type: 'text', placeholder: '[Book] Blurb size', name: 'bookblurbsize', prefill: '12px'},
        {type: 'color', placeholder: '[Book] Blurb color', name: 'bookblurbcolor', prefill: '#000000'},
        {type: 'text', placeholder: '[Book] Link size', name: 'booklinksize', prefill: '12px'},
        {type: 'color', placeholder: '[Book] Link color', name: 'booklinkcolor', prefill: '#0000ff'},
        {name: 'divborder', type: 'text', placeholder: 'Section border', prefill: '0'},
        {name: 'cellborder', type: 'text', placeholder: 'Cell border', prefill: '0'},
        {name: 'tableborder', type: 'text', placeholder: 'Table border', prefill: '0'},
        {name: 'cellpadding', type: 'number', placeholder: 'Cell padding', prefill: '0'},
        {name: 'cellspacing', type: 'number', placeholder: 'Cell spacing', prefill: '0'},
        /* HR */
        {name: 'hr_style', type: 'text', placeholder: 'Horizontal line style'}
    ],

    editor_name: 'Global settings',

    class: 'settings',

    update_settings_stack: function() {
        settings_stack[0] = this.get_values();
        //console.log("new settings (refresh)", settings_stack[0]);
    },
    _create: function() { this._superApply(arguments); this.update_settings_stack(); },
    _trigger: function(e) { this._superApply(arguments); },
    _refresh: function() {
        this.update_settings_stack();
        this._superApply(arguments);
    }
});
