class AddUserConfigToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :user_config, :jsonb, default: {}
  end
end
