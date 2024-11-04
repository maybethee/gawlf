class PlayersController < ApplicationController
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
    @player = @game.players.create(player_params)

    if @player.save
     ActionCable.server.broadcast("game_#{@game.id}", { action: "player_joined", player: @player })
      render json: @player, status: :created
    else
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
    @player = Player.find(params[:player_id])
  end

  def player_params
    params.require(:player).permit(:name, :game_id, hand: [])
  end
end
