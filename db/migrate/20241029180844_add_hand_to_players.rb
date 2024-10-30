class AddHandToPlayers < ActiveRecord::Migration[7.1]
  def change
    add_column :players, :hand, :jsonb, default: [], null: false
  end
end
