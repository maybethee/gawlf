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

    @game.reload

    @player = Player.find(data['player_id'])

    drawn_card = @game.game_state['deck'].sample
    drawn_card['visibility'] = 'revealed'

    Rails.logger.debug("drawn card: #{drawn_card}")

    updated_game_state = @game.game_state.deep_dup
    updated_game_state['drawn_card'] = drawn_card
    updated_game_state['deck'].delete(drawn_card)

    @game.update!(game_state: updated_game_state)

    broadcast_message = {
      action: 'card_drawn',
      player_id: @player.id,
      card: drawn_card,
      game_state: @game.reload.game_state
    }

    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  end

  def swap_card(data)
    @player = Player.find(data['player_id'])
    @game.reload

    if data['swap_origin'] == 'deck'
      updated_hand = @player.hand.map do |hand_card|
        if data['card_to_swap']['rank'] == hand_card['rank'] && data['card_to_swap']['suit'] == hand_card['suit']
          hand_card = @game.game_state['drawn_card']
          hand_card['visibility'] = 'revealed'
        end
        hand_card
      end
    else
      updated_hand = @player.hand.map do |hand_card|
        if data['card_to_swap']['rank'] == hand_card['rank'] && data['card_to_swap']['suit'] == hand_card['suit']
          hand_card = @game.game_state['discard_pile'].pop
          hand_card['visibility'] = 'revealed'
        end
        hand_card
      end
    end

    @player.hand = updated_hand
    @player.save!

    @game.game_state['discard_pile'] << data['card_to_swap']

    reconstitute_deck if @game.game_state['deck'].empty?

    @game.save

    curr_round_scores = nil
    all_round_scores = nil
    # end round if player's hand is all revealed
    if all_revealed?(@player.hand)
      curr_round_scores = @game.calculate_scores(@game.hole)
      Rails.logger.debug("round scores calculated: #{curr_round_scores}")
      Rails.logger.debug('now updating stats...')
      @game.update_stats(curr_round_scores, @game.hole)
      # finalize game if last hole
      if @game.reload.hole == 2
        all_round_scores = @game.all_round_scores
        Rails.logger.debug("finalizing game, all round scores: #{all_round_scores.inspect}")
        summary_update = @game.update_summary
        Rails.logger.debug("summary update: #{summary_update.inspect}")
        all_round_scores
      else
        curr_round_scores
      end
    end

    Rails.logger.debug("\n\nCurr round scores? #{curr_round_scores}")
    Rails.logger.debug("\n\nAll round scores? #{all_round_scores}")

    # see if i need to ignore this at round/game end or if it's fine to leave it
    next_player_id = @game.next_player.id
    @game.update!(current_player_id: next_player_id)

    Rails.logger.debug("current player id: #{@game.current_player_id}")

    current_player_name = Player.find_by(id: @game.current_player_id).name

    broadcast_message = {
      action: 'card_swapped',
      players: @game.reload.players,
      player: @player.reload,
      hole: @game.reload.hole,
      current_player_id: @game.reload.current_player_id,
      current_player_name:,
      discard_pile: @game.reload.game_state['discard_pile'],
      updated_player_hand: @player.reload.hand,
      game_state: @game.reload.game_state,
      curr_round_scores:,
      all_round_scores:
    }

    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  end

  def discard_card(data)
    @player = Player.find(data['player_id'])
    @game.reload

    updated_game_state = @game.game_state.deep_dup
    updated_game_state['discard_pile'] << @game.game_state['drawn_card']

    @game.update!(game_state: updated_game_state)

    reconstitute_deck if @game.game_state['deck'].empty?

    next_player_id = @game.next_player.id
    @game.update!(current_player_id: next_player_id)

    current_player_name = Player.find_by(id: @game.current_player_id).name
    broadcast_message = {
      action: 'card_discarded',
      player_id: @player.id,
      discard_pile: @game.reload.game_state['discard_pile'],
      current_player_id: @game.reload.current_player_id,
      current_player_name:,
      game_state: @game.reload.game_state
    }

    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  end

  def setup_game
    @game.reload
    @game.hole = 0
    @game.save!

    broadcast_message = {
      action: 'game_setup',
      current_hole: @game.reload.hole,
      game_state: @game.reload.game_state
    }

    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  end

  def setup_hole(data)
    @game.reload
    @game.update!(game_state: initial_game_state)
    @game.update!(hole: @game.hole += 1)

    Rails.logger.debug("game current hole: #{@game.hole}")

    @game.players.all.each do |player|
      player['hand'] = []
      deal_hand(player)
    end

    # eventually, have some sort of way for players to decide who goes first manually? and if none chosen then pick random?
    first_player_id = if @game.hole > 1
                        prev_first_player_id = data['prev_first_player_id']
                        @game.update!(current_player_id: prev_first_player_id)
                        @game.reload.next_player.id
                      else
                        @game.players.pluck(:id).sample
                      end

    Rails.logger.debug("random player: #{first_player_id.inspect}")
    @game.update!(current_player_id: first_player_id)

    current_player_name = Player.find_by(id: @game.current_player_id).name

    # Rails.logger.debug("updated game: #{@game.inspect}")
    broadcast_message = {
      action: 'hole_setup',
      players: @game.reload.players,
      current_player_id: @game.reload.current_player_id,
      current_player_name:,
      current_hole: @game.reload.hole,
      game_state: @game.reload.game_state
    }

    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  end

  def reveal_cards(data)
    @player = Player.find(data['player_id'])

    Rails.logger.debug "Initial hand state: #{@player.hand}"

    updated_hand = @player.hand.map do |hand_card|
      if data['cards'].any? { |card| card['rank'] == hand_card['rank'] && card['suit'] == hand_card['suit'] }
        hand_card['visibility'] = 'revealed'
      end
      hand_card
    end

    @player.hand = updated_hand
    @player.save!

    Rails.logger.debug "Hand state after save: #{@player.reload.hand}"

    broadcast_message = {
      action: 'card_revealed',
      players: @game.reload.players,
      player: @player.reload,
      revealed_cards: updated_hand.select { |card| card['visibility'] == 'revealed' },
      game_state: @game.reload.game_state
    }

    Rails.logger.debug("broadcast message: #{broadcast_message.inspect}")

    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  end

  def record_day(data)
    @game.reload
    @game.update!(the_day_that: data['the_day_that'])

    broadcast_message = {
      action: 'day_recorded',
      the_day_that: @game.reload.the_day_that
    }

    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  end

  def deal_hand(player)
    @player = player

    6.times do
      drawn_card = @game.game_state['deck'].sample
      @player.add_card(drawn_card)
      @game.game_state['deck'].delete(drawn_card)
    end

    @game.save
  end

  def all_revealed?(hand)
    hand.all? { |card| card['visibility'] == 'revealed' }
  end

  def initial_game_state
    initial_state = {
      deck: [].tap do |cards|
        %w[♠︎ ♣︎ ♥︎ ♦︎].each do |suit|
          %w[A 2 3 4 5 6 7 8 9 10 J Q K].each do |rank|
            cards << { suit:, rank:, visibility: 'hidden' }
          end
        end
        cards << { suit: '★', rank: '★', visibility: 'hidden' }
        cards << { suit: '★', rank: '★', visibility: 'hidden' }
      end,
      discard_pile: [],
      drawn_card: {}
    }

    first_discard = initial_state[:deck].sample
    first_discard[:visibility] = 'revealed'

    initial_state[:discard_pile] << first_discard
    initial_state[:deck].delete(first_discard)

    initial_state

    # small test deck
    # {
    #   deck: [].tap do |cards|
    #     %w[♠︎ ♣︎ ♥︎ ♦︎].each do |suit|
    #       %w[A 2 3].each do |rank|
    #         cards << { suit:, rank:, visibility: 'hidden' }
    #       end
    #     end
    #   end,
    #   discard_pile: [],
    #   drawn_card: {}
    # }
    #
    # first_discard = initial_state[:deck].sample
    # first_discard[:visibility] = 'revealed'

    # initial_state[:discard_pile] << first_discard
    # initial_state[:deck].delete(first_discard)

    # initial_state
  end

  def reconstitute_deck
    @game.reload

    remaining_discarded_card = @game.game_state['discard_pile'].pop

    reconstituted_deck = @game.game_state['discard_pile']
    reconstituted_deck.each { |card| card['visibility'] = 'hidden' }

    updated_game_state = @game.game_state.deep_dup
    updated_game_state['discard_pile'] = [remaining_discarded_card]
    updated_game_state['deck'] = reconstituted_deck

    # Rails.logger.debug("\n\n\n\ngame_state after reconstituting from discard pile: #{updated_game_state.inspect}")

    @game.update!(game_state: updated_game_state)
  end

  def fetch_joined_players
    @game = Game.find(params[:game_id])

    Rails.logger.debug("Game's players: #{@game.reload.players.inspect}")

    broadcast_message = {
      action: 'players_fetched',
      player_names: @game.reload.players
    }

    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
    # Rails.logger.info "GameChannel unsubscribed for game_id #{@game.id}"
  end

  def update(_data)
    ActionCable.server.broadcast("game_#{@game.id}", { state: @game.game_state })
  end
end
