/*!
 * rails-ajax-handler.js v0.4.0 - 15 December, 2012
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

  var debug = prefix = error_message = error_fields = spinner = defaults = null;

  this.resetOptions = function() {
    debug = false;
    prefix = '';
    error_message = {
      wrapper_html: 'span',
      wrapper_class: 'field_with_errors'
    }
    error_fields = {
      wrapper_html: 'div',
      wrapper_class: 'field_with_errors',
      wrap: true
    }
    spinner = {
      html_tag: 'div',
      class: '',
      min_zindex: 100,
      wrapper_html: 'div',
      wrapper_class: ''
    }
    defaults = {
      action: "replace_html",
      animation: true
    }
  }

  this.setOptions = function(_options) {
    var old_prefix = prefix;

    debug = (_options["debug"] != undefined) ? _options["debug"] : debug;
    prefix = _options["prefix"] || prefix;
    error_message = {
      wrapper_html: (_options["error_message"] && _options["error_message"]["wrapper_html"]) || error_message.wrapper_html,
      wrapper_class: (_options["error_message"] && _options["error_message"]["wrapper_class"]) || error_message.wrapper_class
    }
    error_fields = {
      wrapper_html: (_options["error_fields"] && _options["error_fields"]["wrapper_html"]) || error_fields.wrapper_html,
      wrapper_class: (_options["error_fields"] && _options["error_fields"]["wrapper_class"]) || error_fields.wrapper_class,
      wrap: (_options["error_fields"] && _options["error_fields"]["wrap"] != undefined) ? _options["error_fields"]["wrap"] : error_fields.wrap
    }
    spinner = {
      html_tag: (_options["spinner"] && _options["spinner"]["html_tag"]) || spinner.html_tag,
      class: (_options["spinner"] && _options["spinner"]["class"]) || spinner.class,
      min_zindex: (_options["spinner"] && _options["spinner"]["min_zindex"] != undefined) ? _options["spinner"]["min_zindex"] : spinner.min_zindex,
      wrapper_html: (_options["spinner"] && _options["spinner"]["wrapper_html"]) || spinner.wrapper_html,
      wrapper_class: (_options["spinner"] && _options["spinner"]["wrapper_class"]) || spinner.wrapper_class
    }
    defaults = {
      action: (_options["defaults"] && _options["defaults"]["action"] != undefined) ? _options["defaults"]["action"] : defaults.action,
      animation: (_options["defaults"] && _options["defaults"]["animation"] != undefined) ? _options["defaults"]["animation"] : defaults.animation,
    }

    if (old_prefix != prefix) bind_rails_ujs_ajax_events();
  }

  this.clear_error_messages = function() {
    $('.rah_error_message').remove();
    $('.rah_error_wrapped').removeClass('rah_error_wrapped').unwrap();
  }

  this.show_error_messages = function(model_name, errors) {
    clear_error_messages();

    var errors_string = [];
    $.each(errors, function(key, value) {
      var input = $('input[name="' + model_name + '[' + key + ']"]');
      var input_label = null;
      var message_html = '<' + error_message.wrapper_html + ' class="rah_error_message ' + error_message.wrapper_class + '">' + value.join('<br/>') + '</' + error_message.wrapper_html + '>';
      var error_wrapper_html = '<' + error_fields.wrapper_html + ' class="' + error_fields.wrapper_class + '" />';

      if (input.length > 0) {
        input_label = $('label[for="' + input.attr('id') + '"]');
        if (error_fields.wrap) {
          input.wrap(error_wrapper_html).addClass('rah_error_wrapped');
          input.parent().after(message_html);
        } else {
          input.after(message_html);
        }
      }
      if (input_label != null && input_label.length > 0 && error_fields.wrap) {
        input_label.wrap(error_wrapper_html).addClass('rah_error_wrapped');
      }
      errors_string.push(key + ': ' + value.join(', '));
    });
    if (debug) window.console.log(model_name + ' has the following errors:\n' + errors_string.join('\n'));
  }

  this.spinner_animation_start = function(data_to_handle) {
    if (!data_to_handle.animation || data_to_handle.animation == 'stop') return;

    var container_html = '<' + spinner.wrapper_html + ' class="rah_general_spinner_container ' + data_to_handle.handler + '_particular_spinner_container ' + spinner.wrapper_class + '" style="position: relative;" />';
    var spinner_html_part1 = '<' + spinner.html_tag + ' class="rah_general_spinner ' + data_to_handle.handler + '_particular_spinner ' + spinner.class + '" style="z-index: ';
    var spinner_html_part2 = ';"></div>';
    var clear_div = '<div class="' + data_to_handle.handler + '_particular_clear_div" style="clear:both;"></div>';
    var animation_target_obj = $(data_to_handle.animation_target);

    if (data_to_handle.animation_target != 'body') {
      animation_target_obj.each(function(index) {
        var zindex = spinner.min_zindex;
        var object_zindex = parseInt($(this).css('z-index'));
        zindex = (!isNaN(object_zindex) && object_zindex > 0) ? (object_zindex + 10) : zindex;

        $(this).wrap(container_html).before(spinner_html_part1 + zindex + spinner_html_part2).after(clear_div);
      });

      animation_target_obj.css('opacity', 0.35);
      $('.' + data_to_handle.handler + '_particular_spinner').show();
    } else {
      animation_target_obj.prepend('<div id="rah_body_spinner"></div>');
      $('#rah_body_spinner').show();
    }
    if (debug) window.console.log('function: spinner_animation_start');
  }
  
  this.spinner_animation_stop = function(data_to_handle) {
    if (!data_to_handle.animation || data_to_handle.animation == 'start') return;

    if (data_to_handle.animation_target != 'body') {
      $(data_to_handle.animation_target).each(function(index) {
        if ($(this).parent().hasClass('rah_general_spinner_container')) {
          $(this).unwrap();
        }
      });

      $(data_to_handle.animation_target).fadeTo('fast', 1);
      $('.' + data_to_handle.handler + '_particular_spinner').remove();
      $('.' + data_to_handle.handler + '_particular_clear_div').remove();
    } else {
      $('#rah_body_spinner').remove();
    }
    if (debug) window.console.log('function: spinner_animation_stop');
  }

  var get_callback = function(data_to_handle, callback_sufix) {
    var default_callback = data_to_handle.handler + '_' + callback_sufix;
    return (window[default_callback] != undefined) ? default_callback : 'focus';
  }

  var get_data = function(object_to_handle, suffix, default_value) {
    var data = $(object_to_handle).data(prefix + suffix);
    if (data != undefined) {
      if (data == "true") {
        return true;
      } else if (data == "false") {
        return false;
      } else {
        return data;
      }
    } else {
      return default_value;
    }
  }

  var get_data_to_handle = function(object_to_handle) {
    var handler =  get_data(object_to_handle, 'handler');
    if (handler == true) handler = $(object_to_handle).attr('id');
    var target = get_data(object_to_handle, 'target', handler);
    if (handler != undefined) {
      if (handler[0] == "#" || handler[0] == ".") handler = handler.substr(1);
      if (target[0] != "#" && target[0] != ".") target = '#' + target;
    }

    var action = get_data(object_to_handle, 'action', defaults.action);
    var animation = get_data(object_to_handle, 'animation', defaults.animation);
    var animation_target = get_data(object_to_handle, 'animation-target', target || 'body');
    var show_errors = get_data(object_to_handle, 'show-errors', false);
    var type = get_data(object_to_handle, 'type', 'js');

    
    return {
      handler: handler,
      target: target,
      action: action,
      animation: animation,
      animation_target: animation_target,
      object_to_handle: object_to_handle,
      show_errors: show_errors,
      type: type
    }
  }

  this.ajax_beforesend = function(data_to_handle, event, xhr, settings) {
    clear_error_messages();
    window[get_callback(data_to_handle, 'beforesend')](xhr, settings);
    spinner_animation_start(data_to_handle);
    window[get_callback(data_to_handle, 'ajax_start')](xhr, settings);
    if (debug) window.console.log('function: ajax_beforesend');
  }

  this.ajax_success = function(data_to_handle, event, data, status, xhr) {
    if (data_to_handle.type == 'html' && data_to_handle.target != undefined) {
      if (data_to_handle.action == 'replace_html') {
        $(data_to_handle.target).html(data);
      } else if (data_to_handle.action == 'replace_with') {
        $(data_to_handle.target).replaceWith(data);
      } else if (data_to_handle.action == 'append') {
        $(data_to_handle.target).append(data);
      } else if (data_to_handle.action == 'prepend') {
        $(data_to_handle.target).prepend(data);
      }
      if (debug) window.console.log('action: ' + data_to_handle.action);
    }
    window[get_callback(data_to_handle, 'success')](data, status, xhr);
    spinner_animation_stop(data_to_handle);
    window[get_callback(data_to_handle, 'ajax_stop')](data, status, xhr);
    if (debug) window.console.log('function: ajax_success');
  }

  this.ajax_error = function(data_to_handle, event, xhr, status, error) {
    if (data_to_handle.type == 'json' && data_to_handle.show_errors) {
      var data = $.parseJSON(xhr.responseText);
      show_error_messages(data_to_handle.show_errors, data.errors != null ? data.errors : data);
    }
    window[get_callback(data_to_handle, 'error')](xhr, status, error);
    spinner_animation_stop(data_to_handle);
    window[get_callback(data_to_handle, 'ajax_stop')](xhr, status, error);
    if (debug) window.console.log('function: ajax_error');
  }

  this.bind_rails_ujs_ajax_events = function() {
    var objects_to_handle = ($('[data-remote][data-' + prefix + 'handler]').length > 0) ? $('[data-remote][data-' + prefix + 'handler]') : null;

    if (objects_to_handle) {
      objects_to_handle.live('ajax:beforeSend', function(event, xhr, settings) {
        RailsAjaxHandler().ajax_beforesend(get_data_to_handle(this), event, xhr, settings);
      });
      
      objects_to_handle.live('ajax:success', function(event, data, status, xhr) {
        RailsAjaxHandler().ajax_success(get_data_to_handle(this), event, data, status, xhr);
      });
      
      objects_to_handle.live('ajax:error', function(event, xhr, status, error) {
        RailsAjaxHandler().ajax_error(get_data_to_handle(this), event, xhr, status, error);
      });
    }
    if (debug) window.console.log('function: bind_rails_ujs_ajax_events');
  }

  this.resetOptions();
  this.setOptions(options);
  this.bind_rails_ujs_ajax_events();
} // RailsAjaxHandler

jQuery(document).ready(function($) { RailsAjaxHandler(); });
