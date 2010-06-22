/**
* @package: phpBB 3.0.7-PL1 :: WYSIWYM Markdown editor -> root/styles/prosilver/template
* @version: $Id: posting_wysiwym.js, [DEV] 0.0.4 2010/06/02 10:06:02 leviatan21 Exp $
* @copyright: leviatan21 < info@mssti.com > (Gabriel) http://www.mssti.com/phpbb3/
* @license: http://opensource.org/licenses/gpl-license.php GNU Public License 
* @author: leviatan21 - http://www.phpbb.com/community/memberlist.php?mode=viewprofile&u=345763
* 
**/

/**
* @ignore 
*
* @todo :
*	improve code ?
*	improve url detection ?
*	attachment improve
*	improve phpbb_tokens
*
* @done :
*	font size & font color click.
*	Maximum nested quotes per post
*	images optionget
*	flash optionget
*	Do not automatically parse URLs
**/


/** Some css on-the-fly - Start **/
document.write("\n\r" + '<style type="text/css" media="all">'+ "\r" + '<!--' + "\r");
document.write("\r" + '#wysiwim_preview .postbody { height: auto; font-size: 99%; }');
document.write("\r" + '#wysiwim_editor { overflow: auto; height: 200px; padding-{S_CONTENT_FLOW_END}: 2px; }');
/** Style dependance - Start **/
document.write("\r" + '#wysiwim_editor .codebox { padding: 3px; background-color: #FFFFFF; border: 1px solid #d8d8d8; }');
document.write("\r" + '#wysiwim_editor .codebox div { font-weight: bold; font-size: 0.8em; text-transform: uppercase; border-bottom: 1px solid #cccccc; }');
document.write("\r" + '#wysiwim_editor .codebox code { color: #2E8B57; white-space: normal; display: block; font: 0.9em Monaco, "Andale Mono","Courier New", Courier, mono; }');
document.write("\r" + '#wysiwim_editor blockquote div { height: auto; width: 100%; }');
document.write("\r" + '#wysiwim_editor .error { font-size: 1em; }');
// document.write("\r" + '#wysiwim_editor .postlink-local { color: red; }');

/** Style dependance - End **/
document.write( "\r" + '-->' + "\r" + '</style>' + "\n\r");
/** Some css on-the-fly - End **/
/**
* This is not a WYSIWYG editor. Rather, it is a WYSIWYM Markdown editor (what you see Is what you mean).
**/
var WYSIWYM = new function()
{
	// Common variables
	var phpbb_editor = '';
	var wysiwim_editor = '';
	var wysiwim_preview = 'wysiwim_preview';
	var max_quote_depth = <!-- IF W_MAX_QUOTE_DEEP -->{W_MAX_QUOTE_DEEP}<!-- ELSE -->3<!-- ENDIF -->;
	var viewimg = <!-- IF W_VIEW_IMAGES -->{W_VIEW_IMAGES}<!-- ELSE -->1<!-- ENDIF -->;
	var viewflash = <!-- IF W_VIEW_FLASH -->{W_VIEW_FLASH}<!-- ELSE -->1<!-- ENDIF -->;
	var viewsmilies = <!-- IF W_VIEW_SMILIES -->{W_VIEW_SMILIES}<!-- ELSE -->1<!-- ENDIF -->;
	var display_warning = false;

	/**
	* Set some default variables and hide the preview
	**/
	Start = function()
	{
		phpbb_editor = document.getElementById('message');
		phpbb_editor.onkeyup = function() { Update(); return false; };
		wysiwim_editor = document.getElementById('wysiwim_editor');
		dE(wysiwim_preview);
	};

	/**
	* Get core bbcodes and custom bbcodes ( if available )
	*  1=($1) 2=($2) 3=($3) 4=($4) 5=($5) 6=($6) 7=($7) 8=($8) 9=($9) 10=(10)
	**/
	BBcode_set = function()
	{
		var BBcode = {
			'code' : {
				clear_open : '[code]',
				clear_close : '[/code]',
				bbcode_open : /\[code\]((.|\n)*?)\[\/code\]/ig,
				bbcode_close : '',
				html_open : bbcode_code,
				html_close : ''
			},
			'quote_username' : {
				clear_open : '[quote=',
				clear_close : '[/quote]',
				bbcode_open : /\[quote="(.*?)"\]/gim,
				bbcode_close : /\[\/quote\]/gim,
				html_open : '<blockquote><div><cite>$1 {L_WROTE}:</cite>',
				html_close : '</div></blockquote>'
			},
			'quote_uncited' : {
				clear_open : '[quote]',
				clear_close : '[/quote]',
				bbcode_open : /\[quote\]/gim,
				bbcode_close : /\[\/quote\]/gim,
				html_open : '<blockquote class="uncited"><div>',
				html_close : '</div></blockquote>'
			},
			'bold' : {
				clear_open : '[b]',
				clear_close : '[/b]',
				bbcode_open : /\[b\]/gim,
				bbcode_close : /\[\/b\]/gim,
				html_open : '<strong>',
				html_close : '</strong>'
			},
			'italic' : {
				clear_open : '[i]',
				clear_close : '[/i]',
				bbcode_open : /\[i\]/gim,
				bbcode_close : /\[\/i\]/gim,
				html_open : '<em>',
				html_close : '</em>'
			},
			'url' : {
				clear_open : '[url]',
				clear_close : '[/url]',
				bbcode_open : /\[url\](ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?\[\/url\]/gim,
			//						 /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
				bbcode_close : '',
				html_open : '<a href="$3" class="postlink">$3</a>',
				html_close : ''
			},
			'url_description' : {
				clear_open : '[url=',
				clear_close : '[/url]',
				bbcode_open : /\[url=(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?\](.*?)\[\/url\]/gim,
			//	bbcode_open : /\[url=(.*?)\](.*?)\[\/url\]/gim,
				bbcode_close : '',
				html_open : '<a href="$3" class="postlink">$7</a>',
				html_close : ''
			},
			'image' : {
				clear_open : '[img]',
				clear_close : '[/img]',
				bbcode_open : /\[img\](.*?)\[\/img\]/gim,
				bbcode_close : '',
				html_open : '<img src="$1" alt="{L_IMAGE}" class="resize_me" />',
				html_close : ''
			},
			'image_viewimg' : {
				clear_open : '[img]',
				clear_close : '[/img]',
				bbcode_open : /\[img\](.*?)\[\/img\]/gim,
				bbcode_close : '',
				html_open : ' <a href="$1" alt=">[ img ]" />[ img ]</a> ',
				html_close : ''
			},
			'size' : {
				clear_open : '[size=',
				clear_close : '[/size]',
				bbcode_open : /\[size=(\d+)\]/gim,
				bbcode_close : /\[\/size\]/gim,
				html_open : '<span style="font-size: $1%; line-height: 116%;">',
				html_close : '</span>'
			},
			'colour' : {
				clear_open : '[color=',
				clear_close : '[/color]',
				bbcode_open : /\[color=(#([0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]|[0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F])|[a-z\-]+)\]/gim,
			//	bbcode_open : /\[color=(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|[a-z\-]+)\]/gim,
				bbcode_close : /\[\/color\]/gim,
				html_open : '<span style="color: $1">',
				html_close : '</span>'
			},
			'underline' : {
				clear_open : '[u]',
				clear_close : '[/u]',
				bbcode_open : /\[u\]/gim,
				bbcode_close : /\[\/u\]/gim,
				html_open : '<span style="text-decoration: underline">',
				html_close : '</span>'
			},
			//	list items are managed within bbcode_list
			'unordered_list' : {
				clear_open : '[list]',
				clear_close : '[/list]',
				bbcode_open : /\[list\]((.|\n)*?)\[\/list\]/gim,
				bbcode_close : '',
				html_open : bbcode_list,
				html_close : ''
			},
			'ordered_list' : {
				clear_open : '[list=',
				clear_close : '[/list]',
				bbcode_open : /\[list=(.*?)\]((.|\n)*?)\[\/list\]/gim,
				bbcode_close : '',
				html_open : bbcode_list,
				html_close : ''
			},
			'email' : {
				clear_open : '[email]',
				clear_close : '[/email]',
				bbcode_open : /\[email\](.*?)\[\/email\]/gim,
				bbcode_close : '',
				html_open : '<a href="mailto:$1" class="postlink">$1</a>',
				html_close : ''
			},
			'email_description' : {
				clear_open : '[email=',
				clear_close : '[/email]',
				bbcode_open : /\[email=(.*?)\](.*?)\[\/email\]/gim,
				bbcode_close : '',
				html_open : '<a href="mailto:$1" class="postlink">$2</a>',
				html_close : ''
			},
			'flash' : {
				clear_open : '[flash=',
				clear_close : '[/flash]',
				bbcode_open : /\[flash=(\d+),(\d+)\](.*?)\[\/flash\]/gim,
				bbcode_close : '',
				html_open : '<object classid="clsid:D27CDB6E-AE6D-11CF-96B8-444553540000" codebase="http://active.macromedia.com/flash2/cabs/swflash.cab#version=5,0,0,0" width="$1" height="$2"><param name="movie" value="$3" /><param name="play" value="false" /><param name="loop" value="false" /><param name="quality" value="high" /><param name="allowScriptAccess" value="never" /><param name="allowNetworking" value="internal" /><embed src="$3" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash" width="$1" height="$2" play="false" loop="false" quality="high" allowscriptaccess="never" allownetworking="internal"></embed></object>',
				html_close : ''
			},
			'flash_viewflash' : {
				clear_open : '[flash=',
				clear_close : '[/flash]',
				bbcode_open : /\[flash=(\d+),(\d+)\](.*?)\[\/flash\]/gim,
				bbcode_close : '',
				html_open : ' <a href="$3" alt="[ flash ]" />[ flash ]</a> ',
				html_close : ''
			},
<!-- IF .wysiwim_custom_tags -->
	<!-- BEGIN wysiwim_custom_tags -->
			'{wysiwim_custom_tags.WBBCODE_NAME}' : {
				clear_open : '[{wysiwim_custom_tags.WBBCODE_TAG}',
				clear_close : '[/{wysiwim_custom_tags.WBBCODE_TAG}]',
				bbcode_open : '{wysiwim_custom_tags.WBBCODE_MATCH}',
				bbcode_close : '',
				html_open : '{wysiwim_custom_tags.WBBCODE_REPLACE}',
				html_close : '',
				custom_tag : true
			},
	<!-- END wysiwim_custom_tags -->
/**
@ignore : this is only for testing proposes

			'center2' : {
				clear_open : '[center2',
				clear_close : '[/center2]',
				bbcode_open : '[center2]{text1}[/center2]',
				bbcode_close : '',
				html_open : '<center>{text1}</center>',
				html_close : '',
				custom_tag : true
			},
			'bbvideo' : {
				clear_open : '[BBvideo',
				clear_close : '[/BBvideo]',
				bbcode_open : '[bbvideo {number1},{number2}]{url}[/bbvideo]',
				bbcode_close : '',
				html_open : '<span><b>1 number=</b>{number1}, <b>2 number=</b>{number2}, <b>url=</b>{url}</span>',
				html_close : '',
				custom_tag : true
			},
**/
<!-- ENDIF -->
			'attachment' : {
				clear_open : '[attachment=',
				clear_close : '[/attachment]',
				bbcode_open : /\[attachment=(\d+)\](.*?)\[\/attachment\]/gim,
				bbcode_close : '',
			//	html_open : bbcode_attachment
				html_open : '<div class="inline-attachment"><dl class="file" style="height: 1em;"><strong>$2</strong></dl></div>',
				html_close : ''
			}
		};
		return BBcode;
	};

<!-- IF .wysiwim_custom_tags -->
	/**
	* Set a pair of tokens and replacement for custom bbcodes
	* We use lowecase because the template engine
	**/
	phpbb_tokens = function()
	{
		var tokens = {
			'{url}' : {
				pattern : '(.*?)',
				modifiers : "gim"
			},
			'{email}' : {
				pattern : '(.*?)',
				modifiers : "gim"
			},
			'{text}' : {
				pattern : '((.|\n)*?)', //''(.*?)',
				modifiers : 'gim'
			},
			'{simpletext}' : {
				pattern : '(.*?)',
				modifiers : 'gim'
			},
			'{inttext}' : {
				pattern : '(.*?)',
				modifiers : 'gim'
			},
			'{identifier}' : {
				pattern : '(.*?)',
				modifiers : 'gim'
			},
			'{color}' : {
				pattern : '(.*?)',
				modifiers : 'gim'
			},
			'{number}' : {
				pattern : '(.*?)', 
				modifiers : 'gim'
			},
			// Custom replacement
			'{username}' : {
				pattern : '(.*?)',
				modifiers : 'gim'
			}
		};

		return tokens;
	};
<!-- ENDIF -->

<!-- IF S_SMILIES_ALLOWED and .smiley -->
	/**
	* Set a pair of tokens and replacement for custom bbcodes
	* We use lowecase because the template engine
	**/
	phpbb_smilies = function()
	{
		var smiley = {
			/* Wrap the smiley with spaces */
	<!-- BEGIN smiley -->
			' {smiley.A_SMILEY_CODE} ' : {
				image : '{smiley.SMILEY_IMG}',
				description : '{smiley.SMILEY_DESC}'
			}<!-- IF not smiley.S_LAST_ROW -->,<!-- ENDIF -->
	<!-- END smiley -->
		}
		return smiley;
	};
<!-- ENDIF -->

	/**
	* Parse code text from code tag
	**/
	bbcode_code = function(full_tag, content )
	{
		/* Double spaces */
		content = content.replace(/  /g, "&nbsp;&nbsp;");
		/* Tabs to 4 spaces */
		content = content.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
		/*	'['	to	'&#91;'	and	']'	to	'&#93;'		*/
		content = content.replace(/\[/g, '&#091;').replace(/\]/g, '&#093;');
		/*	'.'	to	'&#46;'	and	':'	to	'&#058;'	*/
		content = content.replace(/\./g, '&#046;').replace(/\:/g, '&#058;');
		/*	'<'	to	'&lt;'	and	'>'	to	'&gt;'		*/
		content = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');

		return '<div class="codebox">' + '<div>{L_CODE}: <a href="#" onclick="selectCode(this); return false;">{L_SELECT_ALL_CODE}</a></div><code>' + content + '</code></div>';
	};

	/**
	* Parse list bbcode
	**/
	bbcode_list = function(full_tag, type, content)
	{
		// Simple list
		if (full_tag.match(/\[list\]/g))
		{
			content = type;
			type = 'default';
		}

		// no type ?
		if (typeof type == 'undefined' || type == '' || type === null)
		{
			return full_tag;
		}

		if (type == '' || type == 'default')
		{
			tpl = 'ulist_open_default';
			type = 'default';
		}
		else if (type == 'i')
		{
			tpl = 'olist_open';
			type = 'lower-roman';
		}
		else if (type == 'I')
		{
			tpl = 'olist_open';
			type = 'upper-roman';
		}
		else if (type.toLowerCase().match(/(disc|circle|square)/g))
		{
			tpl = 'ulist_open';
			type = type.toLowerCase();
		}
		else if (typeof type === 'number')
		{
			tpl = 'olist_open';
			type = 'decimal';
		}
		else if (type.match(/[a-z]/g) && type != 'default')
		{
			tpl = 'olist_open';
			type = 'lower-alpha';
		}
		else if (type.match(/[A-Z]/g))
		{
			tpl = 'olist_open';
			type = 'upper-alpha';
		}
		else
		{
			tpl = 'olist_open';
			type = 'decimal';
		}

		content = content.replace(/\[\*\]([^\[]*)?/gim, '<li>$1</li>');

		if (tpl == 'ulist_open_default')
		{
			return '<ul>' + content + '</ul>';
		}

		if (tpl == 'olist_open')
		{
			return '<ol style="list-style-type: ' + type + '">' + content + '</ol>';
		}

		if (tpl == 'ulist_open')
		{
			return '<ul style="list-style-type: ' + type + '">' + content + '</ul>';
		}
	};

	/**
	* Parse attachment bbcode
	**/
	bbcode_attachment = function(full_tag, type, content)
	{
		var html  = '<div class="inline-attachment">';
			html += '<dl class="file">' +
						'<dt><a class="postlink" href="' + content + '">' + content + '</a></dt>' +
						'<!-- IF _file.COMMENT --><dd><em>{_file.COMMENT}</em></dd><!-- ENDIF -->' +
						'<dd>({_file.FILESIZE} {_file.SIZE_LANG}) {_file.L_DOWNLOAD_COUNT}</dd>' +
					'</dl>';
			html += '</div>';

		return html;
	};

	/**
	* Determine if a variable exist
	* A function that should work as the isset in phpbb
	**/
	isset = function(variable_name)
	{
		try {
			if (typeof(eval(variable_name)) != 'undefined')
			{
				if (eval(variable_name) !== null)
				{
					return true;
				}
			}
		} catch(e) { }
		return false;
	};

	is_checked = function(id)
	{
		if (document.getElementById(id))
		{
			return document.getElementById(id).checked;
		}
		return false;
	};

	/**
	* http://tools.ietf.org/html/rfc3986
	* http://www.codingforums.com/archive/index.php/t-9241.html
	*
	*	An example URIs and their component parts:
	*	foo://example.com:8042/over/there?name=ferret#nose
	*	\_/   \______________/\_________/ \_________/ \__/
	*	 |           |            |            |        |
	* scheme     authority       path        query   fragment
	**/
	parse_magic_url = function()
	{
		//	http://www.mssti.com/phpbb3/viewtopic.php?f=95&p=10994#p10994
		//	viewtopic.php?f=70&t=2093183&start=0
		var full_url	= arguments[0];
		var scheme		= arguments[1];		//	http://			||
		var before		= (arguments[2] ? arguments[2] : '');
		var authority	= arguments[4];		//	www.mssti.com	||	viewtopic.php
		var script		= arguments[11];	//	/viewtopic.php	||
		var query		= arguments[13];	//	?f=95&p=10994	||	?f=70&t=2093183&start=0
		var fragment	= arguments[16];	//	#p10994			||
		var after		= (arguments[18] ? arguments[18] : '');
		var css_class = 'postlink';

		var url = full_url.replace(/( |\n)/g, "");
		var short_url = (url.length > 55) ? url.substring(0, 39) + ' ... ' + url.substring(url.length, url.length-10) : url;

		// Means it's not local
		if (!scheme && script)
		{
			url = 'http://' + url;
		}
		// Means it's local
		if (!script && query)
		{
			css_class = 'postlink-local';
		}
		/**
		var toalert = '';
		for(var i=0; i<arguments.length; i++)
		{
			toalert += "argument=("+i+") value=("+arguments[i]+")"+"\n";
		}
		alert(toalert);
		**/
		return before + '<a href="' + url + '" class="' + css_class + '">' + short_url + '</a>' + after;
	};

	/**
	* JavaScript preg_quote
	*	Quote regular expression characters plus an optional character 
	* Code from : http://phpjs.org/functions/preg_quote:491
	RegExp_escape = function(str)
	{
		var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"); // .*+?|()[]{}\
		return str.replace(specials, "\\$&");
		return str;
	};
	**/
	preg_quote = function(str)
	{
		// Quote regular expression characters plus an optional character
		// 
		// version: 1004.2314
		// discuss at: http://phpjs.org/functions/preg_quote
		// +   original by: booeyOH
		// +   improved by: Ates Goral (http://magnetiq.com)
		// +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// +   bugfixed by: Onno Marsman
		// *     example 1: preg_quote("$40");    // *     returns 1: '\$40'
		// *     example 2: preg_quote("*RRRING* Hello?");
		// *     returns 2: '\*RRRING\* Hello\?'
		// *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
		// *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'
		return (str+'').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!<>\|\:])/g, '\\$1');
	};

	/**
	* build a valid regexp
	**/
	Build_Regexp = function(bbcode)
	{
		bbcode = Replace_Tokens(bbcode);

		bbcode.bbcode_open = bbcode.bbcode_open.replace(/\//g, "\\/");
		bbcode.bbcode_open = bbcode.bbcode_open.replace(/\[/g, "\\[");
		bbcode.bbcode_open = bbcode.bbcode_open.replace(/\]/g, "\\]");
		bbcode.bbcode_open = new RegExp(bbcode.bbcode_open, 'gim');

		return bbcode;
	};

	/**
	* Replace phpb tokens to a valid regexp 
	**/
	Replace_Tokens = function(bbcode, recursive)
	{
		var tokens		= phpbb_tokens();

		var num;
		var bbcode_token;
		var bbcode_token_new;
		var token_open	= bbcode.bbcode_open.indexOf('{');
		var token_close	= bbcode.bbcode_open.indexOf('}');
		bbcode_token	= bbcode.bbcode_open.substring(token_open, token_close+1);
		num				= bbcode_token.substring((bbcode_token.length-2), (bbcode_token.length-1));

		if (Number(num))
		{
			bbcode_token_new	= bbcode_token.replace(num, '');
			bbcode.bbcode_open	= bbcode.bbcode_open.replace(bbcode_token, bbcode_token_new);
			bbcode.html_open	= bbcode.html_open.replace(bbcode_token, bbcode_token_new);
			bbcode_token		= bbcode_token_new;
		}
		else
		{
			num = 1;
		}

		if (recursive)
		{
			num = recursive;
		}

		for (var token in tokens)
		{
			// Have the bbcode this token ?
			if (bbcode_token.indexOf(token) < 0)
			{
				continue;
			}
			bbcode.bbcode_open = bbcode.bbcode_open.replace(token, tokens[token].pattern);
			bbcode.html_open   = bbcode.html_open.replace(token, '$' + num);
			break;
		}

		// Need to run this again ?
		if (bbcode.bbcode_open.indexOf('{') > 0)
		{
			bbcode = Replace_Tokens(bbcode, parseFloat(num) + 1);
		}

		return bbcode;
	};

	/**
	* Pure innerHTML is slightly faster in IE 
	*	code from : http://blog.stevenlevithan.com/archives/faster-than-innerhtml
	* @param string		el			the element ID to display the result
	* @param string		str			the result to display
	**/
	replaceHtml = function(el, html)
	{
		var oldEl = typeof el === "string" ? document.getElementById(el) : el;
		/*@cc_on // Pure innerHTML is slightly faster in IE
		oldEl.innerHTML = html;
		return oldEl;
		@*/
		var newEl = oldEl.cloneNode(false);
		newEl.innerHTML = html;
		oldEl.parentNode.replaceChild(newEl, oldEl);
		/* Since we just removed the old element from the DOM, return a reference
		to the new element, which can be used to restore variable references. */
		return newEl;
	};

	/**
	* Update the preview
	**/
	Update = function(e)
	{
	//	e = e || window.event; // for IE
		// Run this only if the preview is visible ;)
		if (document.getElementById(wysiwim_preview).style.display != 'none')
		{
			var the_text = bbcode_to_html_Parse(phpbb_editor.value);

			wysiwim_editor.innerHTML = the_text;
		//	replaceHtml(wysiwim_editor, the_text);
		}
	};

	/**
	* Main function
	*	Most of the magic happens here
	**/
	bbcode_to_html_Parse = function(str)
	{
		/* Do not automatically parse URLs - Start */
		if (!is_checked('disable_magic_url'))
		{//	http://www.weberdev.com/get_example-4569.html
			var url_match = /((\s|\n)(http|https|ftp):\/\/)?((([\d\w]|%[a-fA-f\d]{2,2})+(:([\d\w]|%[a-fA-f\d]{2,2})+)?@)?([\d\w][-\d\w]{0,253}[\d\w]\.)+[\w]{2,4}(:[\d]+)?)(\/([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)*(\?(&?([-+_~.\d\w]|%[a-fA-f\d]{2,2})=?)*)?(#([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)?(\s|\n)/gim;
			/* I swear I try to made this easy, but can't */
			str = str.replace(url_match, parse_magic_url);
		}
		/* Do not automatically parse URLs - End */

		/** Have the post a possible bbcode ? **/
		if (str.indexOf('[') < 0 || is_checked('disable_bbcode'))
		{
			/* convert CRLF to <br> */
			str = str.replace(/\n/g, "<br />");
			return str;
		}

		var bbcode_start;
		var bbcode_end;
		var bbcodes = BBcode_set();
		for (var i in bbcodes)
		{
			// Have this bbcode (open or close tag)?
			bbcode_start = (isset(bbcodes[i].bbcode_open)  ? str.indexOf(bbcodes[i].clear_open)  > -1 : false);
			bbcode_end = (isset(bbcodes[i].bbcode_close) ? str.indexOf(bbcodes[i].clear_close) > -1 : (bbcode_start ? true : false));
			if (bbcode_start && bbcode_end)
//			if (str.indexOf(bbcodes[i].clear_open) > -1 || (str.indexOf(bbcodes[i].clear_close) > -1))
			{
				/*	images optionget and flash optionget - Start */
				if ((i == 'image' && !viewimg) || (i == 'flash' && !viewflash))
				{
					continue;
				}
				/*	images optionget and flash optionget - End */
				
				// Replace the bbcode open with his corresponding open html
				str = str.replace(bbcodes[i].bbcode_open, bbcodes[i].html_open);

				// Replace the bbcode close with his corresponding close html
				if (bbcodes[i].bbcode_close != '')
				{
					str = str.replace(bbcodes[i].bbcode_close, bbcodes[i].html_close);
				}
			}

			/* Check for max_quote_depth - Start */
			if (max_quote_depth > 0 && bbcodes[i].clear_close == '[/quote]' && bbcode_start && bbcode_end)
			{
				str = bbcode_quote_depth(str, bbcodes[i]);
			}
			/* Check for max_quote_depth - End */

			/* Parse custom bbcodes - Start */
		<!-- IF .wysiwim_custom_tags -->
			if (isset(bbcodes[i].custom_tag))
			{
				// Have this bbcode (full tag) ?
				if (str.indexOf(bbcodes[i].clear_open) > -1)
				{
					bbcodes[i] = Build_Regexp(bbcodes[i]);

					// Replace the bbcode open with his corresponding open html
					str = str.replace(bbcodes[i].bbcode_open, bbcodes[i].html_open);
				}
			}
		<!-- ENDIF -->
			/* Parse custom bbcodes - End */
		}

		/* Parse posting smilies - Start */
		if (viewsmilies && !is_checked('disable_smilies'))
		{
			<!-- IF S_SMILIES_ALLOWED and .smiley -->
			var smilies = phpbb_smilies();
			for (var smiley in smilies)
			{
				smilie = new RegExp(preg_quote(smiley), 'g');
				// Have this smiley ?
				if (str.indexOf(smiley) > -1)
				{
					str = str.replace(smilie, ' <img src="' + smilies[smiley].image + '" alt="' + smiley + '" title="' + smilies[smiley].description + '" /> ');
				}			
			}
			<!-- ENDIF -->
		}
		/* Parse posting smilies - End */

		/* Back to []:. */
		//	'&#091;'	to	'['	and	'&#093;'	to	']'
		str = str.replace(/&amp;#091;/gi, '[').replace(/&amp;#093;/gi, ']');
		//	'&#046;'	to	'.'	and	'&#058;'	to	':'
		str = str.replace(/&amp;#046;/gi, '.').replace(/&amp;#058;/gi, ':');

		/* Lists have too much "carriage return"	*/
		str = str.replace(/<(ol|ul)([^>]+)>\n+/gim, "<$1>");
		str = str.replace(/<\/(ol|ul)>\n+/gim, "</$1>");
		str = str.replace(/<li>\n+/gim, "<li>");
		str = str.replace(/\n+<\/li>/gim, "</li>");

		/* convert CRLF to <br> */
		str = str.replace(/\n/g, "<br />");

		return str + "<br />";
	};

	/*
	* Check for max_quote_depth
	*/
	bbcode_quote_depth = function(str, bbcodes)
	{
		var quote_count = str.split(bbcodes.html_close).length - 1;

		if (max_quote_depth > 0 && quote_count > max_quote_depth)
		{
			var quote_start = 0;
			var quote_end = 0;
			for (var i = 0, str_length = str.length; i < str_length; i++)
			{
				quote_start = str.indexOf(bbcodes.html_open, i);
				quote_end = str.indexOf(bbcodes.html_close, i);
				if (quote_start > -1 && quote_end > quote_start)
				{
					str_quote = str.substring(quote_start, quote_end + bbcodes.html_close.length);
					var quote_count = str_quote.split('<blockquote').length - 1;

					// there are too many nested quotes
					if (max_quote_depth > 0 && quote_count > max_quote_depth)
					{
						var warning = '{LA_QUOTE_DEPTH_EXCEEDED}'.replace( '%1$d', max_quote_depth);
						var last_quote_start = str_quote.lastIndexOf('<blockquote');
						var last_quote_end = str_quote.lastIndexOf('blockquote>');
						var last_quote_old = str_quote.substring(last_quote_start, last_quote_end + 11);
						var last_quote_new = '<p class="error">' + warning + '</p>';
						str = str.replace(last_quote_old, last_quote_new);
						if (display_warning)
						{
							alert(warning);
						}
						break;
					}
					i = quote_start;
				}
			}
		}
		return str;
	};

	this.Start = Start;
	this.Update = Update;
};

/**
* Set display of page element
* ID = element id 
**/
function dE_wysiwim(ID)
{
	dE(ID);
	if (document.getElementById(ID).style.display != 'none')
	{
		WYSIWYM.Update();
	}
	return true;
}

/** Install the safety net - START **/
if (window.onload_functions) // prosilver
{
	onload_functions[onload_functions.length] = "WYSIWYM.Start();";
}
else if (typeof(window.addEventListener) != "undefined") // DOM
{
	window.addEventListener("load", WYSIWYM.Start, false);
}
else if (typeof(window.attachEvent) != "undefined") // MSIE
{
	window.attachEvent("onload", WYSIWYM.Start);
}
/** Install the safety net - END **/