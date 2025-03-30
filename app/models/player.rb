class Player < ApplicationRecord
  belongs_to :game
  belongs_to :user

  def add_card(card)
    self.hand ||= []
    # logger.debug("Player hand before adding card: #{self.hand.inspect}")

    if self.hand.none? { |existing_card| existing_card['id'] == card['id'] }
      self.hand << card
      save
      # logger.debug("Card added: #{card.inspect}")
    else
      # logger.debug("Duplicate detected, not adding #{card.inspect}")
    end
  end
end
