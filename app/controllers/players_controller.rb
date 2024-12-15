class PlayersController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:create]

  before_action :find_player, only: %i[show update destroy]

  # GET /players
  def index
    @game = Game.find(params[:game_id])
    @players = @game.players

    render json: @players
  end

  # GET /players/1
  def show
    render json: @player
  end

  # POST /players
  def create
    Rails.logger.debug "Received parameters: #{params.inspect}"
    @game = Game.find(params[:game_id])
    @player = @game.players.build(player_params)

    if @player.save
      ActionCable.server.broadcast("game_#{@game.id}",
                                   { action: 'player_joined',
                                     player: @player.as_json(only: %i[name game_id user_id hand]) })
      render json: @player, status: :created
    else
      Rails.logger.debug "Player save errors: #{@player.errors.full_messages}"
      render json: @player.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /players/1
  def update
    if @player.update(player_params)
      render json: @player
    else
      render json: @player.errors, status: :unprocessable_entity
    end
  end

  # DELETE /players/1
  def destroy
    @player.destroy!
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def find_player
    @player = Player.find(params[:id])
  end

  def player_params
    params.require(:player).permit(:name, :game_id, :user_id, hand: [])
  end
end
