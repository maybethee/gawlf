class PlayerActionService
  def initialize(game, player)
    @game = game
    @player = player
  end

  def reveal_cards(data)
    # match passed selected cards in data with existing cards in hand to reveal them
    updated_hand = @player.hand.map do |hand_card|
      hand_card['visibility'] = 'revealed' if data['cards'].any? { |card| card['id'] == hand_card['id'] }

      hand_card
    end

    @player.hand = updated_hand
    @player.save!

    updated_hand
  end

  def draw_card
    drawn_card = draw_random_card(@game)
    update_drawn_card_and_deck(@game, drawn_card)
    drawn_card
  end

  def swap_card(data)
    @player.reload

    @player.hand = swap_card_in_hand(@player, data['card_to_swap'], data['swap_origin'], @game.game_state)

    discarded_card = data['card_to_swap']
    @game.game_state['discard_pile'] << discarded_card

    reconstitute_deck if @game.game_state['deck'].empty?

    @player.save!
    @game.save!
  end

  def discard_card
    updated_game_state = @game.game_state.deep_dup
    updated_game_state['discard_pile'] << @game.game_state['drawn_card']

    @game.update!(game_state: updated_game_state)

    reconstitute_deck if @game.game_state['deck'].empty?

    @player.save!
    @game.save!
  end

  private

  def draw_random_card(game)
    drawn_card = game.game_state['deck'].sample
    drawn_card['visibility'] = 'revealed'
    drawn_card
  end

  def update_drawn_card_and_deck(game, drawn_card)
    updated_game_state = game.game_state.deep_dup
    updated_game_state['drawn_card'] = drawn_card
    updated_game_state['deck'].delete(drawn_card)

    game.update!(game_state: updated_game_state)
  end

  def swap_card_in_hand(player, card_to_swap, swap_origin, game_state)
    new_card = swap_origin == 'deck' ? game_state['drawn_card'] : game_state['discard_pile'].pop
    new_card['visibility'] = 'revealed'

    player.hand.map { |card| card['id'] == card_to_swap['id'] ? new_card : card }
  end

  def reconstitute_deck
    @game.reload

    # last discarded card should still be available
    remaining_discarded_card = @game.game_state['discard_pile'].pop

    reconstituted_deck = @game.game_state['discard_pile']
    reconstituted_deck.each { |card| card['visibility'] = 'hidden' }

    updated_game_state = @game.game_state.deep_dup
    updated_game_state['discard_pile'] = [remaining_discarded_card]
    updated_game_state['deck'] = reconstituted_deck

    @game.update!(game_state: updated_game_state)
  end
end
