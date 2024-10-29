class GameChannel < ApplicationCable::Channel
  def subscribed
    Rails.logger.info("Subscription params: #{params.inspect}")
    @game = Game.find(params[:game_id])
    if @game
      stream_from "game_#{params[:game_id]}"
      puts "Subscribed to game_#{@game.id}"
      ActionCable.server.broadcast("game_#{params[:game_id]}", { message: 'welcome' })
    else
      puts "Game not found for ID: #{params[:game_id]}"
      reject
    end
  rescue ActiveRecord::RecordNotFound => e
    puts "Error finding game: #{e.message}"
    reject
  end

  def draw_card(data)
    Rails.logger.debug("GameChannel draw_card called with data: #{data}")
    logger.info "Broadcasting to game_#{params[:game_id]} with data: #{data}"

    @game = Game.find(params[:game_id])
    @player = Player.find(data['player_id'])

    drawn_card = @game.game_state['deck'].sample

    Rails.logger.debug("drawn card: #{drawn_card}")

    @game.game_state['drawn_card'] = drawn_card
    @game.game_state['deck'].delete(drawn_card)

    @game.save

    broadcast_message = {
      action: 'card_drawn',
      player_id: @player.id,
      card: @game.reload.game_state['drawn_card'],
      game_state: @game.reload.game_state
    }

    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  end

  def discard_card(data)
    @game = Game.find(params[:game_id])
    @player = Player.find(data['player_id'])

    @game.game_state['discard_pile'] << @game.game_state['drawn_card']
    @game.save

    broadcast_message = {
      action: 'card_discarded',
      player_id: @player.id,
      discard_pile: @game.reload.game_state['discard_pile'],
      game_state: @game.reload.game_state
    }

    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def update(_data)
    ActionCable.server.broadcast("game_#{@game.id}", { state: @game.game_state })
  end
end
