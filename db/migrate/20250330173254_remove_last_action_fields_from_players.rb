class RemoveLastActionFieldsFromPlayers < ActiveRecord::Migration[7.1]
  def change
    remove_column :players, :last_action_name, :string
    remove_column :players, :last_action_timestamp, :datetime
  end
end
