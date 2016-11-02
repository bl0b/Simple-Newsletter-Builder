/**
 * Created by damien on 29-Oct-16.
 */


function global_render(settings, editor, output, copy) {
    //console.log(settings);
    //settings_stack[0] = settings.settings('get_values');
    //var rndr = `<div style="width: ${cfg('width')}; background: ${cfg('background')}; font-family: ${cfg('textfont')}; font-size: ${cfg('fontsize')}; color: ${cfg('text')}; text-align: ${cfg('textalign')};">${editor.nlcontents('render')}</div>`;
    var rndr = editor.nlcontents('render');
    output.html('<div class="reset">' + rndr + '</div>');
    //$('#output').css({width: cfg('width'), 'font-family': cfg('font'), background: cfg('background'), color: cfg('text')});
    $('#debug').text('<!DOCTYPE html><html><body>' + rndr + '</body></html>');
}


function init_newsletter_builder(options) {
    var editor = $(options.editor).first();
    var output = $(options.output).first();
    var copy = $(options.copy_button).first();
    var settings = $(options.settings).first();
    settings.settings({change: () => global_render(settings, editor, output, copy)});
    editor.nlcontents({change: () => global_render(settings, editor, output, copy), destroyable: false});
    $(options.save_button).button().click(function() {
        //var S = settings.settings('get_structure');
        //var blob = new Blob([JSON.stringify(editor.nlcontents('get_structure'))], {type: "text/plain;charset=utf-8"});
        var blob = new Blob([JSON.stringify({settings: settings.settings('get_structure'), editor: editor.nlcontents('get_structure')})], {type: "text/plain;charset=utf-8"});
        var filename = `newsletter-generator_${moment().format('YYYY-MM-DD_h-mm-ss')}.json`;
        saveAs(blob, filename);
    });
    $(options.load_button).button().click(function() {
        $(`<div id="load-dialog" title="Select file to load"><label data-for="load_filename">Pick a JSON file</label><input name="load_filename" type="file"/></div>`).dialog({
            resizable: false,
            height: 'auto',
            width: '700px',
            modal: true,
            buttons: {
                "Load": function() {
                    var input = $('input[name=load_filename]')[0].files[0];
                    if (input) {
                        fr = new FileReader();
                        fr.onload = e => {
                            var json = JSON.parse(e.target.result);
                            $('#debug').text(e.target.result);
                            //if (json) {
                            if (json.editor && json.settings) {
                                settings.settings('set_structure', json.settings);
                                editor.nlcontents('set_structure', json.editor);
                            }
                        };
                        fr.readAsText(input);
                    }
                    $(this).dialog("close");
                },
                "Cancel": function() {
                    $(this).dialog("close");
                }
            }
        });
    });
}

