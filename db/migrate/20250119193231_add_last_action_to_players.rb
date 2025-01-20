class AddLastActionToPlayers < ActiveRecord::Migration[7.1]
  def change
    add_column :players, :last_action_name, :string
    add_column :players, :last_action_timestamp, :datetime
  end
end
