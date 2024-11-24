class UsersController < ApplicationController
  before_action :authenticate_user!

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
end
