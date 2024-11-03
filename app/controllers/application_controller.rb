class ApplicationController < ActionController::Base
  skip_before_action :verify_authenticity_token
  
  layout 'application'

  protected

  def after_sign_in_path_for(_resource)
    'http://localhost:5173'
  end

  def after_sign_up_path_for(_resource)
    'http://localhost:5173'
  end
end
