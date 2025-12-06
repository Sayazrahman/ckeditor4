﻿/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
	
	config.toolbar = [
        { name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo', '-', 'CopyFormatting', 'RemoveFormat' ] },
        { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
        { name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
        '/',
        { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript' ] },
        { name: 'insert', items: [ 'Image', 'Audio', 'Video', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar' ] },
        { name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] },
        { name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'Link', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language' ] },	                  
    ];
	config.plugins = 'dialogui,dialog,dialogadvtab,basicstyles,bidi,blockquote,notification,button,clipboard,panelbutton,panel,floatpanel,colorbutton,colordialog,menu,contextmenu,copyformatting,div,resize,elementspath,enterkey,entities,popup,filetools,filebrowser,find,fakeobjects,floatingspace,listblock,richcombo,font,format,horizontalrule,htmlwriter,wysiwygarea,image,indent,indentblock,indentlist,smiley,justify,menubutton,language,list,liststyle,magicline,maximize,pastetext,pastefromword,removeformat,selectall,showblocks,showborders,sourcearea,specialchar,scayt,stylescombo,tab,table,tabletools,tableselection,undo,lineutils,widgetselection,widget,notificationaggregator,uploadwidget,uploadimage,wsc,simpleImageUpload,imageresizerowandcolumn,uploadfile,html5audio';
	config.extraPlugins += (config.extraPlugins.length == 0 ? '' : ',') + 'imatheq';
	config.extraPlugins += ',html5audio,html5video';
	config.toolbar.push({name:'imatheq', items:['imatheq_formula_editor']});
	config.allowedContent = true;
	config.skin = 'moono-lisa';
	
	config.filebrowserUploadMethod = 'form';
	
	
};



