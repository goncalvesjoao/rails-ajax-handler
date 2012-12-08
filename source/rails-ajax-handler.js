/*!
 * rails-ajax-handler.js v0.2.1 - 08 December, 2012
 * By João Gonçalves (http://goncalvesjoao.github.com)
 * Hosted on https://github.com/goncalvesjoao/rails-ajax-handler
 * Licensed under MIT ("expat" flavour) license.
 */

function RailsAjaxHandler(options) {
  if (options == undefined) options = {};

  if (arguments.callee._singletonInstance) {
    arguments.callee._singletonInstance.setOptions(options);
    return arguments.callee._singletonInstance;
  } else {
    arguments.callee._singletonInstance = this;
  }

  this.debug = true;
  this.handler_prefix = 'handler';
  this.error_message = {
    wrapper_html: 'span',
    wrapper_class: 'label label-important'
  }
  this.error_fields = {
    wrapper_html: 'div',
    wrapper_class: 'field_with_errors',
    wrap: true
  }

  this.setOptions = function(_options) {
    debug = (_options["debug"] != undefined) ? _options["debug"] : debug;
    handler_prefix = _options["handler_prefix"] || handler_prefix;
    error_message = {
      wrapper_html: (_options["error_message"] && _options["error_message"]["wrapper_html"]) || error_message.wrapper_html,
      wrapper_class: (_options["error_message"] && _options["error_message"]["wrapper_class"]) || error_message.wrapper_class
    }
    error_fields = {
      wrapper_html: (_options["error_fields"] && _options["error_fields"]["wrapper_html"]) || error_fields.wrapper_html,
      wrapper_class: (_options["error_fields"] && _options["error_fields"]["wrapper_class"]) || error_fields.wrapper_class,
      wrap: (_options["error_fields"] && _options["error_fields"]["wrap"] != undefined) ? _options["error_fields"]["wrap"] : error_fields.wrap
    }
  }

  this.clear_error_messages = function() {
    $('.' + handler_prefix + '_error_message').remove();
    $('.' + handler_prefix + '_error_wrapped').removeClass(handler_prefix + '_error_wrapped').unwrap();
  }

  this.show_error_messages = function(model_name, errors) {
    clear_error_messages();

    var errors_string = [];
    $.each(errors, function(key, value) {
      var input = $('input[name="' + model_name + '[' + key + ']"]');
      var input_label = null;
      var message_html = '<' + error_message.wrapper_html + ' class="' + handler_prefix + '_error_message ' + error_message.wrapper_class + '">' + value.join('<br/>') + '</' + error_message.wrapper_html + '>';
      var error_wrapper_html = '<' + error_fields.wrapper_html + ' class="' + error_fields.wrapper_class + '" />';

      if (input.length > 0) {
        input_label = $('label[for="' + input.attr('id') + '"]');
        if (error_fields.wrap) {
          input.wrap(error_wrapper_html).addClass(handler_prefix + '_error_wrapped');
          input.parent().after(message_html);
        } else {
          input.after(message_html);
        }
      }
      if (input_label != null && input_label.length > 0 && error_fields.wrap) {
        input_label.wrap(error_wrapper_html).addClass(handler_prefix + '_error_wrapped');
      }
      errors_string.push(key + ': ' + value.join(', '));
    });
    if (debug) window.console.log(model_name + ' has the following errors:\n' + errors_string.join('\n'));
  }

  var get_callback = function(object_to_handle, callback_sufix) {
    var default_callback = $(object_to_handle).data(handler_prefix) + '_' + callback_sufix;
    return (window[default_callback] != undefined) ? default_callback : 'focus';
  }

  this.ajax_beforesend = function(object_to_handle, event, xhr, settings) {
    clear_error_messages();
    window[get_callback(object_to_handle, 'beforesend')](xhr, settings);
    window[get_callback(object_to_handle, 'ajax_start')](xhr, settings);
    if (debug) window.console.log('beforesend');
  }

  this.ajax_success = function(object_to_handle, event, data, status, xhr) {
    if ($(object_to_handle).data('type') == 'html' && $(object_to_handle).data(handler_prefix + '-replace') != undefined) {
      $($(object_to_handle).data(handler_prefix + '-replace')).html(data);
    }
    window[get_callback(object_to_handle, 'success')](data, status, xhr);
    window[get_callback(object_to_handle, 'ajax_stop')](data, status, xhr);
    if (debug) window.console.log('success');
  }

  this.ajax_error = function(object_to_handle, event, xhr, status, error) {
    if ($(object_to_handle).data('type') == 'json' && $(object_to_handle).data(handler_prefix + '-show-errors') != undefined) {
      show_error_messages($(object_to_handle).data(handler_prefix + '-show-errors'), $.parseJSON(xhr.responseText));
    }
    window[get_callback(object_to_handle, 'error')](xhr, status, error);
    window[get_callback(object_to_handle, 'ajax_stop')](xhr, status, error);
    if (debug) window.console.log('error');
  }
  
  this.ajax_complete = function(object_to_handle, event, xhr, status) {
    window[get_callback(object_to_handle, 'complete')](xhr, status);
    window[get_callback(object_to_handle, 'ajax_stop')](xhr, status);
    if (debug) window.console.log('complete');
  }

  this.bind_rails_ujs_ajax_events = function() {
    var objects_to_handle = ($('[data-remote][data-' + handler_prefix + ']').length > 0) ? $('[data-remote][data-' + handler_prefix + ']') : null;

    if (objects_to_handle) {
      objects_to_handle.live('ajax:beforeSend', function(event, xhr, settings) {
        RailsAjaxHandler().ajax_beforesend(this, event, xhr, settings);
      });
      
      objects_to_handle.live('ajax:success', function(event, data, status, xhr) {
        RailsAjaxHandler().ajax_success(this, event, data, status, xhr);
      });
      
      objects_to_handle.live('ajax:error', function(event, xhr, status, error) {
        RailsAjaxHandler().ajax_error(this, event, xhr, status, error);
      });

      objects_to_handle.live('ajax:complete', function(event, xhr, status) {
        RailsAjaxHandler().ajax_complete(this, event, xhr, status);
      });
    }
  } // bind_rails_ujs_ajax_events

  this.setOptions(options);
  this.bind_rails_ujs_ajax_events();
} // RailsAjaxHandler

jQuery(document).ready(function($) { RailsAjaxHandler(); });
