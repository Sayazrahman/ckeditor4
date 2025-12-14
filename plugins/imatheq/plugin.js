/**
 * Copyright (c) 2017, iMathEQ.com. All rights reserved.
 */

var _imatheq_conf_file = "/conf/configurationjs";
var _imatheq_conf_path;

// Lang
var _imatheq_langCode = 'en';
var _imatheq_conf_loaded = null;
var _imatheq_langstr_loaded = null;
var _imatheq_is_editor_opened = false;
var _imatheq_ImageResizing;

// Including common.js
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = CKEDITOR.plugins.getPath('imatheq') + './common/common.js';

document.getElementsByTagName('head')[0].appendChild(script);

var _imatheq_editor_icon = CKEDITOR.plugins.getPath('imatheq') + './common/icons/imatheq.png';

var iMathEQ_ckeditor = null;
function iMathEQ_SaveImageResult(result) {
	try {
		var editor = iMathEQ_ckeditor;	//20180805_copy
		
		if(_imatheq_cur_selection !== null && _imatheq_cur_selection !== undefined) {
			var newImg = document.createElement("img");
			_imatheq_cur_selection.parentNode.replaceChild(newImg, _imatheq_cur_selection);
			newImg.outerHTML = result;
			newImg.setAttribute('role', 'math'); 
			newImg.className = "iMathEQFormula";
			_imatheq_cur_selection = null;	//20180805_copy
		} else {
			var focusManager = new CKEDITOR.focusManager(window._imatheq_cur_Editor);
			focusManager.focus();	//_imatheq_cur_element

			window._imatheq_cur_Editor.insertHtml(result);
		}
	} catch (e) {
		console.log(e.message);
	}
}

//Global variables
var _imatheq_ck_iframe_in_div = false;
var _imatheq_cur_element;
var _imatheq_cur_element_is_iframe;
 
// Register the plugin within the editor.
CKEDITOR.plugins.add( 'imatheq', {

	win : null,

	openPopUp : function(mml) {
		var mathml = mml;
		var obj = this;
		var baseurl = null;

		var scripts = document.getElementsByTagName("script");
		var search = new RegExp("(.*\/plugins\/imatheq\/)plugin\.js");
		for(var i=0; i<scripts.length; i++) {
			var mat = scripts[i].src.match(search);
			if (mat !== null) {
				baseurl = mat[1];
			}
		}

		var params  = 'width='+Math.floor(screen.width*0.8);
		params += ', height='+Math.floor(screen.height*0.8);
		params += ', top='+Math.floor(screen.height*0.05);
		params += ', left='+Math.floor(screen.width*0.1);
		params += ', directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,resizable=yes,fullscreen=no';
     
		var url = baseurl + "tinyMCMathEditor.html";
		
		if(this.win === undefined || this.win === null || this.win.closed) {
			this.win = window.open(url, "iMathEQ", params);
		}
    
		if(!this.win.setMathML) {
			setTimeout(function() {
				obj.openPopUp(mathml);
			},1000);
		} else { 
			this.win.setMathML(mml); 
		}


		this.win.focus();
		return false;
	},

	/*Function to detect pop up is closed and take action to enable parent window*/
	//20210309, seem not in use
	/*showMathEditor : function() {
		var imgElm = iMathEQ_ckeditor.getSelection().getStartElement();
	
		if (imgElm.$ && (imgElm.$.nodeName != 'IMG' || imgElm.$.getAttribute('imatheq-mml') === null)) {
			imgElm = null;
		}

		var mml = "";
		if (imgElm) {
			mml = imgElm.$.getAttribute('imatheq-mml');
			if(mml != "") {
				mml = decodeURIComponent(mml);
			}
		}

		this.openPopUp(mml);
	},*/

	// Register the icons. They must match command names.
	icons: 'imatheq',

	// The plugin initialization logic goes inside this method.
	init: function( editor ) {

		iMathEQ_ckeditor = editor;

        for(var id in CKEDITOR.instances) {
            CKEDITOR.instances[id].on('focus', function(e) {
                window._imatheq_cur_Editor = e.editor;
            });
        }

        var element = null;
        editor.on('doubleclick', function (event) {
			if (event.data.element.$ && (event.data.element.$.nodeName != 'IMG' || event.data.element.$.getAttribute('imatheq-mml') !== null)) {
                event.data.dialog = null;
            }
        });

        // Avoid iMathEQ images to be upcasted.
        if (typeof editor.widgets != 'undefined') {
            editor.widgets.addUpcastCallback( function( element ) {
                //if ( element.name == 'img' && typeof(_imatheq_img_cls_name) != 'undefined' && element.hasClass(_imatheq_img_cls_name) )
				if(element.name == 'img' && element.attributes['imatheq-mml'])
                    return false;
            } );
        }
		
        function whenPluginReady() {
            if (window.ModalWindow !== undefined && window.ModalWindow !== null 
					&& _imatheq_conf_loaded !== undefined && _imatheq_conf_loaded !== null
					&& (typeof _imatheq_strings !== undefined)) { // common.js and config loaded properly 
			
				setInterval(attachImatheqEventHandlers(editor, element, function(el){element = el;}, 500));

            }
            else {
                setTimeout(whenPluginReady, 50);
            }
        }
			
		whenPluginReady();
		
		var obj = this;
		// Define the editor command that inserts a math equation.
        
		var allowedContent = 'img[!src,imatheq-mml,alt,width,height](!iMathEQ_formula)'; // Maximum HTML which this feature may create.		
		CKEDITOR.config.removePlugins = 'image,forms';
		
		editor.addCommand( 'imatheq_open_editor', {

                'async': false,
                'canUndo': true,
                'editorFocus': true,
                /*'allowedContent': allowedContent,
                'requiredContent': allowedContent,*/
				
		    'requiredContent': 'img[src]', // Minimal HTML which this feature requires to be enabled.
		    'allowedContent': 'img[!src,imatheq-mml,alt,width,height]', // Maximum HTML which this feature may create.
			// Define the function that will be fired when the command is executed.
			exec: function( editor ) {
				/*iMathEQ_ckeditor = editor;
				parentwin = window;
				obj.showMathEditor();*/

				imatheq_openEditor(editor, _imatheq_langCode, editor.elementMode != CKEDITOR.ELEMENT_MODE_INLINE && !_imatheq_ck_iframe_in_div );
			}
		});

		// Create the toolbar button that executes the above command.
		editor.ui.addButton( 'imatheq_formula_editor', {
			'label': 'iMathEQ Math Equation Editor',
			'command': 'imatheq_open_editor',
			'toolbar': 'insert',
			'icon': _imatheq_editor_icon
		});

        // Lang defined inside editor
        _imatheq_langCode = editor.langCode=="en-gb" ? "en" : editor.langCode;
	}
});

/**
 */
function attachImatheqEventHandlers(editor, cntWinElm, callback) {
    try {
        var contentWindow;
        _imatheq_ck_iframe_in_div = false;
        var elem = document.getElementById('cke_contents_' + editor.name) ? document.getElementById('cke_contents_' + editor.name) : document.getElementById('cke_' + editor.name);
        if (editor.elementMode == CKEDITOR.ELEMENT_MODE_INLINE) {
            contentWindow = editor.element.$;
        }
        else {
            contentWindow = elem.getElementsByTagName('iframe')[0];
        }

        if (contentWindow == null) { //  div not iframe
            var dataElm;
            for (var cls in elem.classList) {
                var elm = elem.classList[cls];
                if (elm.search('cke_\\d') != -1) {
                    dataElm = elm;
                    break;
                }
            }
            if (dataElm) {
                contentWindow = document.getElementById(elm + '_contents');
				if(contentWindow.getElementsByTagName('iframe').length == 1 &&	//for shared editor top and bottom, need to attach to iframe child
					contentWindow.getElementsByTagName('iframe')[0].parentNode === contentWindow) {
						contentWindow = contentWindow.getElementsByTagName('iframe')[0];
				}
                _imatheq_ck_iframe_in_div = true;
            }
        }

        if ((!contentWindow.iMathEQLunched && cntWinElm == null) || contentWindow != cntWinElm) {
            if (editor.elementMode == CKEDITOR.ELEMENT_MODE_INLINE) {
                if (contentWindow.tagName == 'TEXTAREA') { // inline editor textarea
                    var textareas = document.getElementsByClassName('cke_textarea_inline');
                    Array.prototype.forEach.call(textareas, function(entry) {
                        imatheq_attachEventHandles(entry, function (div, cntWinElm, event) {
							imatheq_onEqDoubleClick(editor, div, cntWinElm, event);
                        }, imatheq_mousedownHandler, imatheq_mouseupHandler);
                    });
                } else {
                    imatheq_attachEventHandles(contentWindow, function (div, cntWinElm, event) {
                        imatheq_onEqDoubleClick(editor, div, cntWinElm, event);	//20180805_copy
                    }, imatheq_mousedownHandler, imatheq_mouseupHandler);
                }
                contentWindow.iMathEQLunched = true;
                cntWinElm = contentWindow;
            }
            else if (contentWindow.contentWindow != null) { //iframe
				//imatheq_attachEventHandles(contentWindow, imatheq_onEqDoubleClick, imatheq_onEqMouseDown, imatheq_onEqMouseUp);
				imatheq_attachIframeEventHandles(contentWindow, function (iframe, cntWinElm, event) {
                    imatheq_onEqDoubleClick(editor, iframe, cntWinElm, event);
                }, imatheq_onEqMouseDown, imatheq_onEqMouseUp);
                contentWindow.iMathEQLunched = true;
                cntWinElm = contentWindow;
            }
            else if (_imatheq_ck_iframe_in_div) {
                imatheq_attachEventHandles(contentWindow, function (div, cntWinElm, event) {
                    imatheq_onEqDoubleClick(editor, div, cntWinElm, event);
                }, imatheq_mousedownHandler, imatheq_mouseupHandler);
                contentWindow.iMathEQLunched = true;
                cntWinElm = contentWindow;
            }
        }
        callback(cntWinElm);
    }
    catch (e) {
		console.log(e.description);
    }
}

/**
 * to be called when double click on fomula.
 */
function imatheq_onEqDoubleClick(editor, target, /*isIframe,*/ formulaElm, event) {
    if (formulaElm.nodeName.toLowerCase() == 'img') {
        //if (formulaElm.classList.contains(_imatheq_img_cls_name)) {
		if (formulaElm.getAttribute('imatheq-mml') !== null) {
            if (typeof event.stopPropagation != 'undefined') { // for old IE
                event.stopPropagation();
            } else {
                event.returnValue = false;
            }
			
			imatheq_openEditor(editor, _imatheq_langCode, editor.elementMode != CKEDITOR.ELEMENT_MODE_INLINE && !_imatheq_ck_iframe_in_div );
            event.returnValue = true;
			event.preventDefault();
        }
    }
}

/**
 * to be called when mousedown on fomula.
 */
function imatheq_onEqMouseDown(iframe, element) {
    if (element.nodeName.toLowerCase() == 'img') {
        //if (element.classList.contains('iMathEQ_formula')) {
        if (element.getAttribute('imatheq-mml') !== null) {
            _imatheq_ImageResizing = element;
        }
    }
}

/**
 * to be called when doubleclick on fomula.
 */
function imatheq_onEqMouseUp() {
    if (_imatheq_ImageResizing) {
    }
}

/**
 * Opens formula editor to edit an existing formula.
 * @param object element Target
 * @param boolean isIframe
 */
function imatheqOpenEditorWFormula(element, isIframe, language) {
    _imatheq_window_is_opened = true;
    _imatheq_cur_element = element;
    _imatheq_cur_fomula_img = null;
    _imatheq_cur_element_is_iframe = isIframe;
    _imatheq_cur_window = imatheq_openEditorWindow(language, element, isIframe);
}

/**
 * Handles a mousedown event on the iframe.
 * @param object iframe Target
 * @param object element Element mouse downed
 */
function imatheq_mousedownHandler(iframe, element) {
}

/**
 * Handles a mouse up event on the iframe.
 */
function imatheq_mouseupHandler() {
}
