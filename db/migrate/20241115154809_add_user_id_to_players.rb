class AddUserIdToPlayers < ActiveRecord::Migration[7.1]
  def change
    add_column :players, :user_id, :bigint
    add_index :players, :user_id
    add_foreign_key :players, :users
  end
end
