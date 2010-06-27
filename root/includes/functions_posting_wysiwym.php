<?php
/**
* @package: phpBB 3.0.7-PL1 :: WYSIWYM Markdown editor -> root/styles/prosilver/template
* @version: $Id: functions_posting_wysiwym.php, [BETA] 1.0.1 2010/06/26 10:06:26 leviatan21 Exp $
* @copyright: (c) 2010 leviatan21 < info@mssti.com > (Gabriel) http://www.mssti.com/phpbb3/
* @license: http://opensource.org/licenses/gpl-license.php GNU Public License
* @author: leviatan21 - http://www.phpbb.com/community/memberlist.php?mode=viewprofile&u=345763
* 
**/

/**
* @ignore
*/
if (!defined('IN_PHPBB'))
{
	exit;
}
define('IN_WYSIWYM', true);

/**
* Set custom bbcodes to the live preview
*	We run a similar query here, 
* 	but just load all custom bbcodes
* 	not only for those bbcodes that my be displayed as buttons
* Also force to load MOD files and the MOD itself
**/
function setup_wysiwym_editor()
{
	global $mode;

	// For the moment, we only use the wysiwym editor in posting.php
	if (in_array($mode, array('post', 'reply', 'quote', 'edit')))
	{
		$wmode = 'post';
	}
	else
	{
		return;
	}

	global $cache, $db, $template, $user, $auth, $config, $forum_id, $phpbb_root_path, $phpEx;

	// HTML, BBCode, Smilies, Images and Flash status
	if ($wmode == 'post')
	{
		$forum_id		= isset($forum_id) ? $forum_id : 0;
		$bbcode_status	= ($config['allow_bbcode'] && $auth->acl_get('f_bbcode', $forum_id)) ? true : false;
		$smilies_status	= ($config['allow_smilies'] && $auth->acl_get('f_smilies', $forum_id)) ? true : false;
		$img_status		= ($bbcode_status && $auth->acl_get('f_img', $forum_id)) ? true : false;
		$url_status		= ($config['allow_post_links']) ? true : false;
		$flash_status	= ($bbcode_status && $auth->acl_get('f_flash', $forum_id) && $config['allow_post_flash']) ? true : false;
		$quote_status	= true;
	}

	$server_url = generate_board_url();
	$wmatch = array('\n', '\t', '/', '+|&amp;)+');
	$wreplace = array("\\n", "\\t", "\/", ')');
	
	$template->assign_vars(array(
		'S_LIVE_REVIEW'			=> (isset($config['wysiwym_enable'])) ? $config['wysiwym_enable'] : true,
		'W_SYNTAX_HIGHLIGHT'	=> (isset($config['wysiwym_syntax_highlight'])) ? $config['wysiwym_syntax_highlight'] : 1,
		'W_DISPLAY_WARN'		=> (isset($config['wysiwym_display_warning'])) ? $config['wysiwym_display_warning'] : 0,
		'W_BLOCK_HEIGHT'		=> (isset($config['wysiwym_height'])) ? $config['wysiwym_height'] : 200,
		'W_MAX_QUOTE_DEPTH'		=> (int) $config['max_quote_depth'],
		'W_MIN_CHARS_LIMIT'		=> (int) $config['min_post_chars'],
		'W_MAX_CHARS_LIMIT'		=> (int) $config['max_post_chars'],
		'W_MAX_SMILIES_LIMIT'	=> (int) $config['max_post_smilies'],
		'W_MAX_URL_LIMIT'		=> (int) $config['max_post_urls'],
		'W_MAX_FONT_SIZE'		=> (int) $config['max_post_font_size'],
		'W_MAX_IMG_HEIGHT'		=> (int) $config['max_post_img_height'],
		'W_MAX_IMG_WIDTH'		=> (int) $config['max_post_img_width'],
		'W_ATTACH_ICON_IMG'		=> $user->img('icon_topic_attach', ''),
		'W_ATTACH_U_FILE'		=> append_sid($phpbb_root_path . 'download/file.' . $phpEx, 'mode=view&amp;id=%1$d'),

		'W_VIEW_IMAGES'			=> ($user->optionget('viewimg')) ? 1 : 0,
		'W_VIEW_FLASH'			=> ($user->optionget('viewflash')) ? 1 : 0,
		'W_VIEW_SMILIES'		=> ($user->optionget('viewsmilies')) ? 1 : 0,

		'W_BBCODE_STATUS'		=> ($bbcode_status) ? 1 : 0,
		'W_SMILIES_STATUS'		=> ($smilies_status) ? 1 : 0,
		'W_BBCODE_IMG'			=> ($img_status) ? 1 : 0,
		'W_BBCODE_URL'			=> ($url_status) ? 1 : 0,
		'W_BBCODE_FLASH'		=> ($flash_status) ? 1 : 0,
		'W_BBCODE_QUOTE'		=> ($quote_status) ? 1 : 0,
		/* Transform php regexp into JavaScript regexp - Start */
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
		// Parse custom bbcodes -
		'TOKEN_URL_EMAIL'		=> str_replace("\\", '\\\\', str_replace($wmatch, $wreplace, get_preg_expression('email'))),
		'TOKEN_URL_FULL'		=> str_replace("\\", '\\\\', str_replace($wmatch, $wreplace, get_preg_expression('url'))),
		/* Transform php regexp into JavaScript regexp - End */
	));

	$extensions = $cache->obtain_attach_extensions($forum_id);
	foreach ($extensions as $extension => $data)
	{
		if (isset($data['allow_group']) && $data['allow_group'])
		{
			$template->assign_block_vars('wysiwym_attach_extensions', array(
				'EXTENSION' => $extension,
				'CATEGORY' => $data['display_cat'],
			));
		}
	}

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
}

?>