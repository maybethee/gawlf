class AddTheDayThatToGames < ActiveRecord::Migration[7.1]
  def change
    add_column :games, :the_day_that, :string
  end
end
