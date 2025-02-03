class ApplicationController < ActionController::Base
  skip_before_action :verify_authenticity_token

  layout 'application'

  protect_from_forgery with: :exception

  # before_filter :configure_permitted_parameters, if: :devise_controller?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: %i[username email password])
    devise_parameter_sanitizer.permit(:account_update, keys: %i[username email password current_password])
  end

  def after_sign_in_path_for(_resource)
    if Rails.env.production?
      'https://gawlf.fly.dev'
    else
      'http://localhost:5173'
    end
  end

  def after_sign_up_path_for(_resource)
    if Rails.env.production?
      'https://gawlf.fly.dev'
    else
      'http://localhost:5173'
    end
  end
end
