<?php
/**
* @package: phpBB 3.0.7-PL1 :: WYSIWYM Markdown editor -> root/includes
* @version: $Id: functions_posting_wysiwym.php, [BETA] 1.0.1-PL1 2010/07/04 10:07:04 leviatan21 Exp $
* @copyright: (c) 2010 leviatan21 < info@mssti.com > (Gabriel) http://www.mssti.com/phpbb3/
* @license: http://opensource.org/licenses/gpl-license.php GNU Public License
* @author: leviatan21 - http://www.phpbb.com/community/memberlist.php?mode=viewprofile&u=345763
**/

/**
* @ignore
**/
if (!defined('IN_PHPBB'))
{
	exit;
}
define('IN_WYSIWYM', true);

/**
* Load MOD files and the MOD itself
* And fill bbcodes, smilies ands attach data
**/
function setup_wysiwym_editor()
{
	global $db, $mode;

	// For the moment, we only use the wysiwym editor for posting, signature and private messages
	if (in_array($mode, array('post', 'edit', 'reply', 'quote', 'signature', 'compose')))
	{
		$wmode = $mode;
	}
	else
	{
		// We need a do a trick here, because Compose PM can be accesed as a module instead as a mode
		// like ucp.php?i=174
		$module_id = request_var('i', '');
		if (is_numeric($module_id))
		{
			$sql = 'SELECT module_id FROM ' . MODULES_TABLE . "
					WHERE module_langname = 'UCP_PM'";
			$result = $db->sql_query($sql);
			$row = $db->sql_fetchrow($result);
			$db->sql_freeresult($result);

			if ($row && (int) $row['module_id'] == (int) $module_id)
			{
				$wmode = 'compose';
			}
			unset($result, $row);
		}
		else
		{
			return;
		}
	}

	global $template, $user, $auth;
	global $config, $forum_id;
	
	// Set basic bbcode status
	// and some maximun and minimun values

	$forum_id = isset($forum_id) ? $forum_id : 0;

	switch ($wmode)
	{
		case 'post':
		case 'edit':
		case 'reply':
		case 'quote':
			$bbcode_status	= ($config['allow_bbcode'] && $auth->acl_get('f_bbcode', $forum_id)) ? true : false;
			$smilies_status	= ($config['allow_smilies'] && $auth->acl_get('f_smilies', $forum_id)) ? true : false;
			$url_status		= ($config['allow_post_links']) ? true : false;
			$img_status		= ($bbcode_status && $auth->acl_get('f_img', $forum_id)) ? true : false;
			$flash_status	= ($bbcode_status && $auth->acl_get('f_flash', $forum_id) && $config['allow_post_flash']) ? true : false;
			$quote_status	= true;

			$wmode = 'post';
			$w_min_chars		= (int) $config['min_post_chars'];
			$w_max_chars		= (int) $config['max_post_chars'];
			$w_max_smilies		= (int) $config['max_post_smilies'];
			$w_max_urls			= (int) $config['max_post_urls'];
			$w_max_font_size	= (int) $config['max_post_font_size'];
			$w_max_img_height	= (int) $config['max_post_img_height'];
			$w_max_img_width	= (int) $config['max_post_img_width'];
		break;

		case 'signature':
			$bbcode_status	= ($config['allow_sig_bbcode']) ? (bool) $user->optionget('sig_bbcode') : false;
			$smilies_status	= ($config['allow_sig_smilies']) ? (bool) $user->optionget('sig_smilies') : false;
			$url_status		= ($config['allow_sig_links']) ? (bool) $user->optionget('sig_links') : false;
			$img_status		= ($config['allow_sig_img']) ? true : false;
			$flash_status	= ($config['allow_sig_flash']) ? true : false;
			$quote_status	= true;

			$wmode = 'sig';
			$w_min_chars		= 0;
			$w_max_chars		= (int) $config['max_sig_chars'];
			$w_max_smilies		= (int) $config['max_sig_smilies'];
			$w_max_urls			= (int) $config['max_sig_urls'];
			$w_max_font_size	= (int) $config['max_sig_font_size'];
			$w_max_img_height	= (int) $config['max_sig_img_height'];
			$w_max_img_width	= (int) $config['max_sig_img_width'];
			$user->add_lang('viewtopic');
		break;

		case 'compose':
			$bbcode_status	= ($config['allow_bbcode'] && $config['auth_bbcode_pm'] && $auth->acl_get('u_pm_bbcode')) ? true : false;
			$smilies_status	= ($config['allow_smilies'] && $config['auth_smilies_pm'] && $auth->acl_get('u_pm_smilies')) ? true : false;
			$url_status		= ($config['allow_post_links']) ? true : false;
			$img_status		= ($config['auth_img_pm'] && $auth->acl_get('u_pm_img')) ? true : false;
			$flash_status	= ($config['auth_flash_pm'] && $auth->acl_get('u_pm_flash')) ? true : false;
			$quote_status	= true;
			// Same as posting?
			$wmode = 'post';
			$w_min_chars		= (int) $config['min_post_chars'];
			$w_max_chars		= (int) $config['max_post_chars'];
			$w_max_smilies		= (int) $config['max_post_smilies'];
			$w_max_urls			= (int) $config['max_post_urls'];
			$w_max_font_size	= (int) $config['max_post_font_size'];
			$w_max_img_height	= (int) $config['max_post_img_height'];
			$w_max_img_width	= (int) $config['max_post_img_width'];
		break;

		default:
			return;
		break;
	}

	// allow use smilies ?
	if ($smilies_status)
	{
		setup_wysiwym_smilies();
	}

	// Use Attachment ?
	$attach_allowed = setup_wysiwym_attach($mode, $forum_id);

	$user_signature = '';
	// Add the signature ?
	if ($user->data['user_sig'] && $config['allow_sig'] && $user->optionget('viewsigs'))
	{
		$user_sig = $user->data['user_sig'];
		$user_sig_bbcode_uid = (!empty($user->data['user_sig_bbcode_uid'])) ? $user->data['user_sig_bbcode_uid'] : '';
		$user_sig_bbcode_bitfield = (!empty($user->data['user_sig_bbcode_bitfield'])) ? $user->data['user_sig_bbcode_bitfield'] : '';
		$user_sig_options = (($config['allow_sig_bbcode']) ? OPTION_FLAG_BBCODE : 0) + (($config['allow_sig_smilies']) ? OPTION_FLAG_SMILIES : 0) + (($config['allow_sig_links']) ? OPTION_FLAG_LINKS : 0);
		$user_signature = generate_text_for_display($user_sig, $user_sig_bbcode_uid, $user_sig_bbcode_bitfield, $user_sig_options);
	}

	$template->assign_vars(array(
		'S_LIVE_REVIEW'			=> (isset($config['wysiwym_enable'])) ? $config['wysiwym_enable'] : true,
		'W_SYNTAX_HIGHLIGHT'	=> (isset($config['wysiwym_syntax_highlight'])) ? $config['wysiwym_syntax_highlight'] : 1,
		'W_DISPLAY_WARN'		=> (isset($config['wysiwym_display_warning'])) ? $config['wysiwym_display_warning'] : 0,
		'W_BLOCK_HEIGHT'		=> (isset($config['wysiwym_height'])) ? $config['wysiwym_height'] : 300,
		'W_MAX_QUOTE_DEPTH'		=> (int) $config['max_quote_depth'],
		'W_SIGNATURE'			=> $user_signature,
		// Max and Min values
		'W_MIN_CHARS_LIMIT'		=> $w_min_chars,
		'W_MAX_CHARS_LIMIT'		=> $w_max_chars,
		'W_MAX_SMILIES_LIMIT'	=> $w_max_smilies,
		'W_MAX_URL_LIMIT'		=> $w_max_urls,
		'W_MAX_FONT_SIZE'		=> $w_max_font_size,
		'W_MAX_IMG_HEIGHT'		=> $w_max_img_height,
		'W_MAX_IMG_WIDTH'		=> $w_max_img_width,
		'L_TOOMANYCHARS'		=> (isset($user->lang['TOO_MANY_CHARS_' . strtoupper($wmode)])) ? $user->lang['TOO_MANY_CHARS_' . strtoupper($wmode)] : $user->lang['TOO_MANY_CHARS'] ,

		'W_VIEW_IMAGES'			=> ($user->optionget('viewimg')) ? 1 : 0,
		'W_VIEW_FLASH'			=> ($user->optionget('viewflash')) ? 1 : 0,
		'W_VIEW_SMILIES'		=> ($user->optionget('viewsmilies')) ? 1 : 0,

		'W_BBCODE_STATUS'		=> ($bbcode_status) ? 1 : 0,
		'W_SMILIES_STATUS'		=> ($smilies_status) ? 1 : 0,
		'W_BBCODE_IMG'			=> ($img_status) ? 1 : 0,
		'W_BBCODE_URL'			=> ($url_status) ? 1 : 0,
		'W_BBCODE_FLASH'		=> ($flash_status) ? 1 : 0,
		'W_BBCODE_QUOTE'		=> ($quote_status) ? 1 : 0,
		'W_BBCODE_ATTACH'		=> ($attach_allowed) ? 1 : 0,
	));

	/**
	* Set all custom bbcodes to the live preview
	* 	not only for those bbcodes that my be displayed as buttons
	**/
	if ($bbcode_status)
	{
		$sql = 'SELECT bbcode_tag, bbcode_match, bbcode_tpl
			FROM ' . BBCODES_TABLE . '
			ORDER BY bbcode_tag';
		$result = $db->sql_query($sql);

		while ($row = $db->sql_fetchrow($result))
		{
			$template->assign_block_vars('wysiwym_custom_tags', array(
				'WBBCODE_NAME'		=> strtolower($row['bbcode_tag']),
				'WBBCODE_TAG'		=> preg_replace('(=(.*?)?)', '', strtolower($row['bbcode_tag'])),
				'WBBCODE_MATCH'		=> strtolower($row['bbcode_match']),
				'WBBCODE_REPLACE'	=> str_replace(array ("\n", "\r", "\t"), array ("", "", ""), strtolower($row['bbcode_tpl'])),
			));
		}

		$db->sql_freeresult($result);

		/* Transform php regexp into JavaScript regexp - Start */
		$server_url = generate_board_url();
		$wmatch = array('\n', '\t', '/', '+|&amp;)+');
		$wreplace = array("\\n", "\\t", "\/", ')');
	
		$template->assign_vars(array(
			// relative urls for this board
			'URL_LOCAL'				=> str_replace($wmatch, $wreplace, preg_quote($server_url, '#') . ')/(' . get_preg_expression('relative_url')),
			'MAGIC_URL_LOCAL'		=> str_replace($wmatch, $wreplace, preg_quote($server_url, '#') . ')/(' . get_preg_expression('relative_url_inline')),
			// matches a xxxx://aaaaa.bbb.cccc. ...
			'URL_FULL'				=> str_replace($wmatch, $wreplace, get_preg_expression('url')),
			'MAGIC_URL_FULL'		=> str_replace($wmatch, $wreplace, get_preg_expression('url_inline')),
			// matches a "www.xxxx.yyyy[/zzzz]" kinda lazy URL thing
			'URL_WWW'				=> str_replace($wmatch, $wreplace, get_preg_expression('www_url')),
			'MAGIC_URL_WWW'			=> str_replace($wmatch, $wreplace, get_preg_expression('www_url_inline')),
			// matches an email@domain type address at the start of a line, or after a space or after what might be a BBCode.
			'URL_EMAIL'				=> str_replace($wmatch, $wreplace, get_preg_expression('email')),
			// Parse custom bbcodes
			'TOKEN_URL_EMAIL'		=> str_replace("\\", '\\\\', str_replace($wmatch, $wreplace, get_preg_expression('email'))),
			'TOKEN_URL_FULL'		=> str_replace("\\", '\\\\', str_replace($wmatch, $wreplace, get_preg_expression('url'))),
		));
		/* Transform php regexp into JavaScript regexp - End */
	}

}

/**
* Set some attach extensions
*
* @param string		$mode
* @param int		$forum_id
**/
function setup_wysiwym_attach($mode = 'post', $forum_id = 0)
{
	global $auth, $cache;
	global $config;

	switch ($mode)
	{
		case 'post':
		case 'edit':
		case 'reply':
		case 'quote':
			$allowed = ($auth->acl_get('u_attach') && $config['allow_attachments']) ? true : false;
		break;

		default:
		case 'signature':
			$allowed = false;
		break;

		case 'compose':
			$allowed = ($auth->acl_get('u_pm_attach') && $config['allow_pm_attach']) ? true : false;
		break;
	}

	if ($allowed)
	{
		global $template, $user;
		global $phpbb_root_path, $phpEx;

		$extensions = $cache->obtain_attach_extensions($forum_id);

		foreach ($extensions as $extension => $data)
		{
			if (isset($data['allow_group']) && $data['allow_group'])
			{
				$template->assign_block_vars('wysiwym_attach_extensions', array(
					'EXTENSION'	=> $extension,
					'CATEGORY'	=> $data['display_cat'],
				));
			}
		}

		$template->assign_vars(array(
			'W_ATTACH_ICON_IMG'		=> $user->img('icon_topic_attach', ''),
			'W_ATTACH_U_FILE'		=> append_sid($phpbb_root_path . 'download/file.' . $phpEx, 'mode=view&amp;id=%1$d'),
		));

		unset($extensions);
	}
	return $allowed;
}

/**
* Fill smiley templates (or just the variables) with smilies
* Not only those marked as display_on_posting
**/
function setup_wysiwym_smilies()
{
	global $db;

	// Due to restrictions in Javascript's memory, the exact maximum limit of an array is 2^32 -1 or 4294967295
	// Code from : http://4umi.com/web/javascript/array.php
	$max_smilies = 4294967295;

	$sql = 'SELECT *
		FROM ' . SMILIES_TABLE . '
		ORDER BY smiley_order';
	$result = $db->sql_query_limit($sql, $max_smilies, 0, 3600);

	$smilies = array();
	while ($row = $db->sql_fetchrow($result))
	{
		if (empty($smilies[$row['smiley_url']]))
		{
			$smilies[$row['smiley_url']] = $row;
		}
	}
	$db->sql_freeresult($result);

	if (sizeof($smilies))
	{
		global $template;
		global $config, $phpbb_root_path;

		$root_path = (defined('PHPBB_USE_BOARD_URL_PATH') && PHPBB_USE_BOARD_URL_PATH) ? generate_board_url() . '/' : $phpbb_root_path;

		foreach ($smilies as $row)
		{
			$template->assign_block_vars('wysiwym_smiley', array(
				'SMILEY_CODE'	=> $row['code'],
				'A_SMILEY_CODE'	=> addslashes($row['code']),
				'SMILEY_IMG'	=> $root_path . $config['smilies_path'] . '/' . $row['smiley_url'],
				'SMILEY_WIDTH'	=> $row['smiley_width'],
				'SMILEY_HEIGHT'	=> $row['smiley_height'],
				'SMILEY_DESC'	=> $row['emotion'])
			);
		}
	}

	unset($smilies);
}

?>