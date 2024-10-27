class CreateGames < ActiveRecord::Migration[7.1]
  def change
    create_table :games do |t|
      t.jsonb :game_state
      t.integer :turn

      t.timestamps
    end
  end
end
