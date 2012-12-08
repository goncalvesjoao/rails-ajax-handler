/*!
 * rails-ajax-handler.js v0.3 - 07 December, 2012
 * By João Gonçalves (http://goncalvesjoao.github.com)
 * Hosted on https://github.com/goncalvesjoao/rails-ajax-handler
 * Licensed under MIT ("expat" flavour) license.
 */

var ajaxe_prefix = 'ajaxe';
var ajaxe_error_wrapper_html = 'span';
var ajaxe_error_wrapper_class = 'label label-important';

function ajaxe_show_error_messages(model_name, errors) {
  var errors_string = [];

  $('.ajax_error_message').remove();

  $.each(errors, function(key, value) {
    var input = $('input[name="' + model_name + '[' + key + ']"]');
    if (input.length > 0) {
      input.after('<' + ajaxe_error_wrapper_html + ' class="ajax_error_message ' + ajaxe_error_wrapper_class + '">' + value.join('<br/>') + '</' + ajaxe_error_wrapper_html + '>');
    }
    errors_string.push('\n' + key + ': ' + value.join(', '));
  });

  //alert(model_name + ' has errors!' + errors_string.join());
}

function ajaxe_get_callback(self_object, callback_sufix) {
  var default_callback = $(self_object).data(ajaxe_prefix) + '_' + callback_sufix;
  var custom_callback = $(self_object).data(ajaxe_prefix + '_' + callback_sufix);

  if (window[custom_callback] != undefined) {
    return custom_callback;
  } else if (window[default_callback] != undefined) {
    return default_callback;
  } else {
    return 'focus';
  }
}

function ajaxe_initialize() {
  var ajaxed_objects = ($('[data-remote][data-' + ajaxe_prefix + ']').length > 0) ? $('[data-remote][data-' + ajaxe_prefix + ']') : null;

  if (ajaxed_objects) {
    ajaxed_objects.live('ajax:beforeSend', function(event, xhr, settings) {
      window[ajaxe_get_callback(this, 'beforesend')](event, xhr, settings);
      window[ajaxe_get_callback(this, 'ajax_start')](event, xhr, settings);
      window.console.log('beforesend');
    });
    
    ajaxed_objects.live('ajax:success', function(event, data, status, xhr) {
      if ($(this).data('type') == 'html' && $(this).data(ajaxe_prefix + '-replace') != undefined) {
        $($(this).data(ajaxe_prefix + '-replace')).html(data);
      }
      window[ajaxe_get_callback(this, 'success')](event, data, status, xhr);
      window[ajaxe_get_callback(this, 'ajax_stop')](event, data, status, xhr);
      window.console.log('success');
    });

    ajaxed_objects.live('ajax:complete', function(event, xhr, status) {
      window[ajaxe_get_callback(this, 'complete')](event, xhr, status);
      window[ajaxe_get_callback(this, 'ajax_stop')](event, xhr, status);
      window.console.log('complete');
    });
    
    ajaxed_objects.live('ajax:error', function(event, xhr, status, error) {
      if ($(this).data('type') == 'json' && $(this).data(ajaxe_prefix + '-show-errors') != undefined) {
        ajaxe_show_error_messages($(this).data(ajaxe_prefix + '-show-errors'), $.parseJSON(xhr.responseText));
      }
      window[ajaxe_get_callback(this, 'error')](event, xhr, status, error);
      window[ajaxe_get_callback(this, 'ajax_stop')](event, xhr, status, error);
      window.console.log('error');
    });
  }
}

jQuery(document).ready(function($) { ajaxe_initialize(); });
