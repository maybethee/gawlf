class Player < ApplicationRecord
  belongs_to :game
  belongs_to :user

  def add_card(card)
    self.hand ||= []

    self.hand << card
    save
  end
end
