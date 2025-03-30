class GameChannel < ApplicationCable::Channel
  # subscription methods
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

  def unsubscribed
    Rails.logger.info "GameChannel unsubscribed for game_id #{@game.id}"
  end

  def update
    ActionCable.server.broadcast("game_#{@game.id}", { state: @game.game_state })
  end

  # game/round setup actions
  def setup_game
    # guards against any inconsistencies when multiple games played in a row
    @game.update!(hole: 0, the_day_that: '')

    broadcast_message = {
      action: 'game_setup',
      current_hole: @game.hole,
      game_state: @game.game_state
    }

    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  end

  def setup_hole
    current_player_name = RoundSetupService.new(@game).setup_hole

    broadcast_message = {
      action: 'hole_setup',
      players: @game.players,
      current_player_name:,
      current_hole: @game.hole,
      game_state: @game.game_state
    }

    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  end

  def reveal_cards(data)
    @player = Player.find(data['player_id'])

    updated_hand = PlayerActionService.new(@game, @player).reveal_cards(data)

    broadcast_message = {
      action: 'card_revealed',
      players: @game.reload.players,
      player: @player.reload,
      revealed_cards: updated_hand.select { |card| card['visibility'] == 'revealed' },
      game_state: @game.reload.game_state
    }

    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  end

  # main gameplay actions
  def draw_card(data)
    # Rails.logger.debug("GameChannel draw_card called with data: #{data}")
    @game.reload
    @player = Player.find(data['player_id'])

    PlayerActionService.new(@game, @player).draw_card

    broadcast_message = {
      action: 'card_drawn',
      player_id: @player.id,
      game_state: @game.game_state
    }

    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  end

  def swap_card(data)
    Rails.logger.debug("GameChannel swap_card called with data: #{data}")

    @game = Game.find(params[:game_id])

    relevant_players = get_relevant_players(@game, data['player_id'])

    @player = relevant_players[data['player_id']]
    PlayerActionService.new(@game, @player).swap_card(data)

    curr_round_scores, all_round_scores, summary_update =
      TurnManagementService.new(
        @game, @player, relevant_players[@game.next_player_id]
      ).handle_turn_transition

    broadcast_message = {
      action: 'card_swapped',
      players: @game.players,
      player: @player,
      hole: @game.hole,
      current_player_id: @game.current_player_id,
      current_player_name: relevant_players[@game.current_player_id].name,
      game_state: @game.game_state,
      curr_round_scores:,
      all_round_scores:,
      summary_update:
    }

    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  end

  def discard_card(data)
    relevant_players = get_relevant_players(@game, data['player_id'])
    @player = relevant_players[data['player_id']]

    PlayerActionService.new(@game, @player).discard_card

    TurnManagementService.new(@game, @player, relevant_players[@game.next_player_id]).update_turn

    broadcast_message = {
      action: 'card_discarded',
      player_id: @player.id,
      current_player_id: @game.current_player_id,
      current_player_name: relevant_players[@game.current_player_id].name,
      game_state: @game.game_state
    }

    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  end

  # miscelaneous actions
  def record_day(data)
    @game.reload
    @game.update!(the_day_that: data['the_day_that'])

    broadcast_message = {
      action: 'day_recorded',
      the_day_that: @game.the_day_that
    }

    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  end

  def play_audio(data)
    ActionCable.server.broadcast(
      "game_#{params[:game_id]}",
      {
        action: 'audio_played',
        audio_clip: data['audio_clip']
      }
    )
  end

  private

  def broadcast_error(message)
    ActionCable.server.broadcast("game_#{@game.id}", { action: 'error', message: })
  end

  def get_relevant_players(game, player_id)
    relevant_player_ids = [player_id, game.next_player_id].compact
    Player.where(id: relevant_player_ids).index_by(&:id)
  end
end
