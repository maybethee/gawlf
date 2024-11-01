class SessionsController < ApplicationController
  before_action :authenticate_user!

  def show

    if current_user

      render json: { user: current_user }, status: :ok
    else
      render json: { user: nil }, status: :unauthorized
    end
  end
end
