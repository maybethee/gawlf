class LobbiesController < ApplicationController
  skip_before_action :verify_authenticity_token, only: %i[create join status update_status]

  def create
    user_id = params[:user_id]

    game = Game.create!(
      lobby_code: generate_unique_code,
      lobby_created_at: Time.current,
      game_state: {},
      hole: 0,
      creator_id: user_id
    )

    render json: { message: 'Lobby created', game_id: game.id, lobby_code: game.lobby_code, creator_id: game.creator_id }
  end

  def join
    game = Game.find_by(lobby_code: params[:lobby_code])

    Rails.logger.debug("passed lobby code: #{params[:lobby_code]}")
    Rails.logger.debug("found game: #{game.inspect}")

    if game && game.status == 'waiting'
      render json: { message: 'Joined lobby', game_id: game.id, creator_id: game.creator_id }
    else
      render json: { error: 'Lobby not found or already started' }, status: :not_found
    end
  end

  def status
    game = Game.find_by(lobby_code: params[:lobby_code])
    render json: { status: game.status }
  end

  def update_status
    game = Game.find_by(lobby_code: params[:lobby_code])
    game.update
  end

  private

  def generate_unique_code
    SecureRandom.hex(3)
  end
end
