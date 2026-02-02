//debugger;

if (!(window._imatheq_img_cls_name)) {
    _imatheq_img_cls_name = 'iMathEQ_formula';
}

function imatheq_getCommonPath() {
    var scriptName = "common/common.js";
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
        var j = scripts[i].src.lastIndexOf(scriptName);
        if (j >= 0) {
            // That's my script!
            return scripts[i].src.substr(0, j - 1);
        }
    }
}

var _imatheq_cur_fomula_img;
var _imatheq_css_loaded = false;
var _imatheq_iframe_width = 900;
var _imatheq_iframe_height = 600;
var _imatheq_cur_selection = null;
var _imatheq_cur_range;
var _imatheq_cur_element;
var _imatheq_popupWindow;
var _imatheq_modalWindow = typeof _imatheq_modalWindow != 'undefined' ? _imatheq_modalWindow : null;
var _imatheq_new_formula  = typeof _imatheq_new_formula  != 'undefined' ? _imatheq_new_formula  : true;

/**
 * Attach element listeners for imatheq lunch related events.
 */
function imatheq_attachEventHandles(target, onDoubleClick, onMouseDown, onMouseUp) {
	imatheq_addEventListener(target, 'dblclick', function (event) {
		var e = (event) ? event : window.event;
		var element = e.srcElement ? e.srcElement : e.target;
		onDoubleClick(target, element, e);
	});

	imatheq_addEventListener(target, 'mousedown', function (event) {
		var e = (event) ? event : window.event;
		var element = e.srcElement ? e.srcElement : e.target;
		onMouseDown(target, element, e);
	});

	imatheq_addEventListener(target, 'mouseup', function (event) {
		/*try {
			var selectedElement = new CKEDITOR.dom.element('span');
			selectedElement.$.setAttribute('imatheq-mml','');
			selectedElement.setHtml("imatheq");
			window._imatheq_cur_Editor.insertElement(selectedElement);
			//selectedElement.$.style.display="none";
			selection = hostEditor.getSelection();
			selection.selectElement(selectedElement);
			selection = getSelection();
			_imatheq_cur_range = selection.getRangeAt(0);
		} catch(e) {
			console.log(e.description);
		}*/

		var e = (event) ? event : window.event;
		var element = e.srcElement ? e.srcElement : e.target;
		onMouseUp(target, element, e);
	});
}

/**
 * Attach iframe events.
 */
function imatheq_attachIframeEventHandles(iframe, doubleClickHandler, mousedownHandler, mouseupHandler) {
    imatheq_attachEventHandles(iframe.contentWindow.document,
        function (target, element, event) {
            doubleClickHandler(iframe, element, event);
        },
        function (target, element, event) {
            mousedownHandler(iframe, element, event);
        },
        function (target, element, event) {
            mouseupHandler(iframe, element, event);
        }
    );
}

function imatheq_addEventListener(element, e, func) {
    if (element.addEventListener) {
        element.addEventListener(e, func, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + e, func);
    }
}

function imatheq_removeEventListener(element, e, func) {
    if (element.removeEventListener) {
        element.removeEventListener(e, func, true);
    }
    else if (element.detachEvent) {
        element.detachEvent('on' + e, func);
    }
}

function imatheq_getCommonPath() {
    var scriptName = "common/common.js";
    var col = document.getElementsByTagName("script");
    for (var i = 0; i < col.length; i++) {
        var d;
        var src;
        d = col[i];
        src = d.src;
        var j = src.lastIndexOf(scriptName);
        if (j >= 0) {
            // Found it!
            return src.substr(0, j - 1);
        }
    }
}

// Supported languages.
var _imatheq_languages = 'en,zh-cn';

function imatheq_loadLangFile() {
    // When a language is not defined, put english (en) as default.
    if (_imatheq_langCode === 'undefined' || _imatheq_langCode === null) {
        _imatheq_langCode = 'en';
    }

    var langArray = _imatheq_languages.split(',');

    if (langArray.indexOf(_imatheq_langCode) == -1) {
        _imatheq_langCode = _imatheq_langCode.substr(0,2);
    }

    if (langArray.indexOf(_imatheq_langCode) == -1) {
        _imatheq_langCode = 'en';
    }

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = imatheq_getCommonPath() + "/languages/" + _imatheq_langCode + "/strings.js";
    document.getElementsByTagName('head')[0].appendChild(script);
}

/**
 * Loads configuration file.
 */
function imatheq_loadConfig() {
    if (typeof _imatheq_conf_path == 'undefined') {
        _imatheq_conf_path = imatheq_getCommonPath();
    }

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = imatheq_getCommonPath() + "/conf/configuration.js";
    document.getElementsByTagName('head')[0].appendChild(script);
}

imatheq_loadLangFile();

// Loading javascript configuration.
if (_imatheq_conf_loaded === 'undefined' || _imatheq_conf_loaded === null) {
    imatheq_loadConfig();
}

function openPopUp(path, mml, iMathEQ_qid) {
	var url = path;
	var mathml = mml;
	var in_iMathEQ_qid = iMathEQ_qid;
	var obj = this;
	var target = _imatheq_conf_new_tab ? "_blank" : "iMathEQ";

	var params = null;
	if(!_imatheq_conf_new_tab) {
		params = 'width='+Math.floor(window.outerWidth*0.8);
		params += ', height='+Math.floor(window.outerHeight*0.8);
		params += ', top='+Math.floor(window.screenTop + window.outerHeight*0.05);
		params += ', left='+Math.floor(window.screenLeft + window.outerWidth*0.1);
		params += ', directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,resizable=yes,fullscreen=no';
	} 
	
	if(_imatheq_popupWindow === undefined || _imatheq_popupWindow === null 
			|| _imatheq_popupWindow.closed) {
		_imatheq_popupWindow = window.open(url, target, params);
	}

	if(!_imatheq_popupWindow.setMathML) {
		setTimeout(function() {
			openPopUp(url, mathml, in_iMathEQ_qid);
		},500);
	} else { 
		_imatheq_popupWindow.setMathML(mml, iMathEQ_qid); 
	}

	_imatheq_popupWindow.focus();
	return false;
}

/*Function to detect pop up is closed and take action to enable parent window*/
//20210309, seem not in use
/*function showMathEditor() {
	var imgElm = iMathEQ_ckeditor.getSelection().getStartElement();

	if (imgElm.$ && (imgElm.$.nodeName != 'IMG' || imgElm.$.getAttribute('imatheq-mml') === null)) {
		imgElm = null;
	}

	var mml = "";
	var iMathEQ_qid = "";
	if (imgElm) {
		mml = imgElm.$.getAttribute('imatheq-mml');
		iMathEQ_qid = imgElm.$.getAttribute('imatheq-eq-id');
		if(mml != "") {
			mml = decodeURIComponent(mml, iMathEQ_qid);
		}
	}

	this.openPopUp(mml, iMathEQ_qid);
}*/

/**
 * Opens a new iMathEQ editor window.
 */
function imatheq_openEditor(hostEditor, lang, isIframe, newFormula) {

	if(lang === null || lang === undefined) {
		lang = "en";
	}
	
    if (_imatheq_is_editor_opened && !_imatheq_conf_modal_window) {
        _imatheq_cur_window.focus();
		return;
    }

	_imatheq_new_formula = newFormula;

	var ua = navigator.userAgent.toLowerCase();
    var isAndroid = ua.indexOf("android") > -1;
    var isIOS = ((ua.indexOf("ipad") > -1) || (ua.indexOf("iphone") > -1));

    if(isAndroid || isIOS) {
        _imatheq_conf_modal_window = false; // overwriten for mobile.
    }

	var selection = null;	//20180805 copy
    try {
        if (isIframe) {
            selection = element.contentWindow.getSelection();	//20180805 copy
            //var selection = element.contentWindow.getSelection();	//working copy
            _imatheq_cur_range = selection.getRangeAt(0);	//
        }
        else {
            selection = window.getSelection();	//20180805 copy
            //var selection = getSelection();	//working copy
            _imatheq_cur_range = selection.getRangeAt(0);
			var focusManager = new CKEDITOR.focusManager(hostEditor);
			_imatheq_cur_element = focusManager.currentActive;
        }
    }
    catch (e) {
        _imatheq_cur_range = null;
    }
	
	/*selectedElement = new CKEDITOR.dom.element('img');
	selectedElement.$.setAttribute('imatheq-mml','');
	selectedElement.setHtml("imatheq");
	hostEditor.insertElement(selectedElement);
	//selectedElement.$.style.display="none";
	selection = hostEditor.getSelection();
	selection.selectElement(selectedElement);
	selection = getSelection();
	_imatheq_cur_range = selection.getRangeAt(0);*/

    if (isIframe === undefined) {
        isIframe = true;
    }

	var editor_name = "math-editor.html";
    var path = _imatheq_conf_path.slice(-1) == "/" ? _imatheq_conf_path + "common/" + editor_name + "?lang="+lang : _imatheq_conf_path + "/common/" + editor_name + "?lang="+lang;

	var mml = "";
	var iMathEQ_qid = "";
    if (hostEditor) {
		var imgElm = hostEditor.getSelection().getStartElement();
	
		if (imgElm.$ && (imgElm.$.nodeName != 'IMG' || imgElm.$.getAttribute('imatheq-mml') === null)) {
			imgElm = null;
			_imatheq_cur_selection = null;
		}

		if (imgElm) {
			_imatheq_cur_selection = imgElm.$;
			mml = imgElm.$.getAttribute('imatheq-mml');
			if(mml != "") {
				mml = decodeURIComponent(mml);
				var img_path = imgElm.$.getAttribute('src');
				if(img_path.substring(0,22) != "data:image/png;base64,") {
					if(img_path.indexOf("iMathEQ_qid=") != -1) {
						iMathEQ_qid = img_path.substring(
							img_path.indexOf("iMathEQ_qid=")+12);
						if(iMathEQ_qid.indexOf('&') != -1) iMathEQ_qid = 
							iMathEQ_qid.substring(0, iMathEQ_qid.indexOf('&'));
					} else {
						//get filename
						var filename = img_path.substring(img_path.lastIndexOf("/")+1);
						if(filename.indexOf('?') != -1) filename = 
							filename.substring(0, filename.indexOf('?'));
						else if(filename.indexOf('&') != -1) filename = 
							filename.substring(0, filename.indexOf('&'));
						iMathEQ_qid = filename.substring(0, filename.lastIndexOf('.'));
					}
				}
			}
		}

    }

    var title = 'iMathEQ Math Equation Editor';
	if(_imatheq_popup_atttributes === undefined || _imatheq_popup_atttributes === null) {
		_imatheq_popup_atttributes = 'menubar=1,resizable=1,width=800,height=600';
	}
    if (typeof _imatheq_conf_modal_window != 'undefined' && _imatheq_conf_modal_window === false) {
        //_imatheq_popupWindow = window.open(path, title, _imatheq_popup_atttributes);
        
		openPopUp(path, mml, iMathEQ_qid);
		
		/*_imatheq_popupWindow = window.open(path, '_blank');
        if(mml !== "") {
        	_imatheq_popupWindow.setMathML(mml);
        }
        return _imatheq_popupWindow;*/
    }
    else {
        if (_imatheq_modalWindow == null) {
            _imatheq_modalWindow = new ModalWindow();
        }
		if (!_imatheq_css_loaded) {
			var link = document.createElement("link");
			link.setAttribute("rel", "stylesheet");
			link.setAttribute("type", "text/css");
			link.setAttribute("href", imatheq_getCommonPath() + "/common/css/imatheq_modal.css");
			document.getElementsByTagName("head")[0].appendChild(link);
			_imatheq_css_loaded = true;
		}

        _imatheq_modalWindow.open(lang);
		
		if(mml == "") {
			imatheq_clearMathML();
		} else {
			imatheq_setMathML(mml, iMathEQ_qid);	//ignore iMathEQ_qid if not saving image file
		}
    }
}

/*
 * Send new equation to math edittor for editing
 * 	mml - MathML of equation
 *	iMathEQ_qid - equation id (image file name), ignore if not save image file
 */
function imatheq_setMathML(mml, iMathEQ_qid) {
	if(!_imatheq_popupWindow.setMathML) {
		setTimeout(function() {
			imatheq_setMathML(mml, iMathEQ_qid);
		},1000);
	} else { 
		_imatheq_popupWindow.setMathML(mml, iMathEQ_qid); 
	}
}

function imatheq_clearMathML() {
	if(!_imatheq_popupWindow.clearMathML) {
		setTimeout(function() {
			imatheq_clearMathML();
		},1000);
	} else { 
		_imatheq_popupWindow.clearMathML(); 
	}
}

function imatheq_closeModalWindow() {
    // We avoid to close window when it's closed
    if(_imatheq_modalWindow.opened) {
        _imatheq_window_is_opened = false ;
        _imatheq_modalWindow.close();
    }
}


function ModalWindow(/*path, editorAttributes*/) {
    var ua = navigator.userAgent.toLowerCase();
    this.deviceOrient = window.outerWidth > window.outerHeight ? 'landscape' : 'portait';
    this.isAndroid = ua.indexOf("android") > -1 ? true : false;
    this.isIOS = ((ua.indexOf("ipad") > -1) || (ua.indexOf("iphone") > -1)) ? true : false;
    this.isMobile = (this.deviceOrient == 'landscape' && _imatheq_iframe_height > window.outerHeight) 
		|| (this.deviceOrient == 'portrait' && _imatheq_iframe_height > window.outerWidth) ? true : false;
    this.created = false;
	this.state = null;
	this.preState = null;
}

ModalWindow.prototype.create = function(lang) {
	var container = document.createElement("div");
	container.classList.add("imatheq_modal_dialogContainer", "imatheq_modal_desktop", "imatheq_modal_restore");
	container.id = "imatheq_div";
	document.body.appendChild(container);
	this.container = container;

	var titleBar = document.createElement("div");
	titleBar.classList.add("imatheq_modal_title_bar", "imatheq_modal_desktop", "imatheq_modal_restore");
	container.appendChild(titleBar);
	
	var oClose = document.createElement("a");
	oClose.classList.add("imatheq_modal_close_button");
	oClose.title = _imatheq_strings["close"];
	oClose.setAttribute("role", "button");
	titleBar.appendChild(oClose);
	this.closeBtn = oClose;
    imatheq_addEventListener(this.closeBtn, 'click', this.close.bind(this));
	
	this.titleBar = titleBar;
	this.getScrollBarWidth();
	
	oRestore = document.createElement("a");
	oRestore.classList.add("imatheq_modal_restore_button", "imatheq_modal_desktop", "imatheq_modal_restore");
	oRestore.title = _imatheq_strings["fullscreen"];
	oRestore.setAttribute("role", "button");
	titleBar.appendChild(oRestore);
	this.restoreBtn = oRestore;
	
	oMinimize = document.createElement("a");
	oMinimize.classList.add("imatheq_modal_minimize_button", "imatheq_modal_desktop", "imatheq_modal_maximized");
	oMinimize.title = _imatheq_strings["minimize"];
	oMinimize.setAttribute("role", "button");
	titleBar.appendChild(oMinimize);
	this.minimizeBtn = oMinimize;
	
	var otitle = document.createElement("div");
	otitle.classList.add("imatheq_modal_title");
	otitle.innerHTML = "iMathEQ Math Editor";
	titleBar.appendChild(otitle);
	
	var iframediv = document.createElement("div");
	iframediv.classList.add("imatheq_modal_iframeContainer", "imatheq_modal_desktop", "imatheq_modal_restore");
	iframediv.title = "iMathEQ Editor Modal Window";
	//iframediv.style.width = _imatheq_iframe_width + "px";
	//iframediv.style.height = _imatheq_iframe_height + "px";
	container.appendChild(iframediv);
	
	this.iframeDiv = iframediv;
	
	var oiframe = document.createElement("iframe");
	oiframe.classList.add("imatheq_modal_iframe", "imatheq_modal_desktop", "imatheq_modal_restore");
	oiframe.title = "iMathEQ Editor Modal Window";
	oiframe.src =
    imatheq_getCommonPath() +
    "/common/math-editor.html?lang=" +
    lang +
    "&amp;dir=ltr";
	oiframe.style.width = "600px"; 
	oiframe.style.height = "400px";
	iframediv.appendChild(oiframe);
	
	this.iframe = oiframe;
	
	var overlayDiv = document.createElement("div");
	overlayDiv.classList.add("imatheq_overlay", "imatheq_modal_restore");
	this.overlayDiv = overlayDiv;
	document.body.appendChild(overlayDiv);
	this.overlay = overlayDiv;

	//Make the DIV element draggagle:
	//dragElement(container);
	container.style.display = "block";

    if (!this.isMobile && !this.isIOS && !this.isAndroid) { // Desktop.
        //oRestore.addEventListener('click', this.onRestore.bind(this), true);	//working copy
		var modelWin = this;	//20180805 copy
		imatheq_addEventListener(oRestore, 'click', function (event) {	//20180805 copy
			modelWin.onRestore(false);
		});
        oMinimize.addEventListener('click', this.onMinMax.bind(this), true);
		this.container.classList.add('imatheq_modal_desktop');
		
		if(_imatheq_conf_default_modal_win === null || _imatheq_conf_default_modal_win === undefined
			|| (_imatheq_conf_default_modal_win != "maximized" 
			&& _imatheq_conf_default_modal_win != "restored")) {
		  _imatheq_conf_default_modal_win = "restored";
		}
		if(_imatheq_conf_default_modal_win == "maximized") {
		  this.state = "minimized";
		  this.onMinMax();
		} else {
		  this.onRestore(true);
		}
    }
    else if (this.deviceProperties['isAndroid']) {
		this.container.classList.add('imatheq_modal_android');
    }
    else if (this.deviceProperties['isIOS'] && !this.deviceProperties['isMobile']) {
		this.container.classList.add('imatheq_modal_ios');
    }
    this.bindDragEvents();
    _imatheq_popupWindow = this.iframe.contentWindow;
    this.opened = true;
    this.created = true;
}

ModalWindow.prototype.open = function(lang) {

    if (this.opened == true || this.created) {

        if (this.opened == true && this.state != "minimized") {
            //this.updateToolbar();
            if (_imatheq_new_formula ) {
                this.updateMathMLContent();
                this.lastImageWasNew = true;
            }
            else {
                this.lastImageWasNew = false;
            }
        }
        else {
            this.container.style.visibility = '';
            this.container.style.opacity = '';
            this.container.style.display = '';
            this.overlay.style.visibility = '';
            this.overlay.style.display = '';

            this.opened = true;

            //this.updateToolbar();

            if (_imatheq_new_formula) {
                this.updateMathMLContent();
                this.lastImageWasNew = true;
            } else {
                this.lastImageWasNew = false;
            }

            if (!this.isAndroid && !this.isIOS) {
				if(this.state == "minimized") {
					this.state = this.preState;
				}
				if(this.state == "restored") {
					this.onRestore(true);
				} else {
					this.state = "minimized";
					this.onMinMax();
				}
            }
        }

        // Maximize window only when the configuration is set and the device is not ios or android.
        if (this.isDesktop && typeof _imatheq_conf_modal_window != "undefined" && _imatheq_conf_modal_window && _imatheq_conf_modalWindowFullScreen) {
            this.maximize();
        }

        if (this.isIOS) {
            this.iosSoftkeyboardOpened = false;
            this.setIframeContainerHeight("100" + this.iosMeasureUnit);
        }
    } else {
        this.create(lang);
    }

}


ModalWindow.prototype.onRestore = function (forced) {
    if (this.state == 'restored' && (forced === undefined ||  forced === null || !forced)) {
        this.maximize();
    } else {
        this.container.style.width = null;
		this.iframeDiv.style.width = _imatheq_iframe_width + "px";
		this.iframeDiv.style.height = _imatheq_iframe_height + "px";
		this.iframe.style.width = _imatheq_iframe_width + "px"; 
		this.iframe.style.height = _imatheq_iframe_height + "px";
        this.state = 'restored';
		this.iframeDiv.style.display = "";

        this.container.style.top = null;
		//this.container.style.right = null;
        this.container.style.left = null;
        this.container.style.right = "0px";
        this.container.style.bottom = "1px";
        this.container.style.position = null;
		if (navigator.userAgent.search("Msie/") >= 0 || navigator.userAgent.search("Trident/") >= 0 || navigator.userAgent.search("Edge/") >= 0 ) {
			this.container.style['position'] = 'fixed';
			this.container.style['border'] = '1px solid';
		}

        this.overlay.style.background = "rgba(0,0,0,0)";

		if (!this.overlayDiv.classList.contains('imatheq_modal_restore')) {
			if (this.overlayDiv.classList.contains('imatheq_modal_maximized')) {
				this.overlayDiv.classList.remove('imatheq_modal_maximized');
				this.restoreBtn.classList.remove('imatheq_modal_maximized')
			}
			else {
				this.overlayDiv.classList.remove('imatheq_modal_minimized');
				this.minimizeBtn.classList.remove('imatheq_modal_minimized')
				this.minimizeBtn.classList.add('imatheq_modal_maximized')
				this.restoreBtn.classList.remove('imatheq_modal_minimized')
			}
			this.overlayDiv.classList.add('imatheq_modal_restore');
			this.restoreBtn.classList.add('imatheq_modal_restore');
			this.minimizeBtn.title = _imatheq_strings["minimize"];
			this.restoreBtn.title = _imatheq_strings["maximize"];
		}
    }
}

ModalWindow.prototype.onMinMax = function() {
    if (this.state == 'minimized') {
        this.maximize();
    }
    else {
        this.detachDragEvents();
		this.preState = this.state;
        this.state = "minimized";
        this.container.style.width = "300px";
        this.container.style.left = null;
        this.container.style.top = null;
        this.container.style.position = null;
        this.container.style.right = "0px";
        this.container.style.bottom = "1px";
        this.overlayDiv.style.background = "rgba(0,0,0,0)";
		this.iframeDiv.style.display = "none";

		if (!this.overlayDiv.classList.contains('imatheq_modal_minimized')) {
			if (this.overlayDiv.classList.contains('imatheq_modal_restore')) {
				this.overlayDiv.classList.remove('imatheq_modal_restore');
				//this.restoreBtn.classList.remove('imatheq_modal_restore')
			}
			else {
				this.overlayDiv.classList.remove('imatheq_modal_maximized');
				this.restoreBtn.classList.remove('imatheq_modal_maximized')
				this.restoreBtn.classList.add('imatheq_modal_restore')
			}

			this.overlayDiv.classList.add('imatheq_modal_minimized');
			this.minimizeBtn.classList.remove('imatheq_modal_maximized')
			this.minimizeBtn.classList.add('imatheq_modal_minimized')
			this.minimizeBtn.title = _imatheq_strings["maximize"];
			this.restoreBtn.title = _imatheq_strings["restore"];
		}
    }
}

ModalWindow.prototype.maximize = function() {

    this.getScrollBarWidth();

	var w_factor = parseInt(window.innerWidth) > 640 ? 0.9 : 1;
	var h_factor = parseInt(window.innerHeight) > 420 ? 0.9 : 1;
		
	this.state = 'maximized';
	var w = Math.floor((window.innerWidth - this.scrollbarWidth) * w_factor - 2);	//minus border
	var h = Math.floor(window.innerHeight * h_factor - 2);
	this.iframeDiv.style.width = w + "px";
	this.iframeDiv.style.height = h + "px";
	this.iframeDiv.style.display = "";
    this.container.style.width = (w) + 'px';
	this.iframe.style.width = w + "px";; 
	this.iframe.style.height = h + "px";

    if (!this.overlayDiv.classList.contains('imatheq_modal_maximized')) {
		if (this.overlayDiv.classList.contains('imatheq_modal_minimized')) {
			this.overlayDiv.classList.remove('imatheq_modal_minimized');
			this.minimizeBtn.classList.remove('imatheq_modal_minimized')
			this.minimizeBtn.classList.add('imatheq_modal_maximized')
		} else if (this.overlayDiv.classList.contains('imatheq_modal_restore')) {
			this.container.style.left = null;
			this.container.style.top = null;
			this.overlayDiv.classList.remove('imatheq_modal_restore');
		}
		this.overlayDiv.classList.add('imatheq_modal_maximized');
		this.restoreBtn.classList.remove('imatheq_modal_restore')
		this.restoreBtn.classList.add('imatheq_modal_maximized')
		this.minimizeBtn.title = _imatheq_strings["minimize"];
		this.restoreBtn.title = _imatheq_strings["restore"];
	}

	//this.restoreBtn.title = "Exit full-screen";
    this.overlayDiv.style.background = "rgba(0,0,0,0.8)";
    this.overlayDiv.style.display = '';

	var right = h_factor==1 ? 1 : 0;
	this.container.style.bottom = Math.floor(window.innerHeight * (1-h_factor) / 2) + "px";
    this.container.style.right = Math.floor(window.innerWidth * (1-w_factor) / 2 + right) + "px";
    this.container.style.position = "fixed";
    this.focus();
}

/**
 * Closes modal window
 */
ModalWindow.prototype.close = function() {
    //this.setMathML('<math/>');
	if (this.iframe) {
	   var iframeContent = (this.iframe.contentWindow || this.iframe.contentDocument);
	 
	   try {	//20180805 copy
		iframeContent.clearMathML();
	   } catch(e) {
	     var tt = 1;
	   }
	}
    this.overlayDiv.style.visibility = 'hidden';
    this.container.style.visibility = 'hidden';
    this.container.style.display = 'none';
    this.container.style.opacity = '0';
    this.overlayDiv.style.display = 'none';
    this.opened = false;
}

ModalWindow.prototype.evClient = function(e) {
    if (typeof(e.clientX) == 'undefined' && e.changedTouches) {
        return {
            X : e.changedTouches[0].clientX,
            Y : e.changedTouches[0].clientY
        };
    } else {
        return {
            X : e.clientX,
            Y : e.clientY
        };
    }
}

ModalWindow.prototype.bindDragEvents = function() {
	imatheq_addEventListener(document.body, 'mousedown', this.onMousedown.bind(this));
	imatheq_addEventListener(window, 'mouseup', this.onMouseup.bind(this));
	imatheq_addEventListener(document, 'mouseup', this.onMouseup.bind(this));
	imatheq_addEventListener(document, 'mousemove', this.onMousemove.bind(this));
	imatheq_addEventListener(window, 'resize', this.onWinResize.bind(this));
}

ModalWindow.prototype.onMousedown = function(e) {
    if (this.state == 'minimized') {
        return;
    }
    if (e.target.className == 'imatheq_modal_title') {
        if(typeof this.curPos === 'undefined' || this.curPos === null) {
            e = e || event;
            this.curPos = {
                x: this.evClient(e).X,
                y: this.evClient(e).Y
            };
            this.prevPos = {
                x: "0px",
                y: "0px"
            };
            if(this.container.style.right == ''){
                this.container.style.right = "0px";
            }
            if(this.container.style.bottom == ''){
                this.container.style.bottom = "1px";
            }
            // Disable mouse events on editor when we start to drag modal.
            this.iframe.style['pointer-events'] = 'none';
            // Needed for IE11 for apply disabled mouse events on editor because iexplorer need a dinamic object to apply this property.
            if (navigator.userAgent.search("Msie/") >= 0 || navigator.userAgent.search("Trident/") >= 0 || navigator.userAgent.search("Edge/") >= 0 ) {
                this.iframe.style['position'] = 'relative';
            }
            // Apply class for disable involuntary select text when drag.
            document.body.classList.add('imatheq_noselect');
            // Obtain screen limits for prevent overflow.
            this.winRect = this.getWinRect();
            // Prevent lost mouse events into other iframes
            // Activate overlay div to prevent mouse events behind modal
            if (_imatheq_modalWindow.state != "maximized") {
                this.overlay.style.display = "";
            }
        }
    }

}

ModalWindow.prototype.onMousemove = function(e) {
    if(this.curPos) {
        e.preventDefault();
        e = e || event;
        var minY = Math.min(this.evClient(e).Y + window.pageYOffset,this.winRect.minY + window.pageYOffset);
        var maxY = Math.max(this.winRect.maxY + window.pageYOffset,minY);
        var minX = Math.min(this.evClient(e).X + window.pageXOffset,this.winRect.minX + window.pageXOffset);
        var maxX = Math.max(this.winRect.maxX + window.pageXOffset,minX);
		
        this.prevPos = {
            x: maxX - this.curPos.x + "px",
            y: maxY - this.curPos.y + "px"
        };
		
        // Move modal window with hadware acceleration.
        this.container.style.transform = "translate3d(" + this.prevPos.x + "," + this.prevPos.y + ",0)";
        this.container.style.position = 'absolute';
    }
}

ModalWindow.prototype.onMouseup = function(e) {
    if (this.curPos) {
        if(this.container.style.position != 'fixed'){
            this.container.style.position = 'fixed';
            // With fixed position, coords is relative to the main window. Transform absolute coords to relative.
            this.container.style.transform = '';
            this.container.style.right = parseInt(this.container.style.right) - parseInt(this.prevPos.x) + pageXOffset + "px";
            this.container.style.bottom = parseInt(this.container.style.bottom) - parseInt(this.prevPos.y) + pageYOffset + "px";
        }
        this.focus();
        this.iframe.style['pointer-events'] = 'auto';
        if (navigator.userAgent.search("Msie/") >= 0 || navigator.userAgent.search("Trident/") >= 0 || navigator.userAgent.search("Edge/") >= 0 ) {
            this.iframe.style['position'] = null;
        }
        document.body.classList.remove('imatheq_noselect');
        // Disable overlay for click behind modal
        if (_imatheq_modalWindow.state != "maximized") {
            this.overlayDiv.style.display = "none";
        }
    }
    this.curPos = null;
}

ModalWindow.prototype.onWinResize = function() {
    this.getScrollBarWidth();
    /*this.container.style.right = Math.min(parseInt(this.container.style.right),window.innerWidth - this.scrollbarWidth - this.container.offsetWidth) + "px";
    if(parseInt(this.container.style.right) < 0) {
        this.container.style.right = "0px";
    }
    this.container.style.bottom = Math.min(parseInt(this.container.style.bottom),window.innerHeight - this.container.offsetHeight) + "px";
    if(parseInt(this.container.style.bottom) < 1) {
        this.container.style.bottom = "1px";
    }*/
	if(this.state != "maximized") return;

	var w_factor = parseInt(window.innerWidth) > 640 ? 0.9 : 1;
	var h_factor = parseInt(window.innerHeight) > 420 ? 0.9 : 1;
		
	var w = Math.floor((window.innerWidth - this.scrollbarWidth) * w_factor - 2);
	var h = Math.floor(window.innerHeight * h_factor - 2);
	this.iframeDiv.style.width = w + "px";
	this.iframeDiv.style.height = h + "px";
	this.iframeDiv.style.display = "";
    this.container.style.width = (w) + 'px';
	this.iframe.style.width = w + "px";; 
	this.iframe.style.height = h + "px";

	var right = h_factor==1 ? 1 : 0;
	this.container.style.bottom = Math.floor(window.innerHeight * (1-h_factor) / 2) + "px";
    this.container.style.right = Math.floor(window.innerWidth * (1-w_factor) / 2 + right) + "px";
    this.container.style.position = "fixed";
}

ModalWindow.prototype.getScrollBarWidth = function() {
    this.hasScrollBar = window.innerWidth > document.documentElement.clientWidth;
    if(this.hasScrollBar){
		var inner = document.createElement('p');	//20180805 copy begin
		inner.style.width = "100%";
		inner.style.height = "200px";

		var outer = document.createElement('div');
		outer.style.position = "absolute";
		outer.style.top = "0px";
		outer.style.left = "0px";
		outer.style.visibility = "hidden";
		outer.style.width = "200px";
		outer.style.height = "150px";
		outer.style.overflow = "hidden";
		outer.appendChild(inner);

		document.body.appendChild(outer);
		var widthOuter = inner.offsetWidth;

		outer.style.overflow = 'scroll';
		var widthInner = inner.offsetWidth;

		if (widthOuter == widthInner) {
			widthInner = outer.clientWidth;
		}
		document.body.removeChild(outer);

        this.scrollbarWidth = widthOuter - widthInner;
    }else{
        this.scrollbarWidth = 0;
    }
}

ModalWindow.prototype.reCalculateScrollBar = function() {	//20180805 copy end
    this.hasScrollBar = window.innerWidth > document.documentElement.clientWidth;
    if(this.hasScrollBar){
        this.scrollbarWidth = this.getScrollBarWidth();
    }else{
        this.scrollbarWidth = 0;
    }
}

ModalWindow.prototype.detachDragEvents = function() {
	imatheq_removeEventListener(document.body, 'mousedown', this.onMousedown);
	imatheq_removeEventListener(window, 'mouseup', this.onMouseup);
	imatheq_removeEventListener(document, 'mouseup', this.onMouseup);
    imatheq_removeEventListener(document.getElementsByClassName("imatheq_modal_iframe")[0], 'mouseup', this.onMouseup);
	imatheq_removeEventListener(document, 'mousemove', this.onMousemove);
	imatheq_removeEventListener(window, 'resize', this.onWinResize);
}

/*  function elementDrag(e) {
    e = e || window.event;
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
	
	if(elmnt.offsetTop - pos2 < 0) {
		elmnt.style.top = "0";
		elmnt.style.bottom = "auto";
	} else if(parseInt(window.getComputedStyle(elmnt,null).getPropertyValue("bottom")) < 0) {
		elmnt.style.bottom = "0";
		elmnt.style.top = "auto";
	} else {
		elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
		elmnt.style.bottom = "auto";
	}
	
	if(elmnt.offsetLeft - pos1 < 0) {
		elmnt.style.left = "0";
		elmnt.style.right = "auto";
	} else if(parseInt(window.getComputedStyle(elmnt,null).getPropertyValue("right")) < 0) {
		elmnt.style.right = "0";
		elmnt.style.left = "auto";
	} else {
		elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
		elmnt.style.right = "auto";
	}

	e.stopPropagation();
	return false;
  }*/

ModalWindow.prototype.focus = function() {
    // Focus on iframe explicit
    // We add this focus in iframe beacuse tiny3 have a problem with focus in chrome and it can't focus iframe automaticly
    if (navigator.userAgent.search("Chrome/") >= 0 && navigator.userAgent.search('Edge') == -1) {
        this.iframe.focus();
    }
}


ModalWindow.prototype.getWinRect = function() {

    var offsetY = (this.container.offsetHeight + parseInt(this.container.style.bottom)) - (window.innerHeight - (this.curPos.y - window.pageXOffset));
    var offsetX = window.innerWidth - this.scrollbarWidth - (this.curPos.x - window.pageXOffset) - parseInt(this.container.style.right);

	var rect = {
		minX: window.innerWidth - offsetX - this.scrollbarWidth,
		minY: window.innerHeight - this.container.offsetHeight + offsetY,
		maxX: this.container.offsetWidth - offsetX,
		maxY: this.titleBar.offsetHeight - (this.titleBar.offsetHeight - offsetY)
	}
    return rect;
}

//# sourceURL=common.js