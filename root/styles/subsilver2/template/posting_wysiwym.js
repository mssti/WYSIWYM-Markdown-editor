/**
* @package: phpBB 3.0.7-PL1 :: WYSIWYM Markdown editor -> root/styles/prosilver/template
* @version: $Id: posting_wysiwym.js, [DEV] 0.0.6 2010/06/16 10:06:16 leviatan21 Exp $
* @copyright: (c) 2010 leviatan21 < info@mssti.com > (Gabriel) http://www.mssti.com/phpbb3/
* @license: http://opensource.org/licenses/gpl-license.php GNU Public License
* @author: leviatan21 - http://www.phpbb.com/community/memberlist.php?mode=viewprofile&u=345763
* 
**/

/**
* @ignore 
**/

/**
* @todo :
*	attachment improve
*	code nested
*	improve code ?
**/

/**
* @done :
*	Optimized code
*	font size & font color click.
*	Maximum nested quotes per post
*	images optionget
*	flash optionget
*	Disable BBCode
*	Disable smilies
*	Do not automatically parse URLs & emails
*	custom bbcodes
*	Smilies
*	SyntaxHighlight
*	min_post_chars and max_post_chars
*	max_post_smilies
*	max_post_urls
*	config and forum permission for bbcodes, smilies, img, url, flash and quote
*	improved url detection
*	improved phpbb_tokens
*	Style dependance based off prosilver and subsilver2
**/

/**
* This is not a WYSIWYG editor. Rather, it is a WYSIWYM Markdown editor (what you see Is what you mean).
*
*	 _  _  _  _  _  _  _  _  _     _ __ ___   _____ _____ _____  _     ___   ___   _ __ ___  
*	| || || || || || || || || |   | '_ ' _ \ / ___// ___/|__ __||_|   /  _| / _ \ | '_ ' _ \ 
*	| || || || || || || || || | _ | | | | | |\___ \\___ \  | |  | | _ | |_ | |_| || | | | | |
*	|_'__'__/|_'__'__/|_'__'__/|_||_| |_| |_|/____//____/  |_|  |_||_|\___| \___/ |_| |_| |_|
*
**/
var WYSIWYM = new function()
{
	/* Set common variables - Start */
	/* arrays that will carry all about bbcodes and smilies */
	var bbcodes;
	var tokens;
	var tokens_ary;
	var smilies;
	var template;
	/* The phpbb editor element */
	var phpbb_editor = '';
	/* The wysiwym editor element */
	var wysiwym_editor = '';
	/* The wysiwym editor object */
	var wysiwym_preview = 'wysiwym_preview';
	/* Display warnings as an alert? */
	var display_warning = false;
	/* Display code with highlight? */
	var SyntaxHighlight = true;
	/* Array that will carry all warnings messages */
	var warn_msg = [];
	/* Array that will carry all phpbb settings */
	var config = {
	//	'template'				: 'prosilver',
		'template'				: 'subsilver2',
		'Syntax_highlight'		: {W_SYNTAX_HIGHLIGHT},
		'display_warning'		: {W_DISPLAY_WARN},
		'block_height'			: {W_BLOCK_HEIGHT},

		/* User options - Start */
		'viewimg'				: {W_VIEW_IMAGES},
		'viewflash'				: {W_VIEW_FLASH},
		'viewsmilies'			: {W_VIEW_SMILIES},
		/* User options - End */

		/* Config options - Start */
		'bbcode_status'			: {W_BBCODE_STATUS},
		'smilies_status'		: {W_SMILIES_STATUS},
		'img_status'			: {W_BBCODE_IMG},
		'url_status'			: {W_BBCODE_URL},
		'flash_status'			: {W_BBCODE_FLASH},
		'quote_status'			: {W_BBCODE_QUOTE},
		'max_quote_depth'		: {W_MAX_QUOTE_DEPTH},
		/* Config options - End */

		/* Post options - Start */
		'min_post_chars'		: {W_MIN_CHARS_LIMIT},
		'max_post_chars'		: {W_MAX_CHARS_LIMIT},
		'max_post_smilies'		: {W_MAX_SMILIES_LIMIT},
		'max_post_urls'			: {W_MAX_URL_LIMIT},
		'max_post_font_size'	: {W_MAX_FONT_SIZE},
		'max_post_img_height'	: {W_MAX_IMG_HEIGHT},
		'max_post_img_width'	: {W_MAX_IMG_WIDTH}
		/* Post options - End */
	};
	/* Set common variables - End */

	var template = {
		'prosilver' : {
			'error' : {
				'open' : '<p class="error">',
				'close' : '</p>'
			},
			'quote' : {
				'quote_username_open' : '<blockquote><div><cite>{username} {L_WROTE}:</cite>',
				'quote_open' : '<blockquote class="uncited"><div>',
				'quote_close' : '</div></blockquote>'
			},
			'code' : {
				'code_open' : '<div class="codebox"><div>{L_CODE}: <a href="#" onclick="selectCode(this); return false;">{L_SELECT_ALL_CODE}</a></div><code name="code" class="{class}">',
				'code_close' : '</code></div>'
			},
			'attach' : {
				'inline_attachment_open' : '<div class="inline-attachment">',
				'inline_attachment_close' : '</div>'
			}
		},
		'subsilver2' : {
			'error' : {
				'open' : '<span class="genmed error">',
				'close' : '</span>'
			},
			'quote' : {
				'quote_username_open' : '<div class="quotetitle">{username} {L_WROTE}:</div><div class="quotecontent">',
				'quote_open' : '<div class="quotetitle"><b>{L_QUOTE}:</b></div><div class="quotecontent">',
				'quote_close' : '</div>'
			},
			'code' : {
				'code_open' : '<div class="codetitle"><b>{L_CODE}:</b></div><div class="codecontent"><code name="code" class="{class}">',
				'code_close' : '</code></div>'
			},
			'attach' : {
				'inline_attachment_open' : '<div class="attachtitle">{L_ATTACHMENT}:</div><div class="attachcontent">',
				'inline_attachment_close' : '</div>'
			}
		}
	};

	/**
	* Some css on-the-fly
	**/
	wysiwym_addStyle = function()
	{
		if (!document.getElementById('wysiwym_style'))
		{
			var css_def  = "#wysiwym_preview .Show-Hide { float: {S_CONTENT_FLOW_END}; margin: 0 0 0 5px; cursor: pointer; }\n";
				css_def += "#wysiwym_preview .Show-Hide:hover {	color: #ff0000; }\n";
				css_def += "#wysiwym_editor { overflow: auto; height: " + config['block_height'] + "px; padding-{S_CONTENT_FLOW_END}: 2px; }\n";
			/** Style dependance - Start **/
			if (config['template'] == 'prosilver')
			{
				css_def += "#wysiwym_preview .postbody { height: auto; font-size: 99%; }\n";
				css_def += "#wysiwym_editor .codebox { padding: 3px; background-color: #FFFFFF; font-size: 1em; border: 1px solid #d8d8d8; }\n";
				css_def += "#wysiwym_editor .codebox div { font-weight: bold; font-size: 0.8em; text-transform: uppercase; border-bottom: 1px solid #cccccc; margin-bottom: 3px; }\n";
				css_def += "#wysiwym_editor .codebox code { color: #2E8B57; white-space: normal; display: block; font: 0.9em Monaco, 'Andale Mono','Courier New', Courier, mono; overflow: auto; max-height: 200px; padding-top: 5px; margin: 2px 0; }\n";
				css_def += "#wysiwym_editor blockquote div { height: auto; width: 100%; }\n";
				css_def += "#wysiwym_editor .error { font-size: 1em; }\n";
			}
			else if (config['template'] == 'subsilver2')
			{
				css_def += "#wysiwym_preview .postbody { font-size: 1.3em; line-height: 1.4em; font-family: 'Lucida Grande', 'Trebuchet MS', Helvetica, Arial, sans-serif; }\n";
				css_def += "#wysiwym_editor .codetitle { padding: 2px 4px; background-color: #A9B8C2; font-size: 0.8em; border: 1px solid #A9B8C2; }\n";
				css_def += "#wysiwym_editor .codecontent { font-weight: normal; font-size: 0.85em; border: 1px solid #A9B8C2; padding: 5px; background-color: #FAFAFA; }\n";
				css_def += "#wysiwym_editor .codecontent code { color: #006600; white-space: normal; display: block; font-family: Monaco, 'Courier New', monospace; }\n";
				css_def += "#wysiwym_editor .quotetitle { color: #333333; background-color: #A9B8C2; font-size: 0.85em; font-weight: bold; padding: 4px; }\n";
				css_def += "#wysiwym_editor .quotecontent { font-family: 'Lucida Grande', 'Trebuchet MS', Helvetica, Arial, sans-serif;	background-color: #FAFAFA; color: #4B5C77; padding: 5px; font-size: 1em; border-color: #A9B8C2; border-width: 0 1px 1px 1px; border-style: solid; }\n";
			//	css_def += "#wysiwym_editor .error { font-size: 1em; }\n";
			}
			/** Style dependance - End **/

			/** Style SyntaxHighlight - Start **/
			if (config['Syntax_highlight'])
			{
				css_def += "code.php { color: #0000BB !important; }\n";
			}
			/** Style SyntaxHighlight - End **/

			var css_obj = document.createElement('style');
				css_obj.setAttribute("type", "text/css");
				css_obj.setAttribute("id", "wysiwym_style");
			if (css_obj.styleSheet)
			{// IE
				css_obj.styleSheet.cssText = css_def;
			}
			else
			{// the world
				var tt1 = document.createTextNode(css_def);
				css_obj.appendChild(tt1);
			}
			document.getElementsByTagName('head')[0].appendChild(css_obj);
		}
	};

	/**
	* The function trim () PHP (and other languages) to remove spaces at the beginning and end of string. 
	* There is no such function in Javascript, but the following code replace it
	**/
	trim = function(string)
	{
		return string.replace(/^(\s|\n|<br[^>]*>)+/g, '').replace(/(\s|\n|<br[^>]*>)+$/g, '');
	};

	/**
	* Quote regular expression characters plus an optional character
	* Code from : http://phpjs.org/functions/preg_quote:491
	**/
	preg_quote = function(str, bbcode)
	{
		if (bbcode)
		{
			return str.replace(/([\\\.\+\*\?\[\^\]\$\(\)\=\!<>\|\:])/g, '\\$1');
		}
		else
		{
			return str.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!<>\|\:])/g, '\\$1');
		}
	};

	/**
	* Generate a random identifier
	**/
	uniqid = function()
	{
		var newDate = new Date();
		return newDate.getTime();
	};

	/**
	* Determine if a variable exist
	* A function that should work as the isset() in php
	**/
	isset = function(variable_name)
	{
		try 
		{
			if (typeof(eval(variable_name)) != 'undefined')
			{
				if (eval(variable_name) !== null)
				{
					return true;
				}
			}
		}
		catch(e)
		{
			if (typeof(variable_name) != 'undefined' && variable_name !== null)
			{
				return true;
			}
		}
		return false;
	};

	/**
	* Array.indexOf was added in JavaScript 1.6 - not all browsers will have it. Make sure you do things the slow way if it's not present.
	**/
	in_array = function(obj, arr)
	{
		// look down for (!Array.prototype.indexOf)
		if (arr.indexOf !== 'undefined')
		{
			return (arr.indexOf(obj) > -1) ? true : false;
		}
		else
		{
			for (var a=0; a<arr.length; a++)
			{
				if (arr[a] === obj)
				{
					return true;
				}
			}
		}
		return false;
	};

	/**
	* Determine if a checkbox is checked
	**/
	is_checked = function(id)
	{
		if (document.getElementById(id))
		{
			return document.getElementById(id).checked;
		}
		return false;
	};

	/**
	*  HTML Utility Function
	**/
	deEntify = function(string)
	{
		var e2uHash = {'nbsp':'\u00A0[space]','iexcl':'\u00A1','cent':'\u00A2','pound':'\u00A3','curren':'\u00A4','yen':'\u00A5','brvbar':'\u00A6','sect':'\u00A7','uml':'\u00A8','copy':'\u00A9','ordf':'\u00AA','laquo':'\u00AB','not':'\u00AC','shy':'\u00AD','reg':'\u00AE','macr':'\u00AF','deg':'\u00B0','plusmn':'\u00B1','sup2':'\u00B2','sup3':'\u00B3','acute':'\u00B4','micro':'\u00B5','para':'\u00B6','middot':'\u00B7','cedil':'\u00B8','sup1':'\u00B9','ordm':'\u00BA','raquo':'\u00BB','frac14':'\u00BC','frac12':'\u00BD','frac34':'\u00BE','iquest':'\u00BF','Agrave':'\u00C0','Aacute':'\u00C1','Acirc':'\u00C2','Atilde':'\u00C3','Auml':'\u00C4','Aring':'\u00C5','AElig':'\u00C6','Ccedil':'\u00C7','Egrave':'\u00C8','Eacute':'\u00C9','Ecirc':'\u00CA','Euml':'\u00CB','Igrave':'\u00CC','Iacute':'\u00CD','Icirc':'\u00CE','Iuml':'\u00CF','ETH':'\u00D0','Ntilde':'\u00D1','Ograve':'\u00D2','Oacute':'\u00D3','Ocirc':'\u00D4','Otilde':'\u00D5','Ouml':'\u00D6','times':'\u00D7','Oslash':'\u00D8','Ugrave':'\u00D9','Uacute':'\u00DA','Ucirc':'\u00DB','Uuml':'\u00DC','Yacute':'\u00DD','THORN':'\u00DE','szlig':'\u00DF','agrave':'\u00E0','aacute':'\u00E1','acirc':'\u00E2','atilde':'\u00E3','auml':'\u00E4','aring':'\u00E5','aelig':'\u00E6','ccedil':'\u00E7','egrave':'\u00E8','eacute':'\u00E9','ecirc':'\u00EA','euml':'\u00EB','igrave':'\u00EC','iacute':'\u00ED','icirc':'\u00EE','iuml':'\u00EF','eth':'\u00F0','ntilde':'\u00F1','ograve':'\u00F2','oacute':'\u00F3','ocirc':'\u00F4','otilde':'\u00F5','ouml':'\u00F6','divide':'\u00F7','oslash':'\u00F8','ugrave':'\u00F9','uacute':'\u00FA','ucirc':'\u00FB','uuml':'\u00FC','yacute':'\u00FD','thorn':'\u00FE','yuml':'\u00FF','quot':'\u0022','amp':'\u0026','lt':'\u003C','gt':'\u003E','OElig':'','oelig':'\u0153','Scaron':'\u0160','scaron':'\u0161','Yuml':'\u0178','circ':'\u02C6','tilde':'\u02DC','ensp':'\u2002','emsp':'\u2003','thinsp':'\u2009','zwnj':'\u200C','zwj':'\u200D','lrm':'\u200E','rlm':'\u200F','ndash':'\u2013','mdash':'\u2014','lsquo':'\u2018','rsquo':'\u2019','sbquo':'\u201A','ldquo':'\u201C','rdquo':'\u201D','bdquo':'\u201E','dagger':'\u2020','Dagger':'\u2021','permil':'\u2030','lsaquo':'\u2039','rsaquo':'\u203A','euro':'\u20AC','fnof':'\u0192','Alpha':'\u0391','Beta':'\u0392','Gamma':'\u0393','Delta':'\u0394','Epsilon':'\u0395','Zeta':'\u0396','Eta':'\u0397','Theta':'\u0398','Iota':'\u0399','Kappa':'\u039A','Lambda':'\u039B','Mu':'\u039C','Nu':'\u039D','Xi':'\u039E','Omicron':'\u039F','Pi':'\u03A0','Rho':'\u03A1','Sigma':'\u03A3','Tau':'\u03A4','Upsilon':'\u03A5','Phi':'\u03A6','Chi':'\u03A7','Psi':'\u03A8','Omega':'\u03A9','alpha':'\u03B1','beta':'\u03B2','gamma':'\u03B3','delta':'\u03B4','epsilon':'\u03B5','zeta':'\u03B6','eta':'\u03B7','theta':'\u03B8','iota':'\u03B9','kappa':'\u03BA','lambda':'\u03BB','mu':'\u03BC','nu':'\u03BD','xi':'\u03BE','omicron':'\u03BF','pi':'\u03C0','rho':'\u03C1','sigmaf':'\u03C2','sigma':'\u03C3','tau':'\u03C4','upsilon':'\u03C5','phi':'\u03C6','chi':'\u03C7','psi':'\u03C8','omega':'\u03C9','thetasym':'\u03D1','upsih':'\u03D2','piv':'\u03D6','bull':'\u2022','hellip':'\u2026','prime':'\u2032','Prime':'\u2033','oline':'\u203E','frasl':'\u2044','weierp':'\u2118','image':'\u2111','real':'\u211C','trade':'\u2122','alefsym':'\u2135','larr':'\u2190','uarr':'\u2191','rarr':'\u2192','darr':'\u2193','harr':'\u2194','crarr':'\u21B5','lArr':'\u21D0','uArr':'\u21D1','rArr':'\u21D2','dArr':'\u21D3','hArr':'\u21D4','forall':'\u2200','part':'\u2202','exist':'\u2203','empty':'\u2205','nabla':'\u2207','isin':'\u2208','notin':'\u2209','ni':'\u220B','prod':'\u220F','sum':'\u2211','minus':'\u2212','lowast':'\u2217','radic':'\u221A','prop':'\u221D','infin':'\u221E','ang':'\u2220','and':'\u2227','or':'\u2228','cap':'\u2229','cup':'\u222A','int':'\u222B','there4':'\u2234','sim':'\u223C','cong':'\u2245','asymp':'\u2248','ne':'\u2260','equiv':'\u2261','le':'\u2264','ge':'\u2265','sub':'\u2282','sup':'\u2283','nsub':'\u2284','sube':'\u2286','supe':'\u2287','oplus':'\u2295','otimes':'\u2297','perp':'\u22A5','sdot':'\u22C5','lceil':'\u2308','rceil':'\u2309','lfloor':'\u230A','rfloor':'\u230B','lang':'\u2329','rang':'\u232A','loz':'\u25CA','spades':'\u2660','clubs':'\u2663','hearts':'\u2665','diams':'\u2666'};
		var re = /&(\w+?);/;
		while (re.test(string))
		{
		    var m = string.match(re);
		    string = string.replace(re, e2uHash[m[1]]);
		}
		return string;
	};

	/**
	* This function returns a regular expression pattern for commonly used expressions
	* mode can be: url_in_line|www_url_inline|relative_url_inline|email_in_line
	* http://answers.oreilly.com/topic/985-using-regular-expressions-in-php-and-javascript/
	* http://www.regular-expressions.info/refflavors.html
	**/
	get_preg_expression = function(mode)
	{
		
		var string = '';
		switch(mode)
		{
			case 'scheme' :
				return /^[a-z][a-z\d+\-.]*:\/\//i;
			break;
			/* for url bbcode: [url(=var1)]var2[/url] - Start */
			case 'relative_url' :
				return /^({URL_LOCAL})$/i;
			break;
			default :
			case 'url' :
				return /^({URL_FULL})$/i;
			break;
			case 'www_url' :
				return /^({URL_WWW})$/i;
			break;
			/* for url bbcode: [url(=var1)]var2[/url] - End */

			case 'email' : 
				return /^({URL_EMAIL})$/i;
			break;

			/* make_clickable - Start */
			case 'relative_url_inline' :
				return /(^|[\s|\n|\t|\(\.])({MAGIC_URL_LOCAL})/gim;
			break;
			case 'url_in_line' :
				return /(^|[\s|\n|\t|\(\.])({MAGIC_URL_FULL})/gim;
			break;
			case 'www_url_inline' :
				return /(^|[\s|\n|\t|\(])({MAGIC_URL_WWW})/gim;
			break;
			case 'email_in_line' : 
				return /(^|[\s|\n|\t|\(|>])({URL_EMAIL})/gim;
			break;
			/* make_clickable - End */

			/* Parse custom bbcodes - Start */
			case 'token_url_full' : 
				return "({TOKEN_URL_FULL})";
			break;
			case 'token_email' : 
				return "({TOKEN_URL_EMAIL})";
			break;

			/* Parse custom bbcodes - End */
		}
	};

<!-- IF .wysiwym_custom_tags -->
	/**
	* Set a pair of tokens and replacement for custom bbcodes
	* We use lowecase because the template engine
	**/
	phpbb_tokens = function()
	{
		var tokens = {
			'{url}'			: {pattern : get_preg_expression('token_url_full')},
			'{email}'		: {pattern : get_preg_expression('token_email')},
			'{text}'		: {pattern : '((.|\\n)*?)'},
			'{simpletext}'	: {pattern : '([a-zA-Z0-9-+.,_ ]+)'},
			'{inttext}'		: {pattern : '([a-zA-Z0-9\-+,_. ]+)'},
			'{identifier}'	: {pattern : '([a-zA-Z0-9-_]+)'},
			'{color}'		: {pattern : '([a-zA-Z]+|#[0-9abcdefABCDEF]+)'},
			'{number}'		: {pattern : '([0-9]+)'},
			/* Custom replacement - Start */
			'{username}'	: {pattern : '(.*?)'}
			/* Custom replacement - End */
		};
		return tokens;
	};
<!-- ENDIF -->

	/**
	* Build regular expression for custom bbcode
	*	Replace phpb tokens to a valid regexp 
	**/
	Replace_Tokens = function(bbcode, recursive)
	{
		var uniq_id = uniqid();
		var num_token;
		var bbcode_token;
		var token_to_replace;

		if (!isset(tokens))
		{
			tokens = phpbb_tokens();
			tokens_ary = [];
			for (var t in tokens)
			{
				tokens_ary[tokens_ary.length] = t.substring(1, t.length-1);
			}
		}
		var token = new RegExp("\\{(" + tokens_ary.join('|') + ')?(\\d+)?\\}', 'i');

		// Catch the token to replace in this bbcode
		var match = token.exec(bbcode.bbcode_open);

		bbcode_token	 = match[0];
		token_to_replace = '{' + match[1] + '}';
		num_token		 = (match[2]) ? match[2] : 1;

		if (recursive)
		{
			num_token = recursive;
		}

		// Fool the regexp to skip $
		if (tokens[token_to_replace].pattern.indexOf('$') != -1)
		{
			tokens[token_to_replace].pattern = tokens[bbcode_token].pattern.replace(/\$/gim, uniq_id);
		}

		// Replace the token with his pattern
		bbcode.bbcode_open	= bbcode.bbcode_open.replace(bbcode_token, tokens[token_to_replace].pattern);
		bbcode.html_open	= bbcode.html_open.replace(new RegExp(bbcode_token, 'gim'), '$' + num_token);

		// Back to $
		if (bbcode.bbcode_open.indexOf(uniq_id) != -1)
		{
			bbcode.bbcode_open = bbcode.bbcode_open.replace(new RegExp(uniq_id, 'gim'), '$$');
		}

		// Need to run this again ?
		var match = token.exec(bbcode.bbcode_open);
		if (isset(match) && match[1])
		{
			bbcode = Replace_Tokens(bbcode, parseFloat(num_token) + 1);
		}

		return bbcode;
	};

	/**
	* Get core bbcodes and custom bbcodes ( if available )
	*  1=($1) 2=($2) 3=($3) 4=($4) 5=($5) 6=($6) 7=($7) 8=($8) 9=($9) 10=($10)
	*
	*	var toalert = '';
	*	for (var i=0; i<arguments.length; i++)
	*	{
	*		toalert += "argument=("+i+") value=("+arguments[i]+")"+"\n";
	*	}
	*	alert(toalert);
	**/
	bbcode_init = function()
	{
		var BBcode = {
			'code' : {
				clear_open : '[code',
				clear_close : '[/code]',
				bbcode_open : /\[code(?:=([a-z]+))?\]((.|\n)*\[\/code\]+)/gim,
				bbcode_close : '',
				html_open : bbcode_code,
				html_close : ''
			},
			'quote' : {
				clear_open : '[quote',
				clear_close : '[/quote]',
				bbcode_open : /\[quote(?:="(.*?)")?\]+?/gim,
				bbcode_close : /\[\/quote\]+/gim,
				html_open : function bbcode_quote()
				{
					var username = arguments[1];
					if (username != '')
					{
						return template[config['template']]['quote']['quote_username_open'].replace('{username}', username);
					}
						return template[config['template']]['quote']['quote_open'];
				},
				html_close : template[config['template']]['quote']['quote_close']
			},
			'bold' : {
				clear_open : '[b]',
				clear_close : '[/b]',
				bbcode_open : /\[b\]((.|\n)*?)\[\/b\]/gim,
				bbcode_close : '',
				html_open : function bbcode_strong()
				{
					var text = trim(arguments[1]);
					if (text != '')
					{
						return '<strong>' + text + '</strong>';
					}
					return '[b]' + text + '[/b]';
				},
				html_close : ''
			},
			'italic' : {
				clear_open : '[i]',
				clear_close : '[/i]',
				bbcode_open : /\[i\]((.|\n)*?)\[\/i\]/gim,
				bbcode_close : '',
				html_open : function bbcode_italic()
				{
					var text = trim(arguments[1]);
					if (text != '')
					{
						return '<em>' + text + '</em>';
					}
					return '[i]' + text + '[/i]';
				},
				html_close : ''
			},
			'url' : {
				clear_open : '[url]',
				clear_close : '[/url]',
				bbcode_open : /\[url\](.*?)\[\/url\]/gim,
				bbcode_close : '',
				html_open : function()
				{
					var url = arguments[1];
						url = trim(url);
					if (url != '')
					{
						if (get_preg_expression('relative_url').test(url))
						{
							return bbcode_url(url, '', '', '', 'l', '-local');
						}
						else if (get_preg_expression('url').test(url))
						{
							return bbcode_url(url, '', '', '', 'm');
						}
						else if (get_preg_expression('www_url').test(url))
						{
							return bbcode_url(url, '', '', '', 'w');
						}
					}
					return '[url]' + url + '[/url]';
				},
				html_close : ''
			},
			'url_description' : {
				clear_open : '[url=',
				clear_close : '[/url]',
				bbcode_open : /\[url=(.*?)\](.*?)\[\/url\]/gim,
				bbcode_close : '',
				html_open : function()
				{
					var url = arguments[1];
						url = trim(url);
					var text = arguments[2];
						text = trim(text);
					if (url != '' && text != '')
					{
						if (get_preg_expression('relative_url').test(url))
						{
							return bbcode_url(url, text, '', '', 'l', '-local');
						}
						else if (get_preg_expression('url').test(url))
						{
							return bbcode_url(url, text, '', '', 'm');
						}
						else if (get_preg_expression('www_url').test(url))
						{
							return bbcode_url(url, text, '', '', 'w');
						}
					}
					return '[url=' + url + ']' + text + '[/url]';
				},
				html_close : ''
			},
			'email' : {
				clear_open : '[email]',
				clear_close : '[/email]',
				bbcode_open : new RegExp('\\[email\\]' + get_preg_expression('token_email') + '\\[\\/email\\]', 'gim'),
				bbcode_close : '',
				html_open : function()
				{
					var email = arguments[1];
						email = trim(email);
					if (email != '')
					{
						return bbcode_email(email, email, '', '');
					}
					return '[email]' + email + '[/email]';
				},
				html_close : ''
			},
			'email_description' : {
				clear_open : '[email=',
				clear_close : '[/email]',
				bbcode_open : new RegExp('\\[email=' + get_preg_expression('token_email') + '\\]((.|\n)*?)\\[\\/email\\]', 'gim'),
				bbcode_close : '',
				html_open : function()
				{
					var email = arguments[1];
						email = trim(email);
					var text = arguments[2];
						text = trim(text);
					if (email != '' && text != '')
					{
						return bbcode_email(email, text, '', '');
					}
					return '[email=' + email + ']' + text + '[/email]';
				},
				html_close : ''
			},
			'image' : {
				clear_open : '[img]',
				clear_close : '[/img]',
				bbcode_open : /\[img\](.*?)\[\/img\]/gim,
				bbcode_close : '',
				html_open : bbcode_img,
				html_close : ''
			},
			'size' : {
				clear_open : '[size=',
				clear_close : '[/size]',
				bbcode_open : /\[size=(\d+)\]((.|\n)*?)\[\/size\]/gim,
				bbcode_close : '',
				html_open : bbcode_size,
				html_close : ''
			},
			'colour' : {
				clear_open : '[color=',
				clear_close : '[/color]',
				bbcode_open : /\[color=(#([0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]|[0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F])|[a-z\-]+)\]((.|\n)*?)\[\/color\]/gim,
				bbcode_close : '',
				html_open : function bbcode_color()
				{
					var color = trim(arguments[1]);
					var text = trim(arguments[3]);
					if (color != '' && text != '')
					{
						return '<span style="color: ' + color + '">' + text + '</span>';
					}
					return '[color=' + color + ']' + text + '[/color]';
				},
				html_close : ''
			},
			'underline' : {
				clear_open : '[u]',
				clear_close : '[/u]',
				bbcode_open : /\[u\]((.|\n)*?)\[\/u\]/gim,
				bbcode_close : '',
				html_open : function bbcode_underline()
				{
					var text = trim(arguments[1]);
					if (text != '')
					{
						return '<span style="text-decoration: underline">' + text + '</span>';
					}
					return '[u]' + text + '[/u]';
				},
				html_close : ''
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
			'flash' : {
				clear_open : '[flash=',
				clear_close : '[/flash]',
				bbcode_open : /\[flash=(\d+),(\d+)\](.*?)\[\/flash\]/gim,
				bbcode_close : '',
				html_open : bbcode_flash,
				html_close : ''
			},
<!-- IF .wysiwym_custom_tags -->
	<!-- BEGIN wysiwym_custom_tags -->
			'{wysiwym_custom_tags.WBBCODE_NAME}' : {
				clear_open : '[{wysiwym_custom_tags.WBBCODE_TAG}',
				clear_close : '[/{wysiwym_custom_tags.WBBCODE_TAG}]',
				bbcode_open : '{wysiwym_custom_tags.WBBCODE_MATCH}',
				bbcode_close : '',
				html_open : '{wysiwym_custom_tags.WBBCODE_REPLACE}',
				html_close : '',
				custom_tag : true
			},
	<!-- END wysiwym_custom_tags -->
<!-- ENDIF -->
			'attachment' : {
				clear_open : '[attachment=',
				clear_close : '[/attachment]',
				bbcode_open : /\[attachment=(\d+)\](.*?)\[\/attachment\]/gim,
				bbcode_close : '',
				html_open : bbcode_attachment,
				html_close : ''
			}
		};

		/**
		* Replace phpb tokens and build a valid regexp
		**/
		for (var b in BBcode)
		{
			if (isset(BBcode[b].custom_tag))
			{
				BBcode[b].bbcode_open = preg_quote(BBcode[b].bbcode_open, true);
				BBcode[b] = Replace_Tokens(BBcode[b]);
				BBcode[b].bbcode_open = new RegExp(BBcode[b].bbcode_open, 'gim');
			}
		}

		return BBcode;
	};

<!-- IF S_SMILIES_ALLOWED and .smiley -->
	/**
	* Set posting smilies
	*	Not all availables, just the smilies that are displayed in the posting box
	**/
	phpbb_smilies = function()
	{
		var smiley = {
			/* Wrap the smiley with spaces */
	<!-- BEGIN smiley -->
			'{smiley.A_SMILEY_CODE}' : {
				image : '{smiley.SMILEY_IMG}',
				description : '{smiley.SMILEY_DESC}'
			}<!-- IF not smiley.S_LAST_ROW -->,<!-- ENDIF -->
	<!-- END smiley -->
		};
		return smiley;
	};
<!-- ENDIF -->

	/**
	* Parse code tag
	* Expects the argument to start right after the opening [code] tag and to end with [/code]
	**/
	bbcode_code = function()
	{
		var mode = arguments[1];
		var content = arguments[2];
		var code_open = '[code';
		var code_close = '[/code]';

//		// Additionally, magic url parsing should go after parsing bbcodes, but for safety those are stripped out too...
//		$htm_match = get_preg_expression('bbcode_htm');
//		unset($htm_match[4], $htm_match[5]);
//		$htm_replace = array('\1', '\1', '\2', '\1');

		var out = '';
		var code_block = '';
		var pos;
		var pos2;
		var tag_length = 0;
		var open = 1;
		var buffer;

		while (content)
		{
			// Determine position and tag length of next code block
			buffer = content.split( /(^|.*?)(\[code(?:=([a-z]+))?\])((.|\n)*?)/);
			pos = content.indexOf(code_open);
			tag_length = (typeof(buffer[2]) !== 'undefined') ? buffer[2].length : 0;

			// Determine position of ending code tag
			pos2 = content.indexOf(code_close);

			// Which is the next block, ending code or code block
			if (pos > -1 && pos < pos2)
			{
				// Open new block
				if (!open)
				{
					out += content.substring(0, pos);
					content = content.substring(pos);
					mode = (typeof(buffer[3]) !== 'undefined') ? buffer[3] : '';
					code_block = '';
				}
				else
				{
					// Already opened block, just append to the current block
					code_block += content.substring(0, pos) + ((typeof(buffer[2]) !== 'undefined') ? buffer[2] : '');
					content = content.substring(pos);
				}

				content = content.substring(tag_length);
				open++;
			}
			else
			{
				// Close the block
				if (open == 1)
				{
					code_block += content.substring(0, pos2);
//					code_block = preg_replace($htm_match, $htm_replace, code_block);

					// Parse this code block
					out += bbcode_parse_code(mode, code_block);
					code_block = '';
					open--;
				}
				else if (open)
				{
					// Close one open tag... add to the current code block
					code_block += content.substring(0, pos2 + 7);
					open--;
				}
				else
				{
					// end code without opening code... will be always outside code block
					out += content.substring(0, pos2 + 7);
				}

				content = content.substring(pos2 + 7);
			}
		}

		// if now code_block has contents we need to parse the remaining code while removing the last closing tag to match up.
		if (code_block)
		{
			code_block = code_block.substring(0, code_block.length-7);
//			code_block = preg_replace($htm_match, $htm_replace, code_block);

			out += bbcode_parse_code(mode, code_block);
		}

		return out;
	};

	bbcode_parse_code = function(mode, content)
	{
		/* SyntaxHighlighter */
		mode = (mode) ? (config['Syntax_highlight'] ? mode : '') : '';

		/*	'['	to	'&#91;'	and	']'	to	'&#93;'		*/
		if (content.indexOf("[") != -1 || content.indexOf("]") != -1)
		{
			content = content.replace(/\[/g, '&#091;').replace(/\]/g, '&#093;');
		}
		/*	'.'	to	'&#46;'	and	':'	to	'&#058;'	*/
		if (content.indexOf(".") != -1 || content.indexOf(":") != -1)
		{
			content = content.replace(/\./g, '&#046;').replace(/\:/g, '&#058;');
		}
		/* '&nbsp;' to '&amp;nbsp' */
		if (mode && content.indexOf("&nbsp;") != -1)
		{
			content = content.replace(new RegExp("&nbsp;", 'g'), '&amp;nbsp');
		}
		else
		{
			/* Double spaces */
		//	content = content.replace(/ /g, "&nbsp;");
			/* Tabs to 4 spaces */
			content = content.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
		}

		return template[config['template']]['code']['code_open'].replace('{class}', mode) + content + template[config['template']]['code']['code_close'];
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
		if (typeof(type) == 'undefined' || type == '' || type === null)
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
		else if (typeof(type) === 'number')
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

		if (content.indexOf("[*]") != -1)
		{
			content = content.replace(/\[\*\]([^\[]*)?/gim, '<li>$1</li>');
		}

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
	* Parse img tag
	**/
	bbcode_img = function()
	{
		var url = arguments[1];
			url = trim(url);

		if (url != '' && (get_preg_expression('url').test(url) || get_preg_expression('www_url').test(url)))
		{
			url = url.replace(/\s/g, '%20');

			// Try to cope with a common user error... not specifying a protocol but only a subdomain
			// if there is no scheme, then add http schema
			if (!get_preg_expression('scheme').test(url))
			{
				url = 'http://' + url;
			}
			/**
			* Get image dimensions in JS can be slow 
			* this will work for cached images
			**/
			var message;
			var img_error = false;
			var newObjImage = new Image();
				newObjImage.src = url;
			if ((newObjImage.height && config['max_post_img_height']) || (newObjImage.width && config['max_post_img_width']))
			{
				if (newObjImage.height > config['max_post_img_height'])
				{
					message = '{LA_MAX_IMG_HEIGHT_EXCEEDED}'.replace('%1$d', config['max_post_img_height']);
					if (!in_array(message, warn_msg))
					{
						warn_msg[warn_msg.length] = message;
					}
					img_error = true;
				}
				if (newObjImage.width > config['max_post_img_width'])
				{
					message = '{LA_MAX_IMG_WIDTH_EXCEEDED}'.replace('%1$d', config['max_post_img_width']);
					if (!in_array(message, warn_msg))
					{
						warn_msg[warn_msg.length] = message;
					}
					img_error = true;
				}
			}
			if (!img_error)
			{
				if (config['viewimg'])
				{
					return '<img src="' + url + '" alt="{L_IMAGE}" class="resize_me" />';
				}
				else
				{
					return ' <a href="' + url + '" alt=">[ img ]" />[ img ]</a> ';
				}
			}
		}
		return '[img]' + url + '[/img]';
	};

	/**
	* Parse size tag
	**/
	bbcode_size = function()
	{
		var size = parseInt(arguments[1], 10);
		var text = trim(arguments[2]);

		// Do not allow size=0 or empty text
		if (size > 0 && text != '')
		{
			if (config['max_post_font_size'] &&  size > config['max_post_font_size'])
			{
				message = '{LA_MAX_FONT_SIZE_EXCEEDED}'.replace('%1$d', config['max_post_font_size']);
				if (!in_array(message, warn_msg))
				{
					warn_msg[warn_msg.length] = message;
				}
			}
			else
			{
				return '<span style="font-size: ' + size + '%; line-height: 116%;">' + text + '</span>';
			}
		}
		return '[size=' + size + ']' + text + '[/size]';
	};

	/**
	* Parse flash tag
	**/
	bbcode_flash = function()
	{
		var url = arguments[3];
			url = trim(url);
		var width = parseInt(arguments[1], 10);
		var height = parseInt(arguments[2], 10);

		var message;
		var flash_error = false;
		// Do not allow 0-sizes generally being entered
		if (url != '' && width > 0 && height > 0)
		{
			if (config['max_post_img_height'] && height > config['max_post_img_height'])
			{
				message = '{LA_MAX_FLASH_HEIGHT_EXCEEDED}'.replace('%1$d', config['max_post_img_height']);
				if (!in_array(message, warn_msg))
				{
					warn_msg[warn_msg.length] = message;
				}
				flash_error = true;
			}
			if (config['max_post_img_width'] && width > config['max_post_img_width'])
			{
				message = '{LA_MAX_FLASH_WIDTH_EXCEEDED}'.replace('%1$d', config['max_post_img_width']);
				if (!in_array(message, warn_msg))
				{
					warn_msg[warn_msg.length] = message;
				}
				flash_error = true;
			}
			if (!flash_error)
			{
				if (config['viewflash'])
				{
					url = url.replace(/\s/g, '%20');
					return '<object classid="clsid:D27CDB6E-AE6D-11CF-96B8-444553540000" codebase="http://active.macromedia.com/flash2/cabs/swflash.cab#version=5,0,0,0" width="' + width + '" height="' + height + '">' + 
						'<param name="movie" value="' + url + '" />' + 
						'<param name="play" value="false" />' + 
						'<param name="loop" value="false" />' + 
						'<param name="quality" value="high" />' + 
						'<param name="allowScriptAccess" value="never" />' + 
						'<param name="allowNetworking" value="internal" />' + 
						'<embed src="' + url + '" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash" width="' + width + '" height="' + height + '" play="false" loop="false" quality="high" allowscriptaccess="never" allownetworking="internal"></embed>' + 
						'</object>';
				}
				else
				{
					return ' <a href="' + url + '" alt=">[ flash ]" />[ flash ]</a> ';
				}
			}
		}
		return '[flash=' + width + ',' + height + ']' + url + '[/flash]';
	};

	/**
	* Parse attachment bbcode
	**/
	bbcode_attachment = function(full_tag, attach_num, attach_name)
	{
		var html  = '<div class="inline-attachment"><dl class="file" style="height: 1em;">' + 
						'<strong><!-- ia(' + attach_num + ') -->' + attach_name + '<!-- ia(' + attach_num + ') --></strong>' + 
					'</dl></div>';
		/**
		var html  = '<div class="inline-attachment">';
			html += '<dl class="file">' +
						'<dt><a class="postlink" href="' + content + '">' + content + '</a></dt>' +
						'<!-- IF _file.COMMENT --><dd><em>{_file.COMMENT}</em></dd><!-- ENDIF -->' +
						'<dd>({_file.FILESIZE} {_file.SIZE_LANG}) {_file.L_DOWNLOAD_COUNT}</dd>' +
					'</dl>';
			html += '</div>';
		**/
		return html;
	};

	/**
	* parse url
	*
	* Cuts down displayed size of link if over 50 chars, turns absolute links
	* into relative versions when the server/script path matches the link
	**/
	validate_url = function(url, short_url, before)
	{
		var tag			= 'w';
		var css_class	= '';
		var board_url	= '{BOARD_URL}';

		// if there is no scheme, then add http schema
		if (!get_preg_expression('scheme').test(url))
		{
			url = 'http://' + url;
		}

		// built a short description
		short_url = (short_url) ? short_url : url;
		short_url = (short_url.length > 55) ? short_url.substring(0, 39) + ' ... ' + short_url.substring(url.length, short_url.length-10) : short_url;

		// Is this a link to somewhere inside this board?
		if (url.indexOf(board_url) > -1)
		{
			short_url = url.replace(new RegExp(board_url, 'gi'), '');
		}
		return bbcode_url(url, short_url, before, tag, css_class);
	};

	bbcode_url = function(url, short_url, before, tag, css_class)
	{
		var board_url	= '{BOARD_URL}';

		tag = (tag) ? tag : 'w';
		css_class = (css_class) ? css_class : '';
		short_url = (short_url) ? short_url : url;

		// Is this a link to somewhere inside this board?
		if (url.indexOf(board_url) > -1)
		{
			// Remove the session id from the url
			if (url.indexOf('sid=') > 0)
			{
				url = url.replace(/(&|\?)sid=[0-9a-f]{32,}&/gi, '$1');
				url = url.replace(/(&|\?)sid=[0-9a-f]{32,}$/gi, '');
			}
			css_class = '-local';
			tag	  = 'l';
		}

		url = url.replace(/\s/g, '%20');
		short_url = deEntify(short_url);

		return before + '<!-- ' + tag + ' --><a href="' + url + '" class="postlink' + css_class + '">' + short_url + '</a><!-- ' + tag + ' -->';
	};

	/**
	* parse email
	**/
	bbcode_email = function(email, short_email, before)
	{
		short_email = (short_email) ? short_email : email;

		short_email = deEntify(short_email);

		return before + '<!-- e --><a href="mailto:' + email + '">' + short_email + '</a><!-- e -->';
	};

	/**
	* make_clickable function
	* Replace magic urls of form http://xxx.xxx., www.xxx. and xxx@xxx.xxx.
	**/
	make_clickable = function(str)
	{
		/* links - Start */
		// Is this a link to somewhere inside this board?
		var relative_url_inline = get_preg_expression('relative_url_inline');
		if (relative_url_inline.test(str))
		{
			str = str.replace(relative_url_inline, function()
				{
					var before		= (arguments[1] ? arguments[1] : '');
					var full_url	=  arguments[2] + '/' + arguments[3];
					// parse it
					return validate_url(full_url, full_url, before);
				}
			);
		}
		// matches a xxxx://aaaaa.bbb.cccc. ...
		var url_in_line = get_preg_expression('url_in_line');
		if (url_in_line.test(str))
		{
			str = str.replace(url_in_line, function()
				{
					var before		= (arguments[1] ? arguments[1] : '');
					var full_url	=  arguments[2];
					// parse it
					return validate_url(full_url, full_url, before);
				}
			);
		}
		// matches a "www.xxxx.yyyy[/zzzz]" kinda lazy URL thing
		var www_url_inline = get_preg_expression('www_url_inline');
		if (www_url_inline.test(str))
		{
			str = str.replace(www_url_inline, function()
				{
					var before		= (arguments[1] ? arguments[1] : '');
					var full_url	=  arguments[2];
					// parse it
					return validate_url(full_url, full_url, before);
				}
			);
		}
		/* links - End */

		// emails
		var email_in_line = get_preg_expression('email_in_line');
		if (email_in_line.test(str))
		{
			str = str.replace(email_in_line, function()
				{
					var before		= (arguments[1] ? arguments[1] : '');
					var full_email	=  arguments[2];
					// parse it
					return bbcode_email(full_email, full_email, before);
				}
			);
		}

		return str;
	};

	<!-- IF S_SMILIES_ALLOWED and .smiley -->
	/**
	* Parse Smilies
	**/
	parse_smilies = function(content)
	{
		var match = [];
		var replace = [];

		// The smilies array is global 
		for (var smiley in smilies)
		{
			smilie = new RegExp("(^|\\b|\\s|\\n|\\.)(" + preg_quote(smiley) + ")(^|\\b|\\s|\\n|\\.)", 'gim');
			var buffer = content.split(smilie);
			if (buffer[1])
			{
				match[match.length] = new RegExp(preg_quote(smiley), 'g');
				replace[replace.length] = '<!-- s(' + smiley + ') --><img src="' + smilies[smiley].image + '" alt="' + smiley + '" title="' + smilies[smiley].description + '" /><!-- s(' + smiley + ') -->'
			}
		}

		if (match.length)
		{
			// Check number of smilies
			if (config['max_post_smilies'] && match.length > config['max_post_smilies'])
			{
				warn_msg[warn_msg.length] = '{LA_TOO_MANY_SMILIES}'.replace('%d', config['max_post_smilies']);
				return content;
			}

			for (var m=0; m<match.length; m++)
			{
				content = content.replace(match[m], replace[m]);
			}
		}
		return content;
	};
	<!-- ENDIF -->

	/**
	* Main function
	*	Most of the magic happens here
	**/
	bbcode_to_html_parse = function(str, mode)
	{
	//	var box = document.getElementById('wysiwym_editor');
	//	var new_height = parseInt(box.style.height, 10);

		// We surround the post text with spaces, because a smilie can be there or a link for parse_magic_url
		str = ' ' + str + ' ';

		// Do some general 'cleanup' first before processing message,
		str = str.replace(/&(\w+?);/gim, '&amp;$1;');
		str = str.replace(/(script|about|applet|activex|chrome):/gim, "\$1&#058;");

		// Store message length... 
		var message_length = (mode == 'post') ? deEntify(trim(str)).length : deEntify(trim(str.replace(/\[\/?[a-z\*\+\-]+(=[\S]+)?\]/gim, ' '))).length;

		// Maximum message length check. 0 disables this check completely.
		if (config['max_post_chars'] > 0 && message_length > config['max_post_chars'])
		{
			warn_msg[warn_msg.length] = '{LA_TOO_MANY_CHARS_POST}'.replace('%1$d', message_length).replace('%2$d', config['max_post_chars']);
		}

		// Minimum message length check for post only
		if (!message_length || message_length < config['min_post_chars'])
		{
			warn_msg[warn_msg.length] = '{LA_TOO_FEW_CHARS_LIMIT}'.replace('%1$d', message_length).replace('%2$d', config['min_post_chars']);
		}

		/*	'<'	to	'&lt;'	and	'>'	to	'&gt;'	*/
		if (str.indexOf("<") != -1 || str.indexOf(">") != -1)
		{
			str = str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		}

		var have_quote	= (str.indexOf('[quote') > -1 ? true : false);
		var have_list	= (str.indexOf('[list') > -1 ? true : false);
		var have_smilie	= false;

		/** Have the post a possible bbcode? 
		*	and the user want to display it 
		*	and the forum allow use BBCode  - Start **/
		if (str.indexOf('[') > -1 && !is_checked('disable_bbcode') && config['bbcode_status'])
		{
			var bbcode_start;
			var bbcode_end;

			// The bbcodes array is global 
			for (var bb in bbcodes)
			{
				// Have this bbcode (open or close tag)?
				bbcode_start = (isset(bbcodes[bb].bbcode_open)) ? str.indexOf(bbcodes[bb].clear_open) > -1 : false;
				bbcode_end = (isset(bbcodes[bb].bbcode_close)) ? str.indexOf(bbcodes[bb].clear_close) > -1 : (bbcode_start) ? true : false;
				if (bbcode_start && bbcode_end)
				{
					/* the forum allow use this BBCode? - Start */
					if ((bb == 'quote' && !config['quote_status']) ||
						(bb == 'url' && !config['url_status']) || (bb == 'url_description' && !config['url_status']) || 
						(bb == 'email' && !config['url_status']) || (bb == 'email_description' && !config['url_status']) || 
						(bb == 'image' && !config['img_status']) || (bb == 'flash' && !config['flash_status']))
					{
						message = '{LA_UNAUTHORISED_BBCODE}'.replace('%s', bbcodes[bb].clear_open.replace("=", ']'));
						if (!in_array(message, warn_msg))
						{
							warn_msg[warn_msg.length] = message;
						}
						break; //continue;						
					}
					/* the forum allow use this BBCode? - Start */

					// Replace the bbcode open with his corresponding open html
					str = str.replace(bbcodes[bb].bbcode_open, bbcodes[bb].html_open);

					// Replace the bbcode close with his corresponding close html
					if (bbcodes[bb].bbcode_close != '')
					{
						str = str.replace(bbcodes[bb].bbcode_close, bbcodes[bb].html_close);
					}
				}
			}

			/* Lists have too much "carriage return" - Start */
			if (have_list)
			{
				str = str.replace(/<(ol|ul)([^>]+)>\n+/gim, "<$1>");
				str = str.replace(/<\/(ol|ul)>\n+/gim, "</$1>");
				str = str.replace(/<li>\n+/gim, "<li>");
				str = str.replace(/\n+<\/li>/gim, "</li>");
			}
			/* Lists have too much "carriage return" - End */
		}
		/** Have the post a possible bbcode ? - End **/

		<!-- IF S_SMILIES_ALLOWED and .smiley -->
		/* Parse posting smilies?
		*	and the user want to display it 
		*	and the forum allow use BBCode  - Start **/
		if (config['viewsmilies'] && !is_checked('disable_smilies') && config['smilies_status'])
		{
			str = parse_smilies(str);
		}
		/* Parse posting smilies - End */
		<!-- ENDIF -->

		/* Check for max_quote_depth - Start */
		if (have_quote && config['max_quote_depth'] > 0)
		{
			bbcode_quote_depth(str, config['max_quote_depth']);
		}
		/* Check for max_quote_depth - End */

		/* Do not automatically parse URLs - Start */
		if (!is_checked('disable_magic_url'))
		{
			str = make_clickable(str);
		}
		/* Do not automatically parse URLs - End */

		/* Check number of links - Start */
		if (config['max_post_urls'])
		{
			/**
			*	l=local
			*	m=
			*	w=web
			*	e=emails
			**/
			var num_matches = str.match(/<\!-- ([lmwe]) -->.*?<\!-- \1 -->/gim);
			if (num_matches !== null && num_matches.length > config['max_post_urls'])
			{
				warn_msg[warn_msg.length] = '{LA_TOO_MANY_URLS}'.replace('%d', config['max_post_urls']);
			}
		}
		/* Check number of links - End */

		/* convert CRLF to <br> */
		str = str.replace(/\n/g, "<br />");

		/* Display errors if we have - Start */
		if (warn_msg.length)
		{
			if (config['display_warning'])
			{
				alert(warn_msg.join("\n"));
			}
			else
			{
				str = template[config['template']]['error']['open'] + warn_msg.join("<br />") + template[config['template']]['error']['close'];
			}
			warn_msg = [];
		}
		/* Display errors if we have - Start */

		// remove excessive spaces and newlines(?) and finally display the post
		return trim(str);
	};

	/*
	* Check for max_quote_depth
	*/
	bbcode_quote_depth = function(str, max_quote_depth)
	{
		var quote_html_open = '<blockquote';
		var quote_html_close = '</blockquote>';
		var quote_count = str.split(quote_html_close).length - 1;

		if (max_quote_depth > 0 && quote_count > max_quote_depth)
		{
			var quote_start = 0;
			var quote_end = 0;
			for (var q = 0, str_length = str.length; q < str_length; q++)
			{
				quote_start = str.indexOf(quote_html_open, q);
				quote_end = str.indexOf(quote_html_close, q);
				if (quote_start > -1 && quote_end > quote_start)
				{
					str_quote = str.substring(quote_start, quote_end + quote_html_close.length);
					quote_count = str_quote.split(quote_html_open).length - 1;

					// there are too many nested quotes
					if (max_quote_depth > 0 && quote_count > max_quote_depth)
					{
						warn_msg[warn_msg.length] = '{LA_QUOTE_DEPTH_EXCEEDED}'.replace('%1$d', max_quote_depth);
						break;
					}
					q = quote_start;
				}
				else
				{
					q += quote_html_close.length;
				}
			}
		}
	};

	/**
	* Update the preview
	**/
	Update = function(e)
	{
	//	e = e || window.event; // for IE
		// Run this only if the preview is visible ;)
		if (document.getElementById(wysiwym_preview).style.display != 'none')
		{
			var the_text = bbcode_to_html_parse(phpbb_editor.value, 'post');

			wysiwym_editor.innerHTML = the_text;

			if (config['Syntax_highlight'])
			{
				SyntaxHighlighter.highlightDocument(false);
			}
			/* I bet that someone wat to display tabs inside the code bbcode */
		//	wysiwym_editor.innerHTML = wysiwym_editor.innerHTML.replace(/&nbsp;&nbsp;&nbsp;&nbsp;/g, "\t");
		}
	};

	/**
	* Set some default variables and hide the preview
	**/
	Start = function()
	{
		phpbb_editor = document.forms[form_name].elements[text_name];
		phpbb_editor.onkeyup = function() { Update(); return false; };
		wysiwym_editor = document.getElementById('wysiwym_editor');
		// Some css on-the-fly
		wysiwym_addStyle();
		// Fill the bbcodes array
		bbcodes = bbcode_init();
		// Fill the smilies array
		smilies = phpbb_smilies();
		// hide the preview
		toggle_wysiwym(wysiwym_preview);

	};

	this.Start = Start;
	this.Update = Update;
};

/**
* Set display of page element
* ID = element id 
**/
function dE_wysiwym(ID)
{
	toggle_wysiwym(ID);
	if (document.getElementById(ID).style.display != 'none')
	{
		WYSIWYM.Update();
	}
	return true;
}

function wysiwym_resize(id, pix)
{
	var box = document.getElementById(id);
	var new_height = (parseInt(box.style.height, 10) ? parseInt(box.style.height, 10) : 200) + pix;

	if (new_height > 0)
	{
		box.style.height = new_height + 'px';
	}
	return false;
}

/* IE doesn't understand indexOf() on arrays, so add it */
if (!Array.prototype.indexOf)
{
	Array.prototype.indexOf = function(val)
	{
		var len = this.length;
		for (var i = 0; i < len; i++)
		{
			if (this[i] == val) { return i; }
		}
		return -1;
	};
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

/**
* Javascript Syntax Highlighter
* Highlights many different programming languages
* Outputs valid XHTML, so can be used in XHTML pages!
* Written by: Michiel van Eerd
*    code from : http://www.webessence.nl/projects/syntax-highlighter/
*    re-written by leviatan21 to fit phpbb requirements
**/
var SyntaxHighlighter = {};
SyntaxHighlighter.xmlEntities = { "&" : "&amp;", "<" : "&lt;", ">" : "&gt;", "\"" : "&quot;", "'" : "&#39;" };
SyntaxHighlighter.language = {
	'comment' : { open : '<span class="syntaxcomment">', close : '</span>' },
	'keyword' : { open : '<span class="syntaxkeyword">', close : '</span>' },
	'operator': { open : '<span class="syntaxkeyword">', close : '</span>' },
	'quote'	: { open : '<span class="syntaxstring">', close : '</span>' },
	'php' : {
		"comment" : { "single" : { "start" : "//" }, "multi" : { "start" : "/*", "end" : "*/" } },
		"operator" : [ "(", ")", "{", "}", "<", ">", "[", "]", "+", "-", "=", "!", "?", "&", ";", ".", ",", "%", "/" ],
		"keyword" : [ "abstract", "array", "as", "bool", "boolean", "break", "case", "catch", "class", "clone", "const", "continue", "declare", "default", "define", "do", "echo", "else", "elseif", "empty", "exit", "extends", "final", "for", "foreach", "function", "if", "implements", "include", "include_once", "int", "interface", "isset", "list", "new", "null", "object", "print", "private", "protected", "public", "require", "require_once", "return", "static", "string", "switch", "throw", "try", "unset", "while", "global" ]
	}
};
SyntaxHighlighter.uniqid = function()
{
	var newDate = new Date();
	return newDate.getTime();
};
SyntaxHighlighter.strToXHTML = function(str)
{
	var addLen = 0;

	for (var key in SyntaxHighlighter.xmlEntities)
	{
		str = str.replace(new RegExp(key, "g"), function(match, offset, s)
			{
				addLen += (SyntaxHighlighter.xmlEntities[key].length - 1);
				return SyntaxHighlighter.xmlEntities[key];
			}
		);
	}
	return { "str" : str, "addLen" : addLen };
};
SyntaxHighlighter.copyObject = function(ob)
{
	var newOb = {};
	for (var prop in ob)
	{
		newOb[prop] = ob[prop];
	}
	return newOb;
};
SyntaxHighlighter.highlightDocument = function(showLineNumbers)
{
	var codeList = document.getElementsByTagName("code");
	for (var i = 0, len = codeList.length; i < len; i++)
	{
		if (codeList[i].className && SyntaxHighlighter.language[codeList[i].className])
		{
			SyntaxHighlighter.highlight(codeList[i], showLineNumbers);
		}
	}
};
SyntaxHighlighter.highlight = function(codeEl, showLineNumbers)
{
	var lang = SyntaxHighlighter.language[codeEl.className];
	if (!lang)
	{
		return;
	}

	var beginMultiCommentIndex = -1;
	var uniq_id = SyntaxHighlighter.uniqid();

	var comment_len = (SyntaxHighlighter.language.comment.open + SyntaxHighlighter.language.comment.close).length;
	var comment_open = SyntaxHighlighter.language.comment.open;
	var comment_close = SyntaxHighlighter.language.comment.close;

	var operator_len = (SyntaxHighlighter.language.operator.open + SyntaxHighlighter.language.operator.close).length;
	var operator_open = SyntaxHighlighter.language.operator.open;
	var operator_close = SyntaxHighlighter.language.operator.close;

	var keyword_len = (SyntaxHighlighter.language.keyword.open + SyntaxHighlighter.language.keyword.close).length;
	var keyword_open = SyntaxHighlighter.language.keyword.open;
	var keyword_close = SyntaxHighlighter.language.keyword.close;

	// With \n or \r\n as line break
	// data rewrites HTML entities to real characters
	codeEl.normalize(); // In FF long pieces of text (> 4096 characters) often spread over multiple text nodes

	var lines = [];

	var node_length = codeEl.childNodes.length;
	// Als er na de normalize nog meerder childNodes zijn, dan ga ik ervan uit dat men als linebreak <br> heeft
	// en NIET \n of \r.
	if (node_length > 1)
	{
		// With BR as a rule break, You may only add a blank line at the second time in a row no data (ie <br><br> in the code).
		var hasBr = false;
		for (var i = 0; i < codeEl.childNodes.length; i++)
		{		
			if (!codeEl.childNodes[i].data)
			{
				if (hasBr)
				{
					lines.push("");
					hasBr = false;
				}
				else
				{
					hasBr = true;
				}
			}
			else
			{
				lines.push(codeEl.childNodes[i].data);
				hasBr = false;
			}
		}
	}
	else if (node_length == 1)
	{
		// It seems to have \n, and \r as line break
		var str = codeEl.firstChild.data;
		lines = (str.indexOf("\n") != -1) ? str.split("\n") : str.split("\r"); // FF or IE
	}
	else
	{
		return;
	}

	forLineLoop:
	for (var lineIndex = 0, lineCount = lines.length; lineIndex < lineCount; lineIndex++)
	{
		var line = lines[lineIndex];

		// Fool the regexp to skip tranform " into &quot; and then into &ampquot;
		if (line.indexOf('"') != -1)
		{
			line = line.replace(/\"/g, uniq_id);
		}

		var prop = {};
		forCharLoop:

		for (var charIndex = 0, lineLen = line.length; charIndex < lineLen; charIndex++)
		{
			var c = line.charAt(charIndex);

			// End multiline comment
			if (beginMultiCommentIndex != -1)
			{
				var endMultiCommentIndex = -1;
				for (; charIndex < lineLen; charIndex++)
				{
					c = line.charAt(charIndex);
					if (c == "\\")
					{
						charIndex++;
						continue;
					}
					if (c == lang.comment.multi.end.charAt(0))
					{
						endMultiCommentIndex = charIndex;
						for (var i = 0; i < lang.comment.multi.end.length; i++)
						{
							if (line.charAt(charIndex + i) != lang.comment.multi.end.charAt(i))
							{
								endMultiCommentIndex = -1;
								break;
							}
						}
						if (endMultiCommentIndex != -1)
						{
							charIndex += (lang.comment.multi.end.length - 1);
							endMultiCommentIndex = charIndex;
							break;
						}
					}
				}
				var realEndIndex = (endMultiCommentIndex != -1) ? endMultiCommentIndex : lineLen - 1;
				var substrOb = SyntaxHighlighter.strToXHTML(line.substr(beginMultiCommentIndex, realEndIndex - beginMultiCommentIndex + 1));
				line = line.substr(0, beginMultiCommentIndex) + comment_open + substrOb.str + comment_close + line.substr(realEndIndex + 1);
				charIndex += (comment_len + substrOb.addLen);
				lineLen += (comment_len + substrOb.addLen);
				prop[beginMultiCommentIndex] = comment_len + substrOb.str.length;
				beginMultiCommentIndex = (endMultiCommentIndex != -1) ? -1 : 0;
				continue forCharLoop;
			}

			// Begin multiline comment
			if (lang.comment.multi && c == lang.comment.multi.start.charAt(0))
			{
				beginMultiCommentIndex = charIndex;
				for (var i = 0; i < lang.comment.multi.start.length; i++)
				{
					if (line.charAt(charIndex + i) != lang.comment.multi.start.charAt(i))
					{
						beginMultiCommentIndex = -1;
						break;
					}
				}
				if (beginMultiCommentIndex != -1)
				{
					charIndex += lang.comment.multi.start.length - 1;
					if (charIndex == lineLen - 1)
					{
						charIndex--;
					}
					continue forCharLoop;
				}
			}

			// Single comment
			if (lang.comment.single && c == lang.comment.single.start.charAt(0))
			{
				var beginSingleCommentIndex = charIndex;
				for (var i = 0; i < lang.comment.single.start.length; i++)
				{
					if (line.charAt(charIndex + i) != lang.comment.single.start.charAt(i))
					{
						beginSingleCommentIndex = -1;
						break;
					}
				}
				if (beginSingleCommentIndex != -1)
				{
					var substrOb2 = SyntaxHighlighter.strToXHTML(line.substr(beginSingleCommentIndex));
					line = line.substr(0, beginSingleCommentIndex) + comment_open + substrOb2.str + comment_close;
					charIndex = line.length - 1;
					prop[beginSingleCommentIndex] = comment_len + substrOb2.str.length;
					continue forCharLoop;
				}
			}

			// Operators
			if (lang.operator.indexOf(c) != -1)
			{
				c = (SyntaxHighlighter.xmlEntities[c]) ? SyntaxHighlighter.xmlEntities[c] : c;
				var addLen = operator_len + (c.length - 1);
				line = line.substr(0, charIndex) + operator_open + c + operator_close + line.substr(charIndex + 1);
				prop[charIndex] = addLen + c.length;
				charIndex += addLen;
				lineLen += addLen;
				continue forCharLoop;
			}
		}

		// Keywords - not for each char, but each line
		for (var i = 0; i < lang.keyword.length; i++)
		{
			var keyword = lang.keyword[i];
			var keywordIndex = line.indexOf(keyword);
			while (keywordIndex != -1)
			{
				if (/\w/.test(line.charAt(keywordIndex - 1)) || /\w/.test(line.charAt(keywordIndex + keyword.length)))
				{
					keywordIndex = line.indexOf(keyword, keywordIndex + 1);
					continue;
				}

				var isKeyword = true;
				for (var key in prop)
				{
					if (keywordIndex >= parseInt(key, 10) && keywordIndex < (parseInt(key, 10) + parseInt(prop[key], 10)))
					{
						isKeyword = false;
						break;
					}
				}
				if (isKeyword)
				{
					line = line.substr(0, keywordIndex) + keyword_open + keyword + keyword_close + line.substr(keywordIndex + keyword.length);
					prop[keywordIndex] = keyword.length + keyword_len;
					var tmpOb = new Object();
					for (var key in prop)
					{
						if (parseInt(key, 10) > keywordIndex)
						{
							var newIndex = parseInt(key, 10) + keyword_len;
							tmpOb[newIndex] = prop[key];
						}
						else
						{
							tmpOb[key] = prop[key];
						}
					}
					prop = SyntaxHighlighter.copyObject(tmpOb);
					keywordIndex = line.indexOf(keyword, keywordIndex + keyword_len + keyword.length);
				}
				else
				{
					keywordIndex = line.indexOf(keyword, keywordIndex + 1);
				}
			}
		}
		lines[lineIndex] = line;
	}

	// Print the lines
	var inner = lines.join('\n');

	// back to "
	if (inner.indexOf(uniq_id) != -1)
	{
		inner = inner.replace(new RegExp(uniq_id, 'gim'), '&quot;');
	}

	// Quotes
	inner = inner.replace(/(\'|&quot;)((.|\n)*?)(\'|&quot;)/gim, function(match)
		{
			match = match.replace(/<span(?:[^>]+)>(.*?)<\/span>/gim, '$1');
			match = match.replace(/(\'|&quot;)((.|\n)*?)(\'|&quot;)/gim, SyntaxHighlighter.language.quote.open + '$1$2$1' + SyntaxHighlighter.language.quote.close);
			return match;
		}
	);

	codeEl.innerHTML = '<pre>' + inner + '</pre>';
};
