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

    if @player.last_action_name == 'draw_card'
      Rails.logger.warn("Player #{@player.id} attempted to draw a card again without another action")

      return ActionCable.server.broadcast("game_#{@game.id}", {
                                            action: 'error',
                                            message: 'Cannot draw a card again without first performing another action'
                                          })
    end

    drawn_card = @game.game_state['deck'].sample
    drawn_card['visibility'] = 'revealed'

    Rails.logger.debug("drawn card: #{drawn_card}")

    updated_game_state = @game.game_state.deep_dup
    updated_game_state['drawn_card'] = drawn_card
    updated_game_state['deck'].delete(drawn_card)

    @game.update!(game_state: updated_game_state)

    @player.update!(
      last_action_name: 'draw_card',
      last_action_timestamp: Time.current
    )

    
    broadcast_message = {
      action: 'card_drawn',
      player_id: @player.id,
      card: drawn_card,
      game_state: @game.reload.game_state
    }
    

    Rails.logger.debug("#{@player.name} drew #{drawn_card}, and their last_action_name was set to: #{@player.last_action_name} at #{@player.last_action_timestamp}. broadcasting the broadcast_message now.")
    
    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  end

  def swap_card(data)
    Rails.logger.debug("GameChannel swap_card called with data: #{data}")

    # @player = Player.lock.find(data['player_id'])
    broadcast_message = nil
    ActiveRecord::Base.transaction do
      @game = Game.find(params[:game_id])
      @player = Player.find(data['player_id'])

      if @game.previous_player_id
        previous_player = Player.find(@game.previous_player_id)
        previous_player.update!(last_action_name: nil)
      end

      if @player.last_action_name == 'swap_card'
        Rails.logger.warn("Player #{@player.id} attempted to swap a card multiple times in the same turn")

        return ActionCable.server.broadcast("game_#{@game.id}", {
                                              action: 'error',
                                              message: 'Cannot swap more than once per turn'
                                            })
      end

      # Rails.logger.debug("card to swap: #{data['card_to_swap']}")

      # Rails.logger.debug("origin: #{data['swap_origin']}")

      new_card = if data['swap_origin'] == 'deck'
                   @game.game_state['drawn_card']
                 else
                   @game.game_state['discard_pile'].pop
                 end
      new_card['visibility'] = 'revealed'

      updated_hand = @player.hand.map do |card|
        # Rails.logger.debug("mapping over player hand:\n\ncard: #{card['id']} #{card['rank']} #{card['suit']}\n\ncard to swap: #{data['card_to_swap']}")
        if card['id'] == data['card_to_swap']['id']
          new_card
        else
          card
        end
      end

      @player.update!(hand: updated_hand)

      discarded_card = data['card_to_swap']
      @game.game_state['discard_pile'] << discarded_card

      reconstitute_deck if @game.game_state['deck'].empty?

      @player.update!(
        last_action_name: 'swap_card',
        last_action_timestamp: Time.current
      )

      @player.save!
      @game.save!

      curr_round_scores = nil
      all_round_scores = nil
      # end round if player's hand is all revealed
      if all_revealed?(@player.hand)
        curr_round_scores = @game.calculate_scores(@game.hole)
        Rails.logger.debug("round scores calculated: #{curr_round_scores}")
        Rails.logger.debug('now updating stats...')
        @game.update_stats(curr_round_scores, @game.hole)
        # finalize game if last hole
        all_round_scores = @game.all_round_scores
        if @game.hole == 9
          Rails.logger.debug("finalizing game, all round scores: #{all_round_scores.inspect}")
          summary_update = @game.update_summary
          Rails.logger.debug("summary update: #{summary_update.inspect}")
          summary_update
        else
          curr_round_scores
        end
      end

      Rails.logger.debug("\n\nCurr round scores? #{curr_round_scores}")
      Rails.logger.debug("\n\nAll round scores? #{all_round_scores}")

      # see if i need to ignore this at round/game end or if it's fine to leave it
      next_player = @game.next_player

      @game.update!(
        previous_player_id: @game.current_player_id,
        current_player_id: next_player.id
      )

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
        all_round_scores:,
        summary_update:
      }
    end

    Rails.logger.debug "is hand unique? #{@player.hand.uniq! { |card| card['id'] }}"
    Rails.logger.debug "Hand before broadcast: #{@player.hand}"
    ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error("Failed to swap cards: #{e.message}")
  end

  def discard_card(data)
    @player = Player.find(data['player_id'])
    @game.reload

    if @game.previous_player_id
      previous_player = Player.find(@game.previous_player_id)
      previous_player.update!(last_action_name: nil)
    end

    if @player.last_action_name == 'discard_card'
      Rails.logger.warn("Player #{@player.id} attempted to discard a card multiple times in the same turn")

      return ActionCable.server.broadcast("game_#{@game.id}", {
                                            action: 'error',
                                            message: 'Cannot discard more than once per turn'
                                          })
    end

    updated_game_state = @game.game_state.deep_dup
    updated_game_state['discard_pile'] << @game.game_state['drawn_card']

    @game.update!(game_state: updated_game_state)

    reconstitute_deck if @game.game_state['deck'].empty?

    @player.update!(
      last_action_name: 'discard_card',
      last_action_timestamp: Time.current
    )

    next_player = @game.next_player

    @game.update!(
      previous_player_id: @game.current_player_id,
      current_player_id: next_player.id
    )

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

  def setup_hole(_data)
    @game = Game.lock.find(params[:game_id])
    Rails.logger.debug("Game hole before setup right after reload (should be 0): #{@game.hole.inspect}")

    Rails.logger.debug("Transaction start for game #{@game.id} at #{Time.current}")

    ActiveRecord::Base.transaction do
      @game.reload
      @game.update!(game_state: initial_game_state)

      Rails.logger.debug("\n\n\n\ninitialized deck: #{@game.game_state['deck']}")
      if @game.hole.nil? || @game.hole.zero?
        @game.update!(hole: 1)
      else
        @game.update!(hole: @game.hole + 1)
      end

      # Rails.logger.debug("game current hole (should be 1 on first round here): #{@game.hole.inspect}")

      deck = @game.game_state['deck']
      raise 'Deck is empty' if deck.empty?

      @game.players.each do |player|
        player.update!(last_action_name: nil, last_action_timestamp: nil)
      end

      # Rails.logger.debug("is hole greater than 1 here?? right before dealing hands: #{@game.hole.inspect}")

      @game.players.each do |player|
        player['hand'] = []
        deal_hand(player)
      end

      Rails.logger.debug("Deck before duplicate check: #{@game.game_state['deck'].map { |card| card['id'] }.inspect}")

      @game.players.each do |player|
        Rails.logger.debug("Player #{player.id} hand before duplicate check: #{player['hand'].map do |card|
                                                                                 card['id']
                                                                               end.inspect}")
      end

      # Rails.logger.debug("is hole greater than 1 here?? right before duplication check: #{@game.hole.inspect}")

      all_cards = @game.game_state['deck'] + @game.players.flat_map { |player| player['hand'] }
      seen_cards = {}
      all_cards.each do |card|
        card_id = card['id']
        if seen_cards[card_id]
          puts "\n\n\n\nDuplicate found: #{card_id}"
        else
          seen_cards[card_id] = true
        end
      end

      turn_order = if @game.hole == 1
                     @game.players.pluck(:id).shuffle
                   else
                     @game.turn_order.rotate(1)
                   end

      @game.update!(turn_order:)

      game_state = @game.game_state
      game_state['turn_order'] = turn_order
      @game.update!(game_state:)

      first_player_id = turn_order.first
      @game.update!(current_player_id: first_player_id)

      current_player_name = Player.find_by(id: @game.current_player_id).name

      # Rails.logger.debug("updated game: #{@game.inspect}")
      broadcast_message = {
        action: 'hole_setup',
        players: @game.reload.players,
        current_player_id: @game.reload.current_player_id,
        current_player_name:,
        # turn_order:,
        current_hole: @game.reload.hole,
        game_state: @game.reload.game_state
      }

      ActionCable.server.broadcast("game_#{@game.id}", broadcast_message)
    end
    Rails.logger.debug("Transaction end for game #{@game.id} at #{Time.current}")
  end

  def reveal_cards(data)
    @player = Player.find(data['player_id'])

    Rails.logger.debug "Initial hand state: #{@player.hand}"

    updated_hand = @player.hand.map do |hand_card|
      if data['cards'].any? do |card|
           card['rank'] == hand_card['rank'] && card['suit'] == hand_card['suit'] && card['id'] == hand_card['id']
         end
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
      Rails.logger.info("Deck before dealing: #{@game.game_state['deck'].map { |card| card['id'] }.inspect}")

      drawn_card = @game.game_state['deck'].sample

      Rails.logger.info("Drawn card: #{drawn_card['id']} - #{drawn_card['rank']}#{drawn_card['suit']}")

      @player.add_card(drawn_card)
      @game.game_state['deck'].reject! { |card| card['id'] == drawn_card['id'] }

      Rails.logger.info("Deck after dealing: #{@game.game_state['deck'].map { |card| card['id'] }.inspect}")

      Rails.logger.info("Dealing card #{drawn_card['id']}: #{drawn_card['rank']}#{drawn_card['suit']} from deck to player #{@player.id}: #{@player.name}.")
    end

    @game.save
  end

  def play_audio(data)
    ActionCable.server.broadcast("game_#{params[:game_id]}", {
                                   action: 'audio_played',
                                   audio_clip: data['audio_clip']
                                 })
  end

  def all_revealed?(hand)
    hand.all? { |card| card['visibility'] == 'revealed' }
  end

  def initial_game_state
    initial_state = {
      deck: [].tap do |cards|
        card_id = 1
        %w[♠︎ ♣︎ ♥︎ ♦︎].each do |suit|
          %w[A 2 3 4 5 6 7 8 9 10 J Q K].each do |rank|
            cards << { id: card_id, suit:, rank:, visibility: 'hidden' }
            card_id += 1
          end
        end
        cards << { id: card_id, suit: '★', rank: '★', visibility: 'hidden' }
        card_id += 1
        cards << { id: card_id, suit: '★', rank: '★', visibility: 'hidden' }
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
