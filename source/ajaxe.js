/*!
 * ajaxe.js v0.1 - 06 December, 2012
 * By João Gonçalves (http://goncalvesjoao.github.com)
 * Hosted on https://github.com/goncalvesjoao/rails-ajaxe
 * Licensed under MIT ("expat" flavour) license.
 */

jQuery(document).ready(function($) {
	
	$('[data-remote][data-ajaxe]').live('ajax:beforeSend', function(event, data) {
    if ($(this).data('beforesend') != undefined) window[$(this).data('beforesend')]();
  });

  $('[data-remote][data-ajaxe]').live('ajax:success', function(event, data) {
    $($(this).data('replace')).html(data);
    if ($(this).data('complete') != undefined) window[$(this).data('complete')]();
  });

  $('[data-remote][data-ajaxe]').live('ajax:error', function(event, data) {
    if ($(this).data('complete') != undefined) window[$(this).data('complete')]();
  });
  
});
