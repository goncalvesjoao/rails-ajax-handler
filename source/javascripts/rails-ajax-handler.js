/*!
 * rails-ajax-handler.js v1.5b - 14 January, 2012
 * By João Gonçalves (http://goncalvesjoao.github.com)
 * Hosted on https://github.com/goncalvesjoao/rails-ajax-handler
 * Licensed under MIT license.
 */

;(function ($, window, document, undefined) {
  
  $.RailsAjaxHandler = {
    settings: {},

    init: function(options) {
      var old_prefix = $.RailsAjaxHandler.settings["prefix"];
      var defaults = {
        prefix: '',
        debug: false,
        animation: true,
        spinner: '<div />',
        auto_redirect: true,
        action: "replace_html",
        spinner_wrapper: '<div />',
        error_message_wrapper: '<span class="field_with_errors" />',
        error_fields_wrapper: '<div class="field_with_errors" />',
        animate_target_begin: function (animation_target) { $(animation_target).css('opacity', 0.35); },
        animate_target_end: function (animation_target) { $(animation_target).fadeTo('fast', 1); }
      }
      $.RailsAjaxHandler.settings = $.extend({}, defaults, options);
      var rah_prefix = $.RailsAjaxHandler.settings.prefix;

      if (old_prefix != rah_prefix) {
        var selector = '[data-remote][data-' + rah_prefix + 'handler]';
        if (old_prefix != undefined) $(document).off('.rails-ajax-handler');
        
        $(document).on('ajax:beforeSend.rails-ajax-handler', selector, function(event, xhr, settings) {
          ajax_beforesend(get_data_to_handle(this), event, xhr, settings);
        });
        
        $(document).on('ajax:success.rails-ajax-handler', selector, function(event, data, status, xhr) {
          ajax_success(get_data_to_handle(this), event, data, status, xhr);
        });
        
        $(document).on('ajax:error.rails-ajax-handler', selector, function(event, xhr, status, error) {
          ajax_error(get_data_to_handle(this), event, xhr, status, error);
        });

        $(document).on('ajax:complete.rails-ajax-handler', selector, function(event, xhr, status) {
          ajax_complete(get_data_to_handle(this), event, xhr, status);
        });
      }

      rah_debug('function: bind_rails_ujs_ajax_events');
    },

    destroy: function() {
      $(document).off('.rails-ajax-handler');
      $.RailsAjaxHandler.settings = {};
    },
    
    spinner_animation_start: function(animation_target) {
      var animation_target_obj = $(animation_target);
      var animation_target_class = animation_target[0] == '.' || animation_target[0] == '#' ? animation_target.substr(1) : animation_target;

      if (animation_target != 'body') {
        var wrapper = $($.RailsAjaxHandler.settings.spinner_wrapper).addClass('rah_general_spinner_container ' + animation_target_class + '_particular_spinner_container');
        var spinner = $($.RailsAjaxHandler.settings.spinner).addClass('rah_general_spinner ' + animation_target_class + '_particular_spinner');
        var clear_div = '<div class="' + animation_target_class + '_particular_clear_div" style="clear:both;"></div>';

        animation_target_obj.each(function(index) {
          if ($(this).css('position') == 'static') {
            $(this).wrap(wrapper).before(spinner).after(clear_div);
          } else {
            $(this).append(spinner);
          }
        });
        $.RailsAjaxHandler.settings.animate_target_begin(animation_target);
        spinner.show();
      } else {
        var body_spinner = $($.RailsAjaxHandler.settings.spinner).attr('id', 'rah_body_spinner');

        animation_target_obj.prepend(body_spinner);
        body_spinner.show();
      }
    },

    spinner_animation_end: function(animation_target) {
      var animation_target_class = animation_target[0] == '.' || animation_target[0] == '#' ? animation_target.substr(1) : animation_target;

      if (animation_target != 'body') {
        $(animation_target).each(function(index) {
          if ($(this).parent().hasClass('rah_general_spinner_container')) {
            $(this).unwrap();
          }
        });

        $.RailsAjaxHandler.settings.animate_target_end(animation_target);
        $('.' + animation_target_class + '_particular_spinner').remove();
        $('.' + animation_target_class + '_particular_clear_div').remove();
      } else {
        $('#rah_body_spinner').remove();
      }
    },

    clear_error_messages: function() {
      $('.rah_error_message').remove();
      $('.rah_error_wrapped').removeClass('rah_error_wrapped').unwrap();
    },

    show_error_messages: function(model_name, errors) {
      $.RailsAjaxHandler.clear_error_messages();

      var settings = $.RailsAjaxHandler.settings;
      var errors_string = [];
      var wrap_fields = (settings.error_fields_wrapper != '' && settings.error_fields_wrapper != null);

      $.each(errors, function(key, value) {
        var input = $('input[name="' + model_name + '[' + key + ']"]'), input_label = null;
        var error_message = $(settings.error_message_wrapper);
        error_message.addClass('rah_error_message').html(value.join('<br/>'));

        if (input.length > 0) {
          input_label = $('label[for="' + input.attr('id') + '"]');
          if (wrap_fields) {
            input.wrap(settings.error_fields_wrapper).addClass('rah_error_wrapped');
            input.parent().after(error_message);
          } else {
            input.after(error_message);
          }
        }
        if (input_label != null && input_label.length > 0 && wrap_fields) {
          input_label.wrap(settings.error_fields_wrapper).addClass('rah_error_wrapped');
        }
        errors_string.push(key + ': ' + value.join(', '));
      });
      rah_debug(model_name + ' has the following errors:\n' + errors_string.join('\n'));
    }

  }

  function ajax_beforesend(data_to_handle, event, xhr, settings) {
    $.RailsAjaxHandler.clear_error_messages();
    eval(get_callback(data_to_handle, 'beforesend') + '(xhr, settings)');
    spinner_animation_start(data_to_handle);
    eval(get_callback(data_to_handle, 'ajax_start') + '(xhr, settings)');

    rah_debug('function: ajax_beforesend');
  }

  function ajax_success(data_to_handle, event, data, status, xhr) {
    var skip_animation = false;
    if (data_to_handle.type == 'html' && data_to_handle.target != undefined) {
      if (data_to_handle.action == 'replace_html') {
        $(data_to_handle.target).html(data);
      } else if (data_to_handle.action == 'replace_with') {
        spinner_animation_end(data_to_handle);
        $(data_to_handle.target).replaceWith(data);
        skip_animation = true;
      } else if (data_to_handle.action == 'append') {
        $(data_to_handle.target).append(data);
      } else if (data_to_handle.action == 'prepend') {
        $(data_to_handle.target).prepend(data);
      }
      rah_debug('html action: ' + data_to_handle.action);
    }
    //if (data_to_handle.type == 'json' && data_to_handle.auto_redirect) {
    if (data_to_handle.auto_redirect) {
      if (xhr.getResponseHeader('Location')) {
        window.location.href = xhr.getResponseHeader('Location');
        skip_animation = true;
        rah_debug('redirect to: ' + xhr.getResponseHeader('Location'));
      }
    }
    eval(get_callback(data_to_handle, 'success') + '(data, status, xhr)');
    if (!skip_animation) spinner_animation_end(data_to_handle);
    eval(get_callback(data_to_handle, 'ajax_stop') + '(data, status, xhr)');

    rah_debug('function: ajax_success');
  }

  function ajax_error(data_to_handle, event, xhr, status, error) {
    if (data_to_handle.type == 'json' && data_to_handle.show_errors) {
      var data = $.parseJSON(xhr.responseText);
      $.RailsAjaxHandler.show_error_messages(data_to_handle.show_errors, data.errors != null ? data.errors : data);
    } else if (data_to_handle.type == 'html' && data_to_handle.requester != undefined) {
      $(data_to_handle.requester).html(xhr.responseText);
    }
    eval(get_callback(data_to_handle, 'error') + '(xhr, status, error)');
    spinner_animation_end(data_to_handle);
    eval(get_callback(data_to_handle, 'ajax_stop') + '(xhr, status, error)');

    rah_debug('function: ajax_error');
  }

  function ajax_complete(data_to_handle, event, xhr, status) {
    rah_debug('function: ajax_complete');
  }

  function spinner_animation_start(data_to_handle) {
    if (!data_to_handle.animation || data_to_handle.animation == 'stop') return;
    
    $.RailsAjaxHandler.spinner_animation_start(data_to_handle.animation_target);
    if (data_to_handle.animation_requester != data_to_handle.animation_target) {
      $.RailsAjaxHandler.spinner_animation_start(data_to_handle.animation_requester);
    }

    rah_debug('function: spinner_animation_begin');
  }
  
  function spinner_animation_end(data_to_handle) {
    if (!data_to_handle.animation || data_to_handle.animation == 'start') return;

    $.RailsAjaxHandler.spinner_animation_end(data_to_handle.animation_target);
    if (data_to_handle.animation_requester != data_to_handle.animation_target) {
      $.RailsAjaxHandler.spinner_animation_end(data_to_handle.animation_requester);
    }

    rah_debug('function: spinner_animation_end');
  }

  function rah_debug(message) {
    if ($.RailsAjaxHandler.settings.debug) {
      window.console.log(message);
    }
  }
  
  function get_callback(data_to_handle, callback_sufix) {
    var default_callback = data_to_handle.handler + '_' + callback_sufix;
    return (eval("typeof " + default_callback + " == 'function'")) ? default_callback : 'focus';
  }

  function get_data(object_to_handle, suffix, default_value) {
    var data = $(object_to_handle).data($.RailsAjaxHandler.settings.prefix + suffix);
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

  function get_data_to_handle(object_to_handle) {
    var handler = get_data(object_to_handle, 'handler');
    if (handler == true) handler = $(object_to_handle).attr('id');
    var target = get_data(object_to_handle, 'target', handler);
    var requester = get_data(object_to_handle, 'requester', target);
    
    if (handler != undefined) {
      if (handler[0] == "#" || handler[0] == ".") handler = handler.substr(1);
      if (target != 'body' && target[0] != "#" && target[0] != ".") target = '#' + target;
      if (requester != 'body' && requester[0] != "#" && requester[0] != ".") requester = '#' + requester;
    }

    return {
      target: target,
      handler: handler,
      requester: requester,
      object_to_handle: object_to_handle,
      type: get_data(object_to_handle, 'type', 'js'),
      action: get_data(object_to_handle, 'action', $.RailsAjaxHandler.settings.action),
      show_errors: get_data(object_to_handle, 'show-errors', false),
      animation: get_data(object_to_handle, 'animation', $.RailsAjaxHandler.settings.animation),
      animation_target: get_data(object_to_handle, 'animation-target', target || 'body'),
      animation_requester: get_data(object_to_handle, 'animation-requester', requester || 'body'),
      auto_redirect: get_data(object_to_handle, 'auto-redirect', $.RailsAjaxHandler.settings.auto_redirect)
    }
  }

})(jQuery, window, document);

jQuery(document).ready(function($) { $.RailsAjaxHandler.init(); });