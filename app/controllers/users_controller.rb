class UsersController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :authenticate_user!, except: :update_config

  def show
    @user = User.includes(:game_stats).find(params[:id])
    response_data = {
      user: {
        id: @user.id,
        username: @user.username
      },
      games: @user.games.map do |game|
        {
          id: game.id,
          the_day_that: game.the_day_that,
          summary: game.summary,
          created_at: game.created_at,
          updated_at: game.updated_at
        }
      end
    }
    Rails.logger.debug("Response data: #{response_data.to_json}")
    render json: response_data
  end

  def update_config
    Rails.logger.debug "Received parameters: #{params.inspect}"

    @user = User.find_by(id: params[:user_id])
    Rails.logger.debug "User found: #{@user.inspect}"

    if @user.guest
      render json: { message: 'User is a guest, not updating anything' }, status: :forbidden
    elsif @user.update!(user_config: params[:user_config])
      render json: @user, status: :ok
    else
      render json: { error: @user&.errors&.full_messages || ['User not found'] }, status: :unprocessable_entity
    end
  end
end
