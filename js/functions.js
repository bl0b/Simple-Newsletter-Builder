/**
 * Created by damien on 29-Oct-16.
 */

settings_stack = [{}];

function cfg(name) {
    for (var i = settings_stack.length - 1; i >= 0; --i) {
        if (settings_stack[i][name] !== undefined) {
            //console.log('cfg', name, i, settings_stack[i][name]);
            return settings_stack[i][name];
        }
    }
    //console.log('cfg', name, undefined);
    return undefined;
}

function attach_settings(cfg) {
    settings_stack.push(cfg);
    //console.log("attach_settings");
    //for (var i = 0; i < settings_stack.length; ++i) {
    //    console.log(i, settings_stack[i]);
    //}
}

function detach_settings() {
    settings_stack.pop();
}

function render_image(alt, url) {
    return `<img src="${url}" alt="${alt}" />`;
}

function render_link(text, url, img='', img_pos='') {
    //console.log("DEBUG SETTINGS RENDER_LINK");
    //for (var i = 0; i < settings_stack.length; ++i) {
    //    console.log(settings_stack[i]);
    //}
    if (img != '') {
        if (img_pos == 'top') {
            return `<a target="_blank" style="color: ${cfg('linkcolor')}; font-family: ${cfg('textfont')};" href="${url}">${render_image(text, img)}<br/>${text}</a>`;
        } else if (img_pos == 'left') {
            return `<a target="_blank" style="color: ${cfg('linkcolor')}; font-family: ${cfg('textfont')};" href="${url}">${render_image(text, img)}${text}</a>`;
        } else if (img_pos == 'right') {
            return `<a target="_blank" style="color: ${cfg('linkcolor')}; font-family: ${cfg('textfont')};" href="${url}">${text}${render_image(text, img)}</a>`;
        } else if (img_pos == 'bottom') {
            return `<a target="_blank" style="color: ${cfg('linkcolor')}; font-family: ${cfg('textfont')};" href="${url}">${text}<br/>${render_image(text, img)}</a>`;
        }
    } else {
        return `<a target="_blank" style="color: ${cfg('linkcolor')}; font-family: ${cfg('textfont')}" href="${url}">${text}</a>`;
    }
}

function render_text(text) {
    return text.trim().replace(/"([^"]*)"\[([^\]]*)\]/g, (m, t, u) => render_link(t, u));
}

function render_paragraphs(text, use_p, firstparstyle, parstyle) {
    var with_links = render_text(text);
    if (use_p) {
        if (firstparstyle != '') {
            firstparstyle = ` style="${firstparstyle}"`;
        }
        if (parstyle != '') {
            parstyle = ` style="${parstyle}"`;
        }
        return `<p${firstparstyle}>` + with_links.replace(/ *[\r\n]+/g, `</p${parstyle}><p>`) + '</p>';
    } else {
        return with_links.replace(/ *[\r\n]+/g, '<br/>') + '<br/>';
    }
}

function add_input(that, ui, x, checkbox) {
    var el;
    if (x.type == 'button') {
        el = $(`<button name="${x.name}">${x.placeholder}</button>`);
        that.append(el);
        el.button();
        return;
    } else if (x.type == 'textarea') {
        el = $(`<textarea name="${x.name}" placeholder="${x.placeholder}"></textarea>`);
    } else if (x.type == 'checkbox') {
        //el = $(`<input type="${x.type}" name="${x.name}" checked=${x.prefill()}" />`);
        el = $(`<div class="nl-editor-checkbox"><input type="${x.type}" name="${x.name}" /></div>`);
    } else if (x.type == 'select') {
        el = $(`<select name="${x.name}"></select>`);
        //console.log(x);
        $.each(x.options, function (i, o) {
            //console.log(i, o);
            if (o.name == x.selected) {
                el.append($(`<option value="${o.value}" selected>${o.name}</option>`));
            } else {
                el.append($(`<option value="${o.value}">${o.name}</option>`));
            }
        });
    } else if (x.type == 'color') {
        /* for use with iris */
    //    el = $(`<div class="nl-editor-checkbox"><input type="text" name="${x.name}" placeholder="${x.placeholder}" /></div>`);
        el = $(`<input type="text" name="${x.name}" placeholder="${x.placeholder}" />`);
    } else {
        el = $(`<input type="${x.type}" name="${x.name}" placeholder="${x.placeholder}" />`);
    }
    if (x.prefill) {
        var prefill;
        if (typeof x.prefill == "string") {
            prefill = x.prefill;
        } else {
            prefill = x.prefill();
        }
        //console.log("prefill", x.name, prefill);
        if (x.type == 'checkbox') {
            el.find('> input').val(prefill);
        } else {
            el.val(prefill);
        }
    } else {
        el.val(cfg(x.name));
    }
    var l = $(`<label data-for="${x.name}">${x.placeholder}</label>`);
    if (checkbox && cfg(x.name) !== undefined) {
        var chk = $('<input type="checkbox"/>');
        l.prepend(chk);
        chk.change(function() {
            if (chk.prop('checked')) {
                el.prop('disabled', false);
                l.removeClass('disabled');
            } else {
                el.prop('disabled', true);
                l.addClass('disabled');
            }
        });
        l.addClass('disabled');
        el.prop('disabled', true);
    }
    that.append(l);
    if (x.type == 'textarea') {
        l.addClass('textarea');
    }
    that.append(el);
    if (x.type == 'color') {
/*
    // for use with iris
        var input = el.find('input');
        input.iris({
            color: true,
            hide: true,
            border: true,
            target: el,
            change: (e, ui) => input.css({background: ui.color.toString()})
        });
        el.hover(() => input.iris('show'), () => input.iris('hide'));
*/
        el.colorpicker({
            defaultPalette: 'web',
            history: false,
            showOn: 'focus',
            color: el.val()
        });
    }
    el.change(function() { ui._refresh(); });
    el.keyup(function() { ui._refresh(); });
    el.mouseup(function() { ui._refresh(); });
}

function add_editor(that, ui, x) {
    add_input(that, ui, x, false);
}


function add_setting(that, ui, x) {
    add_input(that, ui, x, true);
}

function enable_setting(that, name) {
    that.contents_settings.find(`label[data-for=${name}] > input[type=checkbox]`).prop('checked', true);
    that.contents_settings.find(`input[name=${name}]`).prop('disabled', false);
}

/* http://stackoverflow.com/a/3627747 */
function rgb2hex(rgb) {
    if (rgb === undefined || /^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function input_is_enabled(el, e) {
    var ret = el.find(`label[data-for=${e.name}] > input[type=checkbox]`).prop('checked');
    //if (e.type == 'checkbox') {
    //    ret = !el.find(`> div > [name=${e.name}]`).prop('disabled');
    //} else if (e.type == 'color') {
    //    ret = !el.find(`> div > [name=${e.name}]`).prop('disabled');
    //} else {
    //    ret = !el.find(`> [name=${e.name}]`).prop('disabled');
    //}
    console.log("input_is_enabled", el, e, ret);
    return ret;
}

function get_input_value(el, e) {
    //console.log('get_input_value', el, e);
    if (e.type == 'checkbox') {
        return el.find(`> div > [name=${e.name}]:enabled`).prop('checked');
    } else if (e.type == 'color') {
    //    return rgb2hex(el.find(`> [name=${e.name}]:enabled`).val());
        var x = el.find(`> div > [name=${e.name}]:enabled`);
        if (x.length == 1) {
            return x.colorpicker('val');
        } else {
            return undefined;
        }
    } else {
        return el.find(`> [name=${e.name}]:enabled`).val();
    }
}

function set_input_value(el, e, v) {
    //console.log('set_input_value', el, e, v);
    var chk = el.find(`label[data-for=${e.name}] > input[type=checkbox]`);
    if (v === undefined && chk.length == 1) {
        chk.prop('checked', false);
        if (e.type == 'checkbox') {
            el.find(`> div > [name=${e.name}]`).prop('disabled', true);
        } else {
            el.find(`> [name=${e.name}]`).prop('disabled', true);
        }
    } else {
        if (e.type == 'checkbox') {
            el.find(`> div > [name=${e.name}]`).prop('checked', v);
        } else if (e.type == 'color') {
        //    el.find(`> [name=${e.name}]`).val(rgb2hex(v));
            el.find(`> div > [name=${e.name}]`).colorpicker('val', v);
        } else {
            el.find(`> [name=${e.name}]`).val(v);
        }
    }
}
