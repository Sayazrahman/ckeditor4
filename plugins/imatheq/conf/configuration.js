
/*
 * Decide whether iMathEQ Math Equation Editor is launched as a new layer or a popup window
 *	true - launch iMathEQ editor as a DIV layer 
 *	false - show as popup
 * For mobile devices, this value will be forced to set to false ans show as popup window
 */
var _imatheq_conf_modal_window = true;

/* 
 * decide by default whether iMathEQ editor is launched as maximized or restored window
 * when _imatheq_conf_modal_window is true
 * 	maximized - by default launch iMathEQ editor as maximized window 
 * 	restored - by default launch iMathEQ editor as restored window 
 * ignore if _imatheq_conf_modal_window is false
 */
var _imatheq_conf_default_modal_win = "restored";

/* 
 * decide the type of popup window when _imatheq_conf_modal_window is false
 * 	true - the popup is opened as a new tab 
 * 	false - new window
 * ignore if _imatheq_conf_modal_window is true
 */
var _imatheq_conf_new_tab = false;


/*
 * Set the properties of popup window when _imatheq_conf_modal_window is false 
 * and _imatheq_conf_new_tab is false
 * 	menubar: 1 - show menubar, 0 - do not show menubar
 * 	resizable: 1 - allow user to resize popup window, 0 - fixed windpow size
 */
var _imatheq_popup_atttributes = 'menubar=1,resizable=1,width=800,height=600';

/*
 * Configure to save equation image in base64 or png format, values are
 * 	png
 *	base64
 */
var _imatheq_conf_image_format = "base64";

/*
 * The URL of server API to save equation image when _imatheq_conf_image_format="png"
 *	Value: point to customer web API page, like: [your domain]save_imatheq_eq_image.[php/asp/etc.], 
 *		to save equation images
 *	Parameter: iMathEQ_qid - used to update/retrieve equation image
 *		When calling this API for new equation, null or blank value will be provided
 *		API should generate an new GUID 
 */
var _imatheq_conf_save_image_api = "//[your domain]/[some folder]/save_imatheq_eq_image.aspx";

/*
 * The URL of saved image and the type of URL when _imatheq_conf_image_format="png"
 *	Type = "image_path", the _imatheq_conf_image_url is like, "//[your domain]/equation_images/"
 *		   the eventual url will be like "//[your domain]/equation_images/[GUID].png?iMathEQ_qid=[GUID]"
 *	Type = "api", the _imatheq_conf_image_url is like, "//[your domain]/get_imatheq_eq_image.[aspx/php/etc.]"
 *		   the eventual url will be like "//[your domain]/get_imatheq_eq_image.[aspx/php/etc.]?iMathEQ_qid=[GUID]"
 *	Parameter: iMathEQ_qid - used to retrieve equation image
 */
/*configure image_path*/
//var _imatheq_conf_image_url = "//[your domain]/equation_images/";
//var _imatheq_conf_image_url_type = "image_path"	//"image_path" or "api"
/*configure api*/
var _imatheq_conf_image_url = "//[your domain]/get_imatheq_eq_image.[aspx/php/etc.]";
var _imatheq_conf_image_url_type = "api"	//"image_path" or "api"

/*
 * This variable is reservered for system used. Must set it as true 
 */
var _imatheq_conf_loaded = true;
