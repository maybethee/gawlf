class Player < ApplicationRecord
  belongs_to :game

  def add_card(card)
    self.hand ||= []

    self.hand << card
    save
  end
end
