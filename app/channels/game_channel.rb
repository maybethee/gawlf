class GameChannel < ApplicationCable::Channel
  def subscribed
    # stream_from "some_channel"
    @game = Game.find(params[:id])

    if @game
      stream_from "game_#{@game.id}"
      puts "Subscribed to game_#{@game.id}"
    else
      puts "Game not found for ID: #{params[:id]}"
      reject
    end
  rescue ActiveRecord::RecordNotFound => e
    puts "Error finding game: #{e.message}"
    reject
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def update(_data)
    ActionCable.server.broadcast("game_#{@game.id}", { state: @game.game_state })
  end
end
