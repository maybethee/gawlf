class RoundSetupService
  def initialize(game)
    @game = game
  end

  def setup_hole
    @game.reload
    @game.update!(game_state: initial_game_state)

    if @game.hole.nil? || @game.hole.zero?
      @game.update!(hole: 1)
    else
      @game.update!(hole: @game.hole + 1)
    end

    deck = @game.game_state['deck']
    raise 'Deck is empty' if deck.empty?

    reset_players
    setup_turn_order

    Player.find_by(id: @game.current_player_id).name
  end

  private

  def initial_game_state
    deck = generate_deck

    # game begins with a card face-up in the discard pile
    first_discard = deck.sample
    deck.delete(first_discard)
    first_discard[:visibility] = 'revealed'

    {
      deck:,
      discard_pile: [first_discard],
      drawn_card: {}
    }
  end

  def generate_deck
    main_suits = %w[♠︎ ♣︎ ♥︎ ♦︎]
    ranks = %w[A 2 3 4 5 6 7 8 9 10 J Q K]

    deck = main_suits.product(ranks).map.with_index(1) do |(suit, rank), id|
      { id:, suit:, rank:, visibility: 'hidden' }
    end

    # add two "joker" cards with a new suit
    deck.concat([
                  { id: 53, suit: '★', rank: '★', visibility: 'hidden' },
                  { id: 54, suit: '★', rank: '★', visibility: 'hidden' }
                ])

    deck
  end

  def reset_players
    # @game.players.update_all(last_action_name: nil, last_action_timestamp: nil)

    @game.reload

    @game.players.each do |player|
      player['hand'] = []
      deal_hand(player)
      player.save!
    end

    @game.save!
  end

  def deal_hand(player)
    @player = player

    6.times do
      drawn_card = @game.game_state['deck'].sample
      @player.add_card(drawn_card)
      @game.game_state['deck'].reject! { |card| card['id'] == drawn_card['id'] }
    end

    @game.save
  end

  def setup_turn_order
    # use random order for the first round, and rotate for subsequent rounds
    new_turn_order = if @game.hole == 1
                       @game.players.pluck(:id).shuffle
                     else
                       @game.turn_order.rotate(1)
                     end

    @game.update!(
      turn_order: new_turn_order,
      current_player_id: new_turn_order.first
    )

    @game.game_state['turn_order'] = new_turn_order
    @game.save!
  end
end
